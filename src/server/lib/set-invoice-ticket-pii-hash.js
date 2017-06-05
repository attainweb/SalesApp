'use strict';

import Logger from '/imports/server/lib/logger';
import API from './_api-definition.js';

const setInvoiceTicketPiiHash = function() {

  Logger.info("[API.setInvoiceTicketPiiHash] - starting");
  const response = this.response;

  const body = this.request.body;
  if (!(body && body.ticketId && body.piiHash && body.email)) {
    API.onAPIError(response, 400, "Malformed request body");
  }
  Logger.info("[API.setInvoiceTicketPiiHash] - request body have data");

  const ticketId = body.ticketId;
  const piiHash = body.piiHash;
  const email = body.email;
  const comment = body.comment;
  const batchNumber = body.batchNumber;

  try {
    check(piiHash, String);
  } catch (error) {
    API.onAPIError(response, 400, "Invalid piiHash format");
  }

  const emailObj = { email: email };
  if (!Schemas.ProductVendingInvitationObject.namedContext("piiHash_email_validation").validateOne(emailObj, "email")) {
    API.onAPIError(response, 400, "Invalid email format");
  }

  if (comment) {
    try {
      check(comment, String);
    } catch (error) {
      API.onAPIError(response, 400, "Invalid comment format");
    }
  }

  if (batchNumber) {
    try {
      check(batchNumber, String);
    } catch (error) {
      API.onAPIError(response, 400, "Invalid batchNumber format");
    }
  }

  const invoiceTicket = InvoiceTickets.findOne({_id: ticketId}, {fields: { _id: 1, productPasscode: 1, productPasscodeHash: 1, hasVended: 1 }});
  if (!invoiceTicket) {
    const errorMessage = "Invoice Ticket not found for ticketId: " + ticketId;
    API.onAPIError(response, 400, errorMessage);
  }
  // Check that the invoice is on a valid state to accept piiHash, has productPasscodeHash
  if (!invoiceTicket.productPasscode && !invoiceTicket.productPasscodeHash) {
    const errorMessage = `Invoice Ticket ${ticketId} is not ready to set piiHash yet`;
    API.onAPIError(response, 400, errorMessage);
  }

  // If invoice is already vended call error
  if (invoiceTicket.hasVended === true) {
    const errorMessage = `Invoice Ticket ${ticketId} is already vended`;
    API.onAPIError(response, 400, errorMessage);
  }

  Logger.info(`[API.setInvoiceTicketPiiHash] - updating invoiceTicket ${invoiceTicket._id} with piiHash`);
  const piiHashedAt = new Date();
  const toSet = {
    "productVendingInvitation.piiHash": piiHash,
    "productVendingInvitation.email": email,
    updatedAt: piiHashedAt,
  };
  const toPush = {
    changelog: {
      field: 'productVendingInvitation',
      changedAt: piiHashedAt,
      value: {
        piiHash: piiHash,
        email: email,
      },
    }
  };

  const toUnset = {};
  const setUnsetConditionalStrAttr = (attrName, attrValue) => {
    if (attrValue) {
      toSet[`productVendingInvitation.${attrName}`] = attrValue;
      toPush.changelog.value[attrName] = attrValue;
    } else {
      toUnset[`productVendingInvitation.${attrName}`] = '';
    }
  };
  setUnsetConditionalStrAttr('comment', comment);
  setUnsetConditionalStrAttr('batchNumber', batchNumber);

  const updates = {$set: toSet, $push: toPush};
  if (!_.isEmpty(toUnset)) {
    updates.$unset = toUnset;
  }

  // Uses rawCollection to bypass the Schema, as the log of productVendingInvitation
  // needs to be an atomic unit. This is possible since productVendingInvitation is
  // only updated in this location and nowhere else.
  InvoiceTickets.rawCollection().update(
    {"_id": invoiceTicket._id}, updates,
    (error, result) => {
      if (error) {
        API.onAPIError(response, 500, "Couldn't save the data");
        Logger.info(`[API.setInvoiceTicketPiiHash] - invoice ticket ${invoiceTicket._id} update failed, res: ${result}`);
      } else {
        Logger.info(`[API.setInvoiceTicketPiiHash] - invoice ticket ${invoiceTicket._id} updated successfully, res: ${result}`);
      }
    }
  );

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  Logger.info("[API.setInvoiceTicketPiiHash] - successfully!");
  return response.end(JSON.stringify({"message": "piiHash was set successfully."}));
};

API.setInvoiceTicketPiiHash = setInvoiceTicketPiiHash;
