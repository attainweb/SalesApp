import Logger from '/imports/server/lib/logger';
import Commissions from '/imports/lib/collections/commissions';
import API from './_api-definition.js';

const commissionsPaid = function() {
  Logger.info("[API.commissionsPaid] - starting");
  const response = this.response;

  const body = this.request.body;
  if (!(body && body.invoiceAddress && body.transactionId)) {
    const errorMessage = "Malformed request body";
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.commissionsPaid] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.commissionsPaid] - request body have data");

  const invoiceAddress = body.invoiceAddress;
  if (!Meteor.validateBitcoinAddress(invoiceAddress)) {
    const errorMessage = "Invalid bitcoin address, invoiceAddress: " + invoiceAddress;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.commissionsPaid] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  Logger.info("[API.commissionsPaid] - invoiceAddress is a correct bitcoin address!", invoiceAddress);

  try {
    check(body.transactionId, String);
  } catch (error) {
    const errorMessage = "Invalid transactionId: " + body.transactionId;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.commissionsPaid] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  const transactionId = body.transactionId;
  Logger.info("[API.commissionsPaid] - transactionId has a valid id format!", transactionId);

  const invoiceTicket = InvoiceTickets.findOne({btcAddress: invoiceAddress});
  if (!invoiceTicket) {
    // notify us that an invalid ticketId was passed to us
    const errorMessage = "Invoice Ticket not found for payout address: " + invoiceAddress;
    response.statusCode = 400;
    response.end(errorMessage);
    Logger.error("[API.commissionsPaid] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  } else if (Commissions.find({payoutTransactionId: transactionId}).count() === 1) {
    const errorMessage = "Commissions for invoice ticket at address: " + invoiceAddress + " have already been paid.";
    response.statusCode = 500;
    response.end(errorMessage);
    Logger.error("[API.commissionsPaid] - error:", errorMessage);
    throw new Meteor.Error(500, errorMessage);
  }
  Logger.info("[API.commissionsPaid] - invoiceAddress correspons to InvoiceTicket", "invoiceTicket._id:", invoiceTicket._id);
  InvoiceTickets.update({"_id": invoiceTicket._id}, {$set: { "payoutTransactionId": transactionId}});
  invoiceTicket.payoutTransactionId = transactionId;
  Logger.info("[API.commissionsPaid] - invoice ticket updated successfully", "invoiceTicket._id:", invoiceTicket._id);

  // Generate denormalized commissions based on this ticket!
  Commissions.createFromInvoiceTicket(invoiceTicket);
  Logger.info("[API.commissionsPaid] - commission created successfully");

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  Logger.info("[API.commissionsPaid] - successfully!");
  return response.end(JSON.stringify({"message": "Success"}));
};

API.commissionsPaid = commissionsPaid;
