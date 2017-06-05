import Logger from '/imports/server/lib/logger';
import { check, Match } from 'meteor/check';
import API from './_api-definition.js';

const holdingWalletReceivedBtc = function() {
  Logger.info("[API.holdingWalletReceivedBtc] - startig", this.request.headers);
  const response = this.response;

  const body = this.request.body;
  try {
    check(body, {
      holdingWalletAddress: String,
      satoshisReceived: Match.Where(function(num) {
        const parsed = parseInt(num, 10);
        // As meteor is using 0.10 we need to hardcode Number.MAX_SAVE_INTEGER
        const isNumber = !isNaN(parsed) && isFinite(parsed) && parsed < 9007199254740991 && num === parsed;
        return isNumber;
      }),
      transactionId: String
    });
  } catch (requestError) {
    const errorMessage = "Malformed request body";
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.holdingWalletReceivedBtc] - error:", JSON.stringify(requestError));
    throw new Meteor.Error(400, errorMessage);
  }

  Logger.info("[API.holdingWalletReceivedBtc] - request body have data");

  const holdingAddress = body.holdingWalletAddress;
  if (!Meteor.validateBitcoinAddress(holdingAddress)) {
    const errorMessage = "Invalid bitcoin address, holdingWalletAddress: " + holdingAddress;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.holdingWalletReceivedBtc] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }

  Logger.info("[API.holdingWalletReceivedBtc] - holdingAddress is a bitcoin address!", holdingAddress);

  const satoshisReceived = parseInt(body.satoshisReceived, 10);
  if (satoshisReceived <= 0) {
    const errorMessage = "satoshisReceived must be a positive value: " + satoshisReceived;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.holdingWalletReceivedBtc] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }

  Logger.info("[API.holdingWalletReceivedBtc] - satoshisReceived is a valid number!", satoshisReceived);

  paymentExport = PaymentExports.findOne({holdingWalletAddress: holdingAddress});
  if (!(paymentExport)) {
    response.statusCode = 400;
    response.end("There is no bundle for this holding wallet address: " +  holdingAddress);
    const errorMessage = 'Payment Export not found for holding wallet address: ' + holdingAddress;
    Logger.error("[API.holdingWalletReceivedBtc] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }

  Logger.info("[API.holdingWalletReceivedBtc] - holdingAddress correspons to a payment Export", "paymentExport_id:", paymentExport._id);

  if ( !(paymentExport.batchFulfillmentAmount) ||  paymentExport.batchFulfillmentAmount !== satoshisReceived ) {
    const errorMessage = "PaymentExport " + paymentExport._id + " batchFulfillmentAmount " + paymentExport.batchFulfillmentAmount + " does not match satoshisReceived " + satoshisReceived;
    response.statusCode = 590;
    response.end(errorMessage);
    Logger.error("[API.holdingWalletReceivedBtc] - error:", errorMessage);
    throw new Meteor.Error(590, errorMessage);
  }

  Logger.info("[API.holdingWalletReceivedBtc] - holdingAddress correspons to a payment Export", "paymentExport_id:", paymentExport._id);

  const content = { payout: []};
  _.each(paymentExport.invoiceTicketIds, function invoiceTicketEach(ticketId) {
    const ticket = InvoiceTickets.findOne({_id: ticketId});
    content.payout.push({
      invoiceAddress: ticket.btcAddress,
      amount: ticket.satoshisExpected
    });
  });

  Logger.info("[API.holdingWalletReceivedBtc] - content payout ready!", content);

  PaymentExports.update({_id: paymentExport._id}, {$set: {holdingWalletReceivedBtc: true}});
  Logger.info("[API.holdingWalletReceivedBtc] - payment export updated successfully", "paymentExport._id:", paymentExport._id);

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  Logger.info("[API.holdingWalletReceivedBtc] - successfully!");
  return Meteor.Backend.signResponse(response, content);
};

API.holdingWalletReceivedBtc = holdingWalletReceivedBtc;
