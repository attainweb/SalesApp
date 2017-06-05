'use strict';

import Logger from '/imports/server/lib/logger';
import {recalculateBuyerComplianceLevel} from '/imports/server/users/compliance-level';

export const setInvoiceTicketFields = function(ticketId, modifiers) {
  Logger.info("setInvoiceTicketFields");
  check(ticketId, String);
  check(modifiers, Object);
  const mongoOperators = _.chain(modifiers).keys().filter(function(name) {
    return lodash.startsWith(name, '$');
  }).value();
  const regKeys = _.chain(modifiers).keys().filter(function(name) {
    return !lodash.startsWith(name, '$');
  }).value();
  Logger.info("checkForOperator", "mongoOperators", mongoOperators, "regKeys", regKeys);
  const checkForOperator = function(obj, skiplevel) {
    Logger.info("checkForOperator", obj, skiplevel);
    if (_.isNull(obj)) {
      return [];
    }
    const skipLevel = skiplevel || 0;
    let nextLevel = skipLevel;
    if (nextLevel > 0) {
      nextLevel -= 1;
    }
    let nestedOps = [];
    _.chain(obj).keys().each(function(key) {
      // Logger.info("checkForOperator", key);
      if (skipLevel === 0 && lodash.startsWith(key, '$')) {
        nestedOps.push(key);
      }
      if (typeof obj[key] === 'object') {
        nestedOps = _.union(nestedOps, checkForOperator(obj[key], nextLevel));
      }
    }).value();
    return nestedOps;
  };
  const regObjects = _.map(regKeys, function(fieldName) {
    return modifiers[fieldName];
  });
  const nops = checkForOperator(regObjects, 1);
  if (_.size(nops) > 0) {
    throw new Meteor.Error(400, 'Can\'t use nested operators!', nops);
  }

  const operators = {};
  _.each(mongoOperators, function(mo) {
    operators[mo] = modifiers[mo];
  });
  operators.$set = operators.$set || {};
  _.each(regKeys, function(field) {
    operators.$set[field] = modifiers[field];
  });

  // make sure that we keep the empty strings
  const options = {removeEmptyStrings: false};
  InvoiceTickets.update({_id: ticketId}, operators, options);
};

export const updateTicket = function(options) {
  Logger.info('options: ', options);
  check(options, Object);
  check(options.ticketId, String);
  check(options.stateTransition, String);
  Logger.info('changing state with transition', options.stateTransition, 'for ticket', options.ticketId);
  const ticket = InvoiceTickets.findOne(options.ticketId);

  const atSetMap = {
    assignBtcAddress: 'btcAddressAssignedAt',
    sendInvoiceBtc: 'invoiceSentAt',
    sendInvoiceBank: 'invoiceSentAt',
    receiveFunds: 'fundsReceivedAt',
    expireInvoice: 'invoiceExpiredAt',
    receiveSatoshis: 'satoshisReceivedAt',
    sendReceipt: 'receiptSentAt',
    cancelInvoice: 'canceledAt',
    refundInvalidTicket: 'refundedAt',
  };
  const atUnsetMap = {
    cancelReceivedFunds: 'fundsReceivedAt'
  };
  options.modifier = options.modifier || {};
  options.modifier.$set = options.modifier.$set || {};
  options.modifier.$unset = options.modifier.$unset || {};

  // Update user flags
  if (options.stateTransition === 'confirmFundsReceived') {
    Logger.info("setInvoiceTicketFields", "set personalInformation.receivedSatoshisPreComplianceCheck true");
    Meteor.users.update(
      {_id: ticket.buyerId, 'personalInformation.status': 'PENDING'},
      {
        $set: {'personalInformation.receivedSatoshisPreComplianceCheck': true}
      });
  }

  const setAtField = atSetMap[options.stateTransition];
  if (setAtField !== undefined) options.modifier.$set[setAtField] = new Date();

  const unsetAtField = atUnsetMap[options.stateTransition];
  if (unsetAtField !== undefined) options.modifier.$unset[unsetAtField] = '';

  if (options.modifier.usdRequested) {
    options.modifier.centsRequested = options.modifier.usdRequested * 100;
    options.modifier.usdRequested = undefined;
  }

  if (options.modifier.$set.usdRequested) {
    options.modifier.$set.centsRequested = options.modifier.$set.usdRequested * 100;
    options.modifier.$set.usdRequested = undefined;
  }

  switch (options.stateTransition) {
    case 'preCancelInvoiceOnReject':
    case 'preCancelInvoice':
      options.modifier.$set.officerThatRequestPreCancel = (Meteor.user() && Meteor.user()._id);
      break;
    default:
  }

  Logger.info('options: ', options);
  if (options.modifier) {
    setInvoiceTicketFields(options.ticketId, options.modifier);
    Logger.info(`[updateTicket] Recalculating buyer's ${ticket.buyerId} ComplianceLevel on ticket ${ticket._id} update`);
    recalculateBuyerComplianceLevel(ticket.buyerId); // allways do it after update the ticket!
  }
};
