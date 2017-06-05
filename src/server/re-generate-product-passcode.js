'use strict';

import Logger from '/imports/server/lib/logger';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';
import {
  sendEU501RegenerateAllProductPasscodes,
  sendEU502RegenerateProductPasscode
} from '/imports/server/email-actions.js';
import { retireRef } from '/imports/lib/shared/refs';

const checkPermissions = function checkPermissions(user, methodName) {
  if ( !user ||  (user && !(user.isBuyer())) ) {
    Logger.error(`[${methodName} - Error]`, `User[${user && user._id}] is not a buyer`);
    throw new Meteor.Error('unauthorized');
  }
};

const checkTicketOwnership = function checkTicketOwnership(buyerId, invoiceTicketId, methodName) {
  const invoice = InvoiceTickets.findOne({
    _id: invoiceTicketId,
    buyerId: buyerId
  });
  if (!invoice) {
    Logger.error(`[${methodName} - Error]`, `User[${buyerId}] is not the owner of the Ticket[${invoiceTicketId}]`);
    throw new Meteor.Error('unauthorized');
  }
  return invoice;
};

const regenerateProductPasscode = function(invoice, callerMethodName) {
  updateInvoiceTicket('regenerateProductPasscode', invoice);
  Logger.info(`[${callerMethodName} - Info]`, `Invoice[${invoice._id}] regenerated`);
};

export const regenerateAllProductPasscodes = function regenerateAllProductPasscodes(userId) {
  Logger.info('[regenerateAllProductPasscodes - Starting]', `User[${userId}]`);
  const user = Meteor.users.findOne(userId);
  checkPermissions(user, 'regenerateAllProductPasscodes');
  const updateInvoices = InvoiceTickets.find({
    buyerId: userId,
    state: 'receiptSent'
  });
  const numberOfUpdateInvoices = updateInvoices.fetch().length;
  Logger.info('[regenerateAllProductPasscodes - Info]', `${numberOfUpdateInvoices} invoices will be updated for Buyer[${userId}]`);
  updateInvoices.forEach(function regenerateProductCode(invoice) {
    regenerateProductPasscode(invoice, 'regenerateAllProductPasscodes');
  });
  Logger.info('[regenerateAllProductPasscodes - Finished]', `User[${userId}]`);
};

Meteor.methods({
  requestRegenerateAllProductPasscodes() {
    const user = Meteor.user();
    checkPermissions(user, 'requestRegenerateAllProductPasscodes');
    sendEU501RegenerateAllProductPasscodes(user);
  },
  requestRegenerateProductPasscode(invoiceTicketId) {
    check(invoiceTicketId, String);
    const user = Meteor.user();
    checkPermissions(user, 'requestRegenerateProductPasscode');
    const ticket = checkTicketOwnership(user._id, invoiceTicketId, 'requestRegenerateProductPasscode');
    if (ticket.state !== 'receiptSent') {
      Logger.error(`[requestRegenerateProductPasscode - Error]`, `User[${user._id}] is regenerating Ticket[${invoiceTicketId}] wich is in state:${ticket.state}`);
      throw new Meteor.Error('invalidTicketState');
    }
    sendEU502RegenerateProductPasscode(user, ticket);
  },
  confirmRegenerateAllProductPasscodes(refcode) {
    Logger.info('[confirmRegenerateAllProductPasscodes - Starting]', `Ref[${refcode}]`);
    check(refcode, String);
    const ref = Refs.findOne( {refcode: refcode, reftype: 're-generate-all'} );
    if (!ref || ! ref.isValid()) {
      Logger.info("[confirmRegenerateAllProductPasscodes - Error] - Invalid Refcode");
      throw new Meteor.Error('refCodeNotValid');
    }
    regenerateAllProductPasscodes(ref.userId);
    retireRef(refcode);
    Logger.info('[confirmRegenerateAllProductPasscodes - Success]', `Ref[${refcode}]`);
  },
  confirmRegenerateProductPasscode(refcode) {
    Logger.info('[confirmRegenerateProductPasscode - Starting]', `Ref[${refcode}]`);
    check(refcode, String);
    const ref = Refs.findOne( {refcode: refcode, reftype: 're-generate-one'} );
    if (!ref || ! ref.isValid()) {
      Logger.info("[confirmRegenerateProductPasscode - Error] - Invalid Refcode");
      throw new Meteor.Error('refCodeNotValid');
    }
    const updateInvoice = InvoiceTickets.findOne(ref.invoiceTicketId);
    regenerateProductPasscode(updateInvoice, 'regenerateProductPasscode');
    retireRef(refcode);
  }
});
