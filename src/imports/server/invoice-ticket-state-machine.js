'use strict';

import Logger from '/imports/server/lib/logger';
import { updateTicket } from '/imports/server/invoice-ticket-update-manager';

export const preCancellableStates = ['started',                  'btcAddressAssigned',   'waitingForSaleToStart',
                                  'saleStartedBtc',           'saleStartedBank',      'complianceApprovedBtc',
                                  'complianceApprovedBank',   'invoiceSentBtc',       'invoiceSentBank'];

const stateMachineEvents = [
    { name: 'assignBtcAddress',         from: 'started',                                                          to: 'btcAddressAssigned' },
    { name: 'waitForSaleToStart',       from: 'btcAddressAssigned',                                               to: 'waitingForSaleToStart' },
    { name: 'startSaleBank',            from: ['waitingForSaleToStart', 'btcAddressAssigned'],                    to: 'saleStartedBank' },
    { name: 'startSaleBtc',             from: ['waitingForSaleToStart', 'btcAddressAssigned'],                    to: 'saleStartedBtc' },

    { name: 'preCancelInvoiceOnReject',    from: preCancellableStates,                                               to: 'invoicePreCanceled' },

    { name: 'approveComplianceBtc',     from: 'saleStartedBtc',                                                   to: 'complianceApprovedBtc' },
    { name: 'sendInvoiceBtc',           from: 'complianceApprovedBtc',                                            to: 'invoiceSentBtc' },

    { name: 'approveComplianceBank',    from: 'saleStartedBank',                                                  to: 'complianceApprovedBank' },
    { name: 'sendInvoiceBank',          from: 'complianceApprovedBank',                                           to: 'invoiceSentBank' },

    { name: 'expireInvoice',            from: ['invoiceSentBtc', 'invoiceSentBank'],                              to: 'invoiceExpired' },
    { name: 'reviveInvoiceBank',        from: 'invoiceExpired',                                                   to: 'saleStartedBank'},
    { name: 'reviveInvoiceBtc',         from: 'invoiceExpired',                                                   to: 'saleStartedBtc'},

    { name: 'invalidateTicket',         from: 'invoiceSentBtc',                                                   to: 'invalidFundsReceived' },
    { name: 'approveInvalidTicket',     from: 'invalidFundsReceived',                                             to: 'invalidTicketApproved' },
    { name: 'refundInvalidTicket',      from: 'invalidFundsReceived',                                             to: 'invalidFundsRefunded' },
    { name: 'receiveFunds',             from: 'invoiceSentBank',                                                  to: 'fundsReceived' },
    { name: 'cancelFundsReceived',      from: 'fundsReceived',                                                    to: 'invoiceSentBank' },
    { name: 'confirmFundsReceived',     from: 'fundsReceived',                                                    to: 'fundsReceivedConfirmed' },
    { name: 'sendConfirmFundsReceived', from: 'fundsReceivedConfirmed',                                           to: 'fundsReceivedConfirmedSent' },
    { name: 'prepareTicket',            from: 'fundsReceivedConfirmedSent',                                       to: 'ticketPrepared' },
    { name: 'cancelPreparedTicket',     from: 'ticketPrepared',                                                   to: 'fundsReceivedConfirmedSent' },
    { name: 'bundleTicket',             from: 'ticketPrepared',                                                   to: 'ticketBundled' },
    { name: 'finalizeBundledTicket',    from: 'ticketBundled',                                                    to: 'ticketFinalized' },
    { name: 'receiveSatoshis',          from: ['invoiceSentBtc', 'ticketFinalized', 'invalidTicketApproved'],     to: 'satoshisReceived' },
    { name: 'assignProductPasscode',        from: 'satoshisReceived',                                                 to: 'productPasscodeAssigned' },
    { name: 'sendReceipt',              from: 'productPasscodeAssigned',                                              to: 'receiptSent' },
    { name: 'preCancelInvoice',         from: preCancellableStates,                                               to: 'invoicePreCanceled' },
    { name: 'regenerateProductPasscode',    from: 'receiptSent',                                                      to: 'satoshisReceived' },
    { name: 'cancelInvoice',            from: 'invoicePreCanceled',                                               to: 'invoiceCanceled' },
];

export const allStates = (function() {
  const statesTuples = _.map(stateMachineEvents, function(event) {
    return _.flatten([event.from, event.to]);
  });

  return _.unique(_.flatten(statesTuples));
})();

export const invoicedStates = ['saleStartedBtc', 'saleStartedBank', 'complianceApprovedBtc', 'complianceApprovedBank', 'fundsReceivedConfirmed',
    'fundsReceivedConfirmedSent', 'ticketPrepared', 'ticketBundled',
    'ticketFinalized', 'invoiceSentBank', 'fundsReceived', 'invoiceSentBtc',
    'invalidTicketApproved', 'invalidFundsReceived'];

export const paidStates = ['satoshisReceived', 'productPasscodeAssigned', 'receiptSent'];

export const postProductReservedStates = ['complianceApprovedBtc', 'complianceApprovedBank', 'invoiceSentBank',  'invoiceSentBtc',
    'fundsReceived', 'fundsReceivedConfirmed', 'fundsReceivedConfirmedSent', 'ticketPrepared', 'ticketBundled', 'ticketFinalized',
    'invalidTicketApproved', 'invalidFundsReceived', 'satoshisReceived', 'productPasscodeAssigned', 'receiptSent'];

export const invoicedAndpaidStates = invoicedStates.concat(paidStates);

// init state machine callbacks:
const stateMachineCallbacks = {};

// private
// usage:
// this.stateMachine[event](invoiceTicket, {field: value})
// this.stateMachine[event](invoiceTicket)
const defaultCallbackSM = function(event, from, to, invoiceTicket, mod) {
  let modifier;
  if (! mod) {
    modifier = {};
  } else {
    modifier = mod;
  }

  modifier.state = to;
  const options = {
    ticketId: invoiceTicket._id,
    stateTransition: event,
    modifier: modifier
  };
  updateTicket(options);
};

// generate default callback for each event:
stateMachineEvents.forEach(function(event) {
  const key = 'on' + event.name;
  stateMachineCallbacks[key] = defaultCallbackSM;
});

const createStateMachineForInvoiceTicket = function(ticket) {
  const stateMachine = StateMachine.create({
    initial: ticket.state,
    events: stateMachineEvents,
    callbacks: stateMachineCallbacks,
  });
  return stateMachine;
};

export const updateInvoiceTicket = function(event, ticket, modifier) {
  const invoiceTicketSM = createStateMachineForInvoiceTicket(ticket);
  Logger.info(`updateInvoiceTicket - from: ${ticket.state} action: ${event} for ticket[${ticket._id}] and buyer[${ticket.buyerId}]`);
  invoiceTicketSM[event](ticket, modifier);
};
