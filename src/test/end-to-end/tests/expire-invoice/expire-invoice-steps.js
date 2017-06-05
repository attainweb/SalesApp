import moment from 'moment';
import _ from 'lodash';
import { getMeteorSettings } from '/test/end-to-end/tests/_support/helpers';
import { waitForWorkerIsReady } from '/test/end-to-end/tests/_support/jobs';
import { stubDateNow } from '/test/end-to-end/tests/_support/helpers';

module.exports = function() {

  this.Before(function() {
    this.settings = getMeteorSettings();
  });

  this.Given(/^today is (.*)$/, function(dateStr) {
    const date = new Date(dateStr);
    this.today = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    stubDateNow(this.today);
  });

  this.Given(/^there is an (.*) with an (.*) with (.*) for (.+) days before/, function(buyerKey, state, paymentOption, days) {
    this.accounts.getUserByKey("approvedPartner");
    const buyer = this.accounts.getUserByKey(buyerKey, "approvedPartner");
    let invoiceTicket = this.invoices.createInvoice(paymentOption, state, buyer._id);
    // An invoiceSentBtc/Back state ticket could not have this fields setted
    invoiceTicket = _.omit(invoiceTicket,
        ['fundsReceived', 'satoshisReceived', 'satoshisReceivedAt', 'invoiceTransactionId', 'productAmount']);
    // Commissions must be deleted or the test will crash.
    delete invoiceTicket.commissions;
    this.invoiceTicket = this.invoices.saveInvoice(invoiceTicket);
    const invoiceId = this.invoiceTicket._id;
    const expireDate = moment(this.today).subtract(days, 'd').toDate();

    this.invoices.fakeInvoiceDate(invoiceId, 'invoiceSentAt', expireDate);
  });

  this.When(/^the app runs expiration process$/, function() {
    waitForWorkerIsReady('expireInvoiceWorker');
  });

  this.Then(/^that ticket receives the ([0-9]+)-confirmation notification$/, function(confirmations) {
    const payload = {
      satoshisReceived: this.invoiceTicket.satoshisExpected,
      invoiceAddress: this.invoiceTicket.btcAddress,
      transactionId: 'transactionId',
      confirmations: confirmations
    };
    server.execute((body) => {

      // Stub validation as this is a faker address
      Meteor.validateBitcoinAddress = function() { return true; };

      const context = {
        response: { end: () => { }, setHeader: () => { } },
        request: { body: body }
      };
      API.invoiceAddressReceivedBtc.bind(context)();
    }, payload);
  });

  this.Then(/^the ticket is expired$/, function() {
    const ticket = this.invoices.getInvoiceFromDB(this.invoiceTicket._id);
    expect(ticket.state).to.equal('invoiceExpired');
  });

  this.Then(/^the ticket is not expired$/, function() {
    const ticket = this.invoices.getInvoiceFromDB(this.invoiceTicket._id);
    expect(ticket.state).to.not.equal('invoiceExpired');
  });
};
