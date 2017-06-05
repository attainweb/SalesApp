import Logger from '/imports/server/lib/logger';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';
import { setInvoiceTicketFields } from '/imports/server/invoice-ticket-update-manager';
import { secureInvoicesOptionsByRole } from '/server/lib/invoice-tickets-publish-fields';
import { preCancellableStates } from '/imports/server/invoice-ticket-state-machine';

// {key -> stateTransition : value -> [Role]}
const managerStateTransitions = {
  'receiveFunds': ['admin', 'headInvoiceManager', 'bankManager'],
  'cancelFundsReceived': ['admin', 'headInvoiceManager', 'bankChecker'],
  'confirmFundsReceived': ['admin', 'headInvoiceManager', 'bankChecker'],
  'prepareTicket': ['admin', 'headInvoiceManager', 'exporter'],
  'cancelPreparedTicket': ['admin', 'headInvoiceManager', 'exporter'],
  'bundleTicket': ['admin', 'headInvoiceManager', 'exporter'],
  'finalizeBundledTicket': ['admin', 'headInvoiceManager', 'exporter'],
  'exportPayments': ['admin', 'headInvoiceManager', 'exporter'],
  'reviveInvoiceBank': ['admin'],
  'reviveInvoiceBtc': ['admin'],
  'preCancelInvoiceOnReject': ['compliance', 'chiefcompliance', 'headCompliance'],
  'preCancelInvoice': ['headCompliance'],
  'startSaleBank': ['headInvoiceManager'],
  'startSaleBtc': ['headInvoiceManager'],
  'approveInvalidTicket': ['headInvoiceManager'],
  'refundInvalidTicket': ['headInvoiceManager']
};

// security implemented as whitelist
const userHasPermission = function(userId, stateTransition) {
  let hasPermission = false;
  const validRoles = managerStateTransitions[stateTransition];
  if (validRoles !== undefined) {
    hasPermission = Roles.userIsInRole(userId, validRoles);
  }
  return hasPermission;
};

const throwUserUnauthorizedException = function(userId, event) {
  Logger.error(`User[${userId}] has no permission to ${event}`);
  throw new Meteor.Error('unauthorized');
};

// args: fieldName1, field1, fieldName2, field2...
const throwMeteorMethodException = function(methodName, errorName, errorMessage, ...args) {
  Logger.error(methodName + ": " + errorName + " : " + errorMessage + " -", ...args);
  throw new Meteor.Error(errorName, errorMessage);
};

const createManagerRecord = function(userId, stateTransition, ticket) {
  if (_.contains(Object.keys(managerStateTransitions), stateTransition)) {
    StateTransitionRecords.insert({
      invoiceTicketId: ticket._id,
      event: stateTransition,
      managerId: userId,
    });
  }
};

const changeState = function changeState(event, ticket, modifier) {
  const userId = Meteor.user()._id;
  if (!userHasPermission(userId, event)) {
    throwUserUnauthorizedException(userId, event);
  }
  createManagerRecord(userId, event, ticket);
  updateInvoiceTicket(event, ticket, modifier);
};

export const preCancelInvoicesOnReject = function(buyerId) {
  Logger.info('[preCancelInvoicesOnReject - Starting]', `for Buyer[${buyerId}]`);
  check(buyerId, String);
  const tickets = InvoiceTickets.find({
    buyerId: buyerId,
    state: {
      $in: preCancellableStates
    }
  }).fetch();
  Logger.info('[preCancelInvoicesOnReject - Info]', `for Buyer[${buyerId}]`, `${tickets.length} tickets to cancel`);
  tickets.forEach(function(ticket) {
    changeState('preCancelInvoiceOnReject', ticket, undefined);
  });
  Logger.info('[preCancelInvoicesOnReject - Finshied]', `for Buyer[${buyerId}]`);
};

Meteor.methods({
  // options: { buyerId, [usdRequested or centsRequested] }
  // can include any other ticket fields, i.e. options: { paymentOption }
  confirmPurchase: function(options) {
    if (this.userId !== options.buyerId) {
      throw new Meteor.Error(403, '[Error] confirmPurchase: Unauthorized',
        'Only the buyer may confirm a purchase.');
    }

    Logger.info('purchase confirmed for buyerId: ', options.buyerId);
    const role = Meteor.users.getFirstRole(this.userId);
    let ticket = InvoiceTickets.findOne({ buyerId: options.buyerId, state: 'inviteSent' }, secureInvoicesOptionsByRole({}, role));
    Logger.info('ticket: ', ticket);
    return { ticketId: ticket._id };
  },
  updateComment: function(ticketId, newComment) {
    check(ticketId, String);
    check(newComment, String);
    if (!Roles.userIsInRole(this.userId, ['headInvoiceManager', 'admin'])) {
      throwUserUnauthorizedException(this.userId, "updateComment");
    }
    setInvoiceTicketFields(ticketId, {comment: newComment});
  },
  changeState: function(event, ticket, modifier) {
    changeState(event, ticket, modifier);
  },
  getBundleInvoiceTickets: function(bundle) {
    if (!userHasPermission(this.userId, "bundleTicket")) {
      throwUserUnauthorizedException(this.userId, "bundleTicket");
    }
    const role = Meteor.users.getFirstRole(this.userId);
    return InvoiceTickets.find({_id: {$in: bundle.invoiceTicketIds}}, secureInvoicesOptionsByRole({}, role)).fetch();
  },
  createPaymentsBundle: function() {
    Logger.info("createPaymentsBundle: starting");
    if (!userHasPermission(this.userId, "bundleTicket")) {
      throwUserUnauthorizedException(this.userId, "bundleTicket");
    }
    /* mark tickets: change state to 'bundleTicket',
       and return tickets Id's and total yen amount for the Bundle */
    const role = Meteor.users.getFirstRole(this.userId);
    const tickets = InvoiceTickets.find({ state: 'ticketPrepared' }, secureInvoicesOptionsByRole({}, role));
    const bundleTicketIds = [];
    let totalYenAmount = 0;
    tickets.forEach(function(ticket) {
      bundleTicketIds.push(ticket._id);
      totalYenAmount += ticket.yenReceived;
      ticket.changeState('bundleTicket');
    });
    if (bundleTicketIds.length === 0) {
      throwMeteorMethodException("createPaymentsBundle",
        'bundleIsEmpty',
        "Payment Bundle must have at least one invoice ticket",
        "bundleTicketIds", bundleTicketIds);
    }
    Logger.info("createPaymentsBundle: ticket for Bundle change to state: 'bundleTicket' successfully");
    PaymentExports.insert({
      invoiceTicketIds: bundleTicketIds,
      yenAmount: totalYenAmount
    });
    Logger.info("createPaymentsBundle: new Bundle created successfully");
  },
  finalizePaymentsBundle: function(params) {
    // Basic props that are always required
    check(params, Match.ObjectIncluding({
      paymentStrategy: Match.OneOf('YEN', 'USD'),
      _id: String
    }));

    // Check provided exchange rates based on strategy
    if (params.paymentStrategy === 'YEN') {
      check(params, Match.ObjectIncluding({ btcUsd: Number, btcJpy: Number }));
    }
    if (params.paymentStrategy === 'USD') {
      check(params, Match.ObjectIncluding({ btcUsd: Number, jpyUsd: Number }));
    }

    if (!userHasPermission(this.userId, "finalizeBundledTicket")) {
      throwUserUnauthorizedException(this.userId, "finalizeBundledTicket");
    }

    // prepare new export fields
    const exportFields = lodash.pick(params, ['_id', 'jpyUsd', 'btcJpy', 'btcUsd']);
    exportFields.finalized = true;
    exportFields.finalizedAt = new Date();
    const exchangeRates = lodash.pick(params, ['jpyUsd', 'btcJpy', 'btcUsd']);

    // get current export
    const paymentExport = PaymentExports.findOne(exportFields._id);

    // prevent exporting if no holding wallet
    if (paymentExport.holdingWalletAddress === 'false') {
      throw new Meteor.Error('missingHoldingWallet');
    }

    // mark tickets for export and update payment export
    const role = Meteor.users.getFirstRole(this.userId);
    const tickets = InvoiceTickets.find({ _id: { $in: paymentExport.invoiceTicketIds } }, secureInvoicesOptionsByRole({}, role)).fetch();
    exportFields.batchFulfillmentAmount = 0;

    tickets.forEach(function(ticket) {
      const satoshisExpected = InvoiceManager.calculateOrderFulfillmentAmount(
        params.paymentStrategy, ticket.yenReceived, exchangeRates
      );
      const ticketProps = lodash.extend({ satoshisExpected: satoshisExpected }, exchangeRates);
      ticket.changeState('finalizeBundledTicket', ticketProps);
      // Sum up the total satoshis amount of the export
      exportFields.batchFulfillmentAmount += satoshisExpected;
    });

    PaymentExports.update(exportFields._id, { $set: exportFields });
    return PaymentExports.findOne(exportFields._id);

  },
  refundInvalidFunds: function(ticketId, refundTransactionId, refundReason) {
    const userId = Meteor.userId();
    Logger.info('[refundInvalidFunds] - Starting',
                'userId:', userId,
                'ticketId', ticketId,
                'refundTransactionId', refundTransactionId,
                'refundReason', refundReason);
    if (!userHasPermission(userId, "refundInvalidTicket")) {
      throwUserUnauthorizedException(userId, "refundInvalidTicket");
    }
    check(ticketId, String);
    check(refundTransactionId, String);
    check(refundReason, String);
    if (refundTransactionId === '') {
      Logger.error('[refundInvalidFunds] - Error: Transaction Id is empty');
      throw new Meteor.Error('invalidTransactionId');
    }
    if (refundReason === '') {
      Logger.error('[refundInvalidFunds] - Error: Refund Reason is empty');
      throw new Meteor.Error('invalidRefundReason');
    }
    const ticket = InvoiceTickets.findOne({_id: ticketId});
    if (!ticket) {
      Logger.error('[refundInvalidFunds] - Error: Ticket not found', 'ticket:', ticketId);
      throw new Meteor.Error('invoiceNotFound');
    }
    const modifier = {
      refundTransactionId: refundTransactionId,
      refundReason: refundReason,
    };
    createManagerRecord(userId, 'refundInvalidTicket', ticket);
    updateInvoiceTicket('refundInvalidTicket', ticket, modifier);
    Logger.info('[refundInvalidFunds] - Finished succesfully!');
  }

});
