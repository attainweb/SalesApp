import Logger from '/imports/server/lib/logger';
import API from './_api-definition.js';

const commissionsMovedToWallet = function() {
  const body = this.request.body;
  const response = this.response;
  let errorMessage;

  if (!(body && body.invoiceAddress && body.satoshisAmount && body.date)) {
    errorMessage = "Malformed request body";
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.commissionsMovedToWallet]", errorMessage, body);
    throw new Meteor.Error(400, "Malformed request body");
  }
  Logger.info( "[API.commissionsMovedToWallet]  - correct body format");

  const invoiceAddress = body.invoiceAddress;
  if (!Meteor.validateBitcoinAddress(invoiceAddress)) {
    errorMessage = "Invalid bitcoin address, invoiceAddress: " + invoiceAddress;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.commissionsMovedToWallet] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.commissionsMovedToWallet] - invoiceAddress is a correct bitcoin address!", invoiceAddress);

  let satoshisAmount = parseInt(body.satoshisAmount, 10);
  if (isNaN(satoshisAmount) || satoshisAmount <= 0) {
    errorMessage = "satoshisAmount must be a positive value; satoshisAmount:" + satoshisAmount;
    Logger.error("[API.commissionsMovedToWallet] - error:", errorMessage);
    response.statusCode = 400;
    response.end(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.commissionsMovedToWallet] - satoshisAmount is a positive number!");

  Logger.info("[API.commissionsMovedToWallet] -  satoshisAmount: " + body.satoshisAmount);

  const invoiceTicket = InvoiceTickets.findOne({btcAddress: body.invoiceAddress});
  if (!(invoiceTicket)) {
    // notify us that an invalid ticketId was passed to us
    errorMessage = "Ticket not found for address: " + invoiceAddress;
    Logger.error("[API.commissionsMovedToWallet]  - error", errorMessage);
    response.statusCode = 400;
    response.end(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  } else if (invoiceTicket.commissionsMoved) {
    errorMessage = "Ticket at address: " + invoiceAddress + " already had commissions moved to wallet.";
    Logger.error("[API.commissionsMovedToWallet]  - error", errorMessage);
    response.statusCode = 587;
    response.end(errorMessage);
    throw new Meteor.Error(587, errorMessage);
  }
  Logger.info("[API.commissionsMovedToWallet] - invoiceTicket found correctly usingJajaj btcAddress");
  const commissions = invoiceTicket.commissions;

  if (!commissions) {
    errorMessage = "Commissions not found for ticket at address: " + invoiceAddress;
    Logger.error("[API.commissionsMovedToWallet]  - error", errorMessage);
    response.statusCode = 400;
    response.end(errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }

  const responseBody = {};
  responseBody.commissions = [];
  _.each(commissions, function commissionsPredicate(commission) {
    responseBody.commissions.push({commissionAddress: commission.payoutBtcAddress, amount: commission.payoutAmount});
  });
  Logger.info("[API.commissionsMovedToWallet] - commissions response body ready!");

  InvoiceTickets.update({_id: invoiceTicket._id}, { $set: {commissionsMoved: true}});
  Logger.info("[API.commissionsMovedToWallet] -invoice ticket updated successfully", "invoiceTicket._id:", invoiceTicket._id);

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  Logger.info("[API.commissionsMovedToWallet] finished succesfully!");
  return Meteor.Backend.signResponse(response, responseBody);
};

API.commissionsMovedToWallet = commissionsMovedToWallet;
