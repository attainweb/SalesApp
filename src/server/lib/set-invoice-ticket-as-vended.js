'use strict';

import Logger from '/imports/server/lib/logger';
import API from './_api-definition.js';

const setInvoiceTicketAsVended = function() {

  Logger.info("[API.setInvoiceTicketAsVended] - starting");
  const response = this.response;

  const body = this.request.body;
  if (!(body && body.piiHash)) {
    API.onAPIError(response, 400, "Malformed request body, missing piiHash param");
  }
  Logger.info("[API.setInvoiceTicketAsVended] - request body have data");

  const piiHash = body.piiHash;

  try {
    check(piiHash, String);
  } catch (error) {
    API.onAPIError(response, 400, "Invalid piiHash format");
  }

  const invoiceTickets = InvoiceTickets.find({'productVendingInvitation.piiHash': piiHash}, {fields: { _id: 1, hasVended: 1, state: 1 }}).fetch();
  if (!invoiceTickets || invoiceTickets.length === 0) {
    const errorMessage = "Invoice Ticket not found for piiHash: " + piiHash;
    API.onAPIError(response, 400, errorMessage);
  }
  if (invoiceTickets.length > 1) {
    const errorMessage = "More than one Ticket found with piiHash: " + piiHash;
    API.onAPIError(response, 400, errorMessage);
  }
  const invoiceTicket = invoiceTickets[0];

  // Check that the invoice is on a valid state to be vended, state = 'receiptSent'
  if (invoiceTicket.state !== 'receiptSent') {
    const errorMessage = `Invoice Ticket ${ invoiceTicket._id } is not ready to be vended, state ${ invoiceTicket.state } `;
    API.onAPIError(response, 400, errorMessage);
  }

  // Check that the invoice is already vended
  if (invoiceTicket.hasVended) {
    const errorMessage = `Invoice Ticket ${ invoiceTicket._id } has already been set to vended.`;
    API.onAPIError(response, 400, errorMessage);
  }

  Logger.info(`[API.setInvoiceTicketAsVended] - updating invoiceTicket ${invoiceTicket._id} with piiHash`);
  const vendedAt = new Date();
  const updates = {
    $set: {
      hasVended: true,
      updatedAt: vendedAt,
    },
    $push: {
      changelog: {
        field: 'hasVended',
        changedAt: vendedAt,
        value: true
      }
    }
  };

  // Uses rawCollection to bypass the Schema
  InvoiceTickets.rawCollection().update(
    { "_id": invoiceTicket._id }, updates,
    (error, result) => {
      if (error) {
        API.onAPIError(response, 500, "Couldn't save the data");
        Logger.info(`[API.setInvoiceTicketAsVended] - invoice ticket ${invoiceTicket._id} update failed, res: ${result}`);
      } else {
        Logger.info(`[API.setInvoiceTicketAsVended] - invoice ticket ${invoiceTicket._id} updated successfully, res: ${result}`);
      }
    }
  );

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json");
  Logger.info("[API.setInvoiceTicketAsVended] - successfully!");
  return response.end(JSON.stringify({"message": `Ticket  ${invoiceTicket._id} set as vended successfully.`}));
};

API.setInvoiceTicketAsVended = setInvoiceTicketAsVended;
