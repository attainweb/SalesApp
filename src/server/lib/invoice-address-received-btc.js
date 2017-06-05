'use strict';

import Logger from '/imports/server/lib/logger';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';
import API from './_api-definition.js';

const dollarsPerProduct = Meteor.settings.dollarsPerProduct;
let errorMessage;

const findUpline = function(userId, res) {
  let result = res || [];
  let u = Meteor.users.findOne({_id: userId});
  if (!u) {
    errorMessage = "Can't find user with id " + userId;
    Logger.error(errorMessage);
    throw new Meteor.Error(500, errorMessage);
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - findUpline - User with id" + userId + "found ok!");
  if ( _.contains(_.pluck(result, "_id"), userId) ) {
    errorMessage = "Circular reference for id " + userId;
    Logger.error(errorMessage);
    throw new Meteor.Error(500, errorMessage);
  }
  result.push(u);
  if (u.personalInformation.originatorId) {
    result = findUpline(u.personalInformation.originatorId, result);
  }
  return result;
};

const createCommissionArray = function(uplineMap, satoshisReceived) {
  const commissionMap = {
    "1000": [ 1,    0,    0,    0    ],
    "1100": [ 0.25, 0.75, 0,    0    ],
    "1110": [ 0.25, 0.25, 0.50, 0    ],
    "1111": [ 0.25, 0.25, 0.25, 0.25 ],
    "1010": [ 0.50, 0,    0.50, 0    ],
    "1011": [ 0.25, 0,    0.50, 0.25 ],
    "1001": [ 0.75, 0,    0,    0.25 ],
    "1101": [ 0.25, 0.50, 0,    0.25 ],
  };
  // calculate
  //
  // validate integrity of commission table
  _.keys(commissionMap, function(key) {
    let c = commissionMap[key];
    let lineSum = c[0] + c[1] + c[2] + c[3];
    if (lineSum !== 1) {
      errorMessage = "[API.invoiceAddressReceivedBtc] - createCommissionArray - The commission map is inconsistend lineSum:" + lineSum + " for key" + key;
      Logger.error(errorMessage);
      throw new Meteor.Error(400, errorMessage);
    }
  });

  // let commissions = [];
  let payouts = [];
  let key = "";
  for (let i = 0; i <= 3; i++) {
    key +=  _.isUndefined(uplineMap[i]) ? "0" : "1";
  }
  Logger.info("key", key);

  let curCommissions = commissionMap[key];
  Logger.info("curCommissions", curCommissions);
  if (_.isUndefined(curCommissions)) {
    errorMessage = "[API.invoiceAddressReceivedBtc] - createCommissionArray - Could not find commission mapping for key " + key;
    Logger.error(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - createCommissionArray - commission mapping found ok!");
  // Total commission is always 20% of satoshis received
  let totalCommission = satoshisReceived * 0.2;

  lodash.forOwn(uplineMap, function(comObj, level) {
    comObj.payoutPercentage = curCommissions[level];
    comObj.payoutAmount = Math.floor(totalCommission * comObj.payoutPercentage);
    payouts.push(comObj);
  });

  Logger.info("payouts", payouts);
  return payouts;
};

API.calculateCommissions = function calculateCommissions(ticketId, satoshisReceived) {
  let commissions;
  let ticket = InvoiceTickets.findOne({_id: ticketId});
  if (!ticket) {
    errorMessage = "[API.calculateCommissions] - error - Ticket not found [" + ticketId + "]";
    Logger.error(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }

  let upline = findUpline(ticket.buyerId);
  Logger.info("upline", upline);

  let uplineMap = {};
  _.each(upline, function(user) {
    let level = user.personalInformation.distlevel;
    Logger.info("user level", level, user._id);
    if (!_.isUndefined(level) && !_.isNull(level) && level !== -1) {
      Logger.info("user", level, user._id);
      // check to see if we do not have a distributor with this level in the upline
      if (!_.isUndefined(uplineMap[level]) ) {
        Logger.error("[API.calculateCommissions] - error - Error in upline! Multiple user assigned for level ", level, upline, uplineMap);
        throw new Meteor.Error(400, "There should not be an entry in the uplineMap for distlevel" + level);
      }
      uplineMap[level] = {
        distributorId: user._id,
        payoutBtcAddress: (user.personalInformation.walletAddress || "")
      };
    }
  });

  Logger.info("uplineMap", uplineMap);
  commissions = createCommissionArray(uplineMap, satoshisReceived);
  return commissions;
};

const calculateProductAmount = function(ticket, satoshisReceived) {
  const thousand = 1000;
  const million = thousand * thousand;
  const satoshisPerBtc = 100 * million;
  const btcUsd = ticket.btcUsd || ticket.ghostBtcUsd();
  const btcReceived = satoshisReceived / satoshisPerBtc;
  const usdReceived = btcReceived * btcUsd;
  const productAmount = Math.floor(usdReceived / dollarsPerProduct);

  return productAmount;
};

const invoiceAddressReceivedBtc = function() {
  Logger.info("[API.invoicAddressReceivedBtc] - starting");
  let body = this.request.body;
  let response = this.response;
  Logger.info(Date(), ': [API.btcReceived]', "invoiceAddressReceivedBtc", "body", body, this.request.headers);

  if (!(body && body.satoshisReceived && body.invoiceAddress && body.transactionId)) {
    errorMessage = "Malformed request body";
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    Logger.error("invoiceAddressReceivedBtc", "failed", body);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - body data format ok!");
  let btcAddress = body.invoiceAddress;
  if (!Meteor.validateBitcoinAddress(btcAddress)) {
    response.statusCode = 400;
    errorMessage = "Invalid bitcoin address, invoiceWalletAddress: " + btcAddress;
    Logger.info("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    response.end(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - btcAddress received validated ok!");
  let satoshisReceived = parseInt(body.satoshisReceived, 10);
  if (isNaN(satoshisReceived) || satoshisReceived <= 0) {
    errorMessage("satoshisReceived must be a positive value; satoshisReceived:" + satoshisReceived);
    Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    response.statusCode = 400;
    response.end(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - satoshisReceived is a positive number!");

  try {
    check(body.transactionId, String);
  } catch (error) {
    errorMessage = "Invalid transactionId: " + body.transactionId;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  const transactionId = body.transactionId;
  Logger.info("[API.invoiceAddressReceivedBtc] - transactionId has a valid id format!", transactionId);

  // Confirmations is allow to be undefined to keep
  // retro-compatibility, as backend might not be
  // still updated when this change comes in place.
  // TODO: make this required in future releases
  let confirmations = body.confirmations;
  if (body.confirmations === undefined) {
    confirmations = 1;
  } else {
    confirmations = parseInt(confirmations, 10);
    if (isNaN(confirmations) || confirmations < 0) {
      errorMessage = "Invalid confirmations, must be a positive integer value: " + body.confirmations;
      response.statusCode = 400;
      response.end(errorMessage);
      Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
      throw new Meteor.Error(400, errorMessage);
    }
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - confirmations ", body.confirmations, " using ", confirmations);

  const allowedFundsStates = ['invalidTicketApproved', 'invalidFundsReceived', 'invalidFundsRefunded'];
  let ticket = InvoiceTickets.findOne({ "btcAddress": btcAddress });
  // check state & handle errors - cancelled state, received funds already
  // what should be sent back if invoice is in cancelled state - generic turnoff error
  if (!ticket) {
    // TODO: add a delay here to prevent brute force attacks
    errorMessage = "Ticket not found for address: " + btcAddress;
    Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    response.statusCode = 556;
    response.end(errorMessage);
    throw new Meteor.Error(556, errorMessage);
  } else if ( ticket.state === "invoiceCanceled" || ticket.state === "invoicePreCanceled") {
    errorMessage = "Ticket at address: " + btcAddress + " has been cancelled.";
    Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    response.statusCode = 586;
    response.end(errorMessage);
    throw new Meteor.Error(586, errorMessage);
  } else if (ticket.fundsReceived && !_.contains(allowedFundsStates, ticket.state)) {
    errorMessage = "Ticket at address: " + btcAddress + " already received Satoshis.";
    Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
    response.statusCode = 587;
    response.end(errorMessage);
    throw new Meteor.Error(587, errorMessage);
  }
  Logger.info("[API.invoiceAddressReceivedBtc] - Ticket found ok!");
  Logger.info('[API.btcReceived]', "invoiceAddressReceivedBtc", ticket._id, "centsAskPrice", ticket.centsAskPrice, "btcUsd", ticket.btcUsd);

  if (ticket.paymentOption === 'Btc' && (
      ticket.centsAskPrice === undefined || ticket.centsAskPrice === 0 ||
      ticket.satoshisExpected === undefined || ticket.satoshisExpected === 0
    )
  ) {
    Logger.info("[API.btcReceived]", "ticket.satoshisExpected:", ticket.satoshisExpected);
    Logger.info("[API.btcReceived]", "ticket.centsAskPrice:", ticket.centsAskPrice);
    Logger.info("[API.btcReceived]", "Bitstamp prices not valid for this ticket");
    response.statusCode = 589;
    response.end("Bitstamp prices not valid for ticket " + ticket._id + " having address " + btcAddress);
    throw new Meteor.Error(589, "Bitstamp prices not valid for ticket " + ticket._id + " having address " + btcAddress );
  }

  if (ticket.paymentOption === "Btc" && ticket.state !== 'invalidTicketApproved') {
    // Ticket funds have been refunded - stop the backend from retrying
    if (ticket.state === 'invalidFundsRefunded') {
      Logger.info("[API.btcReceived]", "ticket.satoshisExpected:", ticket.satoshisExpected);
      Logger.info("[API.btcReceived]", "ticket.centsAskPrice:", ticket.centsAskPrice);
      Logger.info("[API.btcReceived]", "Funds have been refunded for this ticket");
      response.statusCode = 595;
      return response.end("Funds have been refunded for this ticket " + ticket._id);
    }
    // Sanity check for the amount of satoshisReceived
    let minSatoshisExpected = Math.floor(ticket.satoshisExpected * 0.9);
    let maxSatoshisExpected = Math.floor(ticket.satoshisExpected * 1.1);
    if (ticket.satoshisExpected === undefined || ticket.satoshisExpected === 0 ||
    satoshisReceived < minSatoshisExpected || satoshisReceived > maxSatoshisExpected) {
      Logger.info("[API.btcReceived]", "ticket.satoshisExpected: ", ticket.satoshisExpected);
      Logger.info("[API.btcReceived]", "Amount received is invalid: " + satoshisReceived + ". Expected value in range: (", minSatoshisExpected + ",", maxSatoshisExpected + ")");
      response.statusCode = 549;

      let needsUpdate = false;
      const modifier = {
        satoshisReceived: satoshisReceived
      };
      if (confirmations === 0) {
        needsUpdate = !(ticket.invoiceTransactionSeenAt);
        modifier.invoiceTransactionSeenAt = new Date();
      } else {
        needsUpdate = (!ticket.fundsReceived);
        modifier.fundsReceived = true;
        modifier.fundsReceivedAt = new Date();
      }
      if (needsUpdate) {
        Logger.info("[API.btcReceived]", "updating ticket: ", ticket._id, "with state", ticket.state, ". Modifier: ", modifier);
        if (ticket.state === 'invoiceSentBtc') {
          updateInvoiceTicket('invalidateTicket', ticket, modifier);
        } else {
          InvoiceTickets.update({_id: ticket._id}, { $set: modifier });
        }
      }

      response.end("Amount received is invalid for ticket " + ticket._id + " having address: " + btcAddress);
      throw new Meteor.Error(549, "Amount received is invalid for ticket " + ticket._id + " having address: " + btcAddress);
    }
  }

  if (confirmations === 0) {
    onReceivedNotification(ticket, transactionId, satoshisReceived);
  } else {
    onReceivedConfirmation(response, ticket, transactionId, satoshisReceived);
  }

  Logger.info("btcReceived", body.satoshisReceived);

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  Logger.info("[API.invoiceAddressReceivedBtc] finished succesfully!");
  return this.response.end(JSON.stringify({"message": "Success"}));
};

const onReceivedNotification = (ticket, transactionId, satoshisReceived) => {
  // Ignore 0-confirmations signal if already received other
  if ( !ticket.invoiceTransactionId) {
    const modifier = {
      invoiceTransactionId: transactionId,
      satoshisReceived: satoshisReceived,
      invoiceTransactionSeenAt: new Date()
    };
    const result = InvoiceTickets.update({_id: ticket._id}, { $set: modifier });
    Logger.info("[API.invoiceAddressReceivedBtc] - Received notification for", `ticket[${ticket._id}]`, "updates:", result);
  }
};

const onReceivedConfirmation = (response, ticket, transactionId, satoshisReceived) => {
  let commissions = ticket.commissions;
  if (! ticket.commissions) {
    // are we allowed to calculate commissions?
    if ( ! _.contains(["ticketFinalized", "inviteAcceptedBtc", "invoiceSentBtc", "invalidTicketApproved"], ticket.state) ) {
      errorMessage = "Can\"t calculate commission for ticket with id: " + ticket._id + ". Invalid Ticket State: " + ticket.state;
      Logger.error("[API.invoiceAddressReceivedBtc] - error:", errorMessage);
      response.statusCode = 500;
      response.end(errorMessage);
      throw new Meteor.Error(500, errorMessage);
    }

    // calculate commissions
    commissions = API.calculateCommissions(ticket._id, satoshisReceived);
    Logger.info("[API.invoiceAddressReceivedBtc] commissions calculated correctly");
    // set ticket commissions, satoshisReceived, and productAmount
    const productAmount = calculateProductAmount(ticket, satoshisReceived);

    let modifier = {};

    if (ticket.state === 'invalidTicketApproved') {
      modifier = {
        invoiceTransactionId: transactionId,
        productAmount: productAmount,
        commissions: commissions
      };
    } else {
      modifier = {
        invoiceTransactionId: transactionId,
        satoshisReceived: satoshisReceived,
        productAmount: productAmount,
        fundsReceived: true,
        commissions: commissions
      };
    }

    updateInvoiceTicket('receiveSatoshis', ticket, modifier);

  } else {
    // ASSUMPTIONS:
    //   we have already checked if ticket.fundsReceived is true
    //   so the only reason we end up in this else case is that somebody manually set fundsReceived to false
    //   and sent the api call again. In this case we change the flag to true and return status 200 (success)
    InvoiceTickets.update({_id: ticket._id}, { $set: {fundsReceived: true}});
  }
};

API.invoiceAddressReceivedBtc = invoiceAddressReceivedBtc;
