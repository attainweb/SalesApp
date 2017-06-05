'use strict';
import InvoiceBuilder from '/imports/lib/fixtures/invoice-builder.js';
import { getMeteorSettings } from '/test/end-to-end/tests/_support/helpers.js';
import faker from "faker";
import _ from 'lodash';
import { getSHA256 } from '/test/end-to-end/tests/_support/helpers';


const createInvoice = function(paymentOption, state, buyerId, usdAmount = faker.random.number()) {
  const invoiceBuilder = new InvoiceBuilder();

  const meteorSettings = getMeteorSettings();
  const dollarsPerProduct = meteorSettings.dollarsPerProduct;

  const cents = usdAmount * 100;
  return invoiceBuilder
    .withPaymentOption(paymentOption)
    .withState(state)
    .withBuyerId(buyerId)
    .withCentsRequested(cents)
    .withProductAmount(Math.floor(usdAmount / dollarsPerProduct))
    .withTranche(meteorSettings.public.salesLimits.currentTranche)
    .build();
};

const fakeInvoiceDate = function(ticketId, dateField, newDate) {
  const update = { '$set': {} };
  update.$set[`${dateField}`] = newDate;
  return InvoiceTickets.update({ '_id': ticketId }, update);
};

const insertInvoice = function(ticket) {
  const id = InvoiceTickets.insert(ticket);
  return InvoiceTickets.findOne({_id: id});
};

module.exports = function() {

  this.Before(function() {
    this.invoices = {};
    this.invoices.createInvoice = function(paymentOption, state, buyerId, usdAmount) {
      return createInvoice(paymentOption, state, buyerId, usdAmount);
    };
    this.invoices.saveInvoice = function(invoiceTicket) {
      return server.execute(insertInvoice, invoiceTicket);
    };
    this.invoices.createAndSave = function(paymentOption, state, buyerId, usdAmount) {
      return server.execute(insertInvoice, createInvoice(paymentOption, state, buyerId, usdAmount));
    };

    this.invoices.fakeInvoiceDate = function(ticketId, dateField, newDate) {
      return server.execute(fakeInvoiceDate, ticketId, dateField, newDate);
    };

    this.invoices.fakeSendReceipt = function(ticketId, productPasscode) {
      const hashedProductPasscode = getSHA256(productPasscode);
      return server.execute((id, hash) => {
        return InvoiceTickets.update({'_id': id }, { '$set': {productPasscodeHash: hash } });
      }, ticketId, hashedProductPasscode);
    };

    this.invoices.getInvoiceFromDB = function(invoiceTicketId, returnFields = {}) {
      return server.execute( (id, fields) => {
        return InvoiceTickets.findOne(id, { fields: fields});
      }, invoiceTicketId, returnFields);
    };

    this.stateMachine = server.execute(function() {
      return require('/imports/server/invoice-ticket-state-machine');
    });

    this.invoices.cancellableStates = this.stateMachine.preCancellableStates;
    this.invoices.nonCancellableStates = _.without(this.stateMachine.allStates, 'invoiceCanceled', ...this.invoices.cancellableStates);
    this.invoices.paidStates = server.execute(() => {
      return InvoiceTickets.paidStates;
    });
    this.invoices.distributorsCancelledStates = ['invoicePreCanceled', 'invoiceCanceled', 'invalidFundsRefunded', 'invoiceExpired'];
    this.invoices.unpaidStates = _.without(this.stateMachine.allStates, ...this.invoices.paidStates, ...this.invoices.distributorsCancelledStates);
  });

  this.Given(/^there is a invoice (.*) ticket with state (.*) and with status (.*) created/, function(paymentOption, state, status) {
    let buyerId = undefined;
    if (status === 'APPROVED') {
      buyerId = this.accounts.getUserByKey('approvedBuyer')._id;
    } else if (status === 'PENDING') {
      buyerId = this.accounts.getUserByKey('notApprovedBuyer')._id;
    }
    const invoice = this.invoices.createAndSave(paymentOption, state, buyerId);
    this.fixtures.invoices.push(invoice);
  });

  this.Given(/^there are cancellable tickets for (.*)/, function(reviewUserKey) {
    const user = this.accounts.getUserByKey(reviewUserKey);
    for (let i = 0; i < this.invoices.cancellableStates.length; i++) {
      server.execute(insertInvoice, createInvoice('Bank', this.invoices.cancellableStates[i], user._id, '1000'));
    }
  });

  this.Given(/^there are non-cancellable tickets for (.*)/, function(reviewUserKey) {
    const user = this.accounts.getUserByKey(reviewUserKey);
    for (let i = 0; i < this.invoices.nonCancellableStates.length; i++) {
      if (this.invoices.nonCancellableStates[i] !== 'invoicePreCanceled') {
        server.execute(insertInvoice, createInvoice('Bank', this.invoices.nonCancellableStates[i], user._id, '1000'));
      }
    }
  });

// TODO: Refactor this method and method in line 52 in order to avoid duplicity
  this.Given(/^there is a (.*) ticket with (.*) created for user (.*)$/, function(paymentMethod, ticketState, createdBuyer) {
    const buyerId = this.accounts.getUserByKey(createdBuyer)._id;
    this.testTicket = this.invoices.createAndSave(paymentMethod, ticketState, buyerId, 1000);
    this.fixtures.invoices.push(this.testTicket);
  });

  this.Given(/^I have a (.*) invoice ticket with state (.*) and with amount (.*)$/, function(paymentMethod, state, usdAmount) {
    this.testTicket = this.invoices.createAndSave(paymentMethod, state, this.user._id, usdAmount);
    this.fixtures.invoices.push(this.testTicket);
  });

  this.Given(/^(.*) has a (.*) invoice ticket with state (.*) and with amount (.*)$/, function(buyer, paymentMethod, state, usdAmount) {
    const buyerId = this.accounts.getUserByKey(buyer)._id;
    this.testTicket = this.invoices.createAndSave(paymentMethod, state, buyerId, usdAmount);
    this.fixtures.invoices.push(this.testTicket);
  });

  this.Given(/^there is no more PRODUCT available but sales is not reached$/, function() {
    const meteorSettings = getMeteorSettings();
    const totalAmountAvailable = meteorSettings.public.salesLimits.tranches[meteorSettings.public.salesLimits.currentTranche].totalAmountAvailable;
    this.invoices.createAndSave("Btc", "receiptSent", this.accounts.getUserByKey('productStorageBuyer')._id, totalAmountAvailable - 1);
    this.invoices.createAndSave("Btc", "invalidFundsReceived", this.accounts.getUserByKey('productStorageBuyer')._id, totalAmountAvailable);
  });

  this.Given(/^the sales goal has been reached$/, function() {
    const meteorSettings = getMeteorSettings();
    const totalAmountAvailable = meteorSettings.public.salesLimits.tranches[meteorSettings.public.salesLimits.currentTranche].totalAmountAvailable;
    this.invoices.createAndSave("Btc", "receiptSent", this.accounts.getUserByKey('productStorageBuyer')._id, totalAmountAvailable + 1);
  });

  this.Given(/^there is an expired ticket$/, function() {
    const buyerId = this.accounts.getUserByKey('approvedBuyer')._id;
    this.invoices.createAndSave("btc", "invoiceExpired", buyerId);
  });

};
