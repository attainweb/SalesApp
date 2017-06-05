'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';
import { sendET301ReceiptEmails } from '/imports/server/email-actions';
import { generateProductPasscode } from '/imports/server/product-passcode-generator';

Jobs.registerWorker({
  jobName: 'assignProductPasscodeWorker',
  cursor() {
    return InvoiceTickets.find({ state: {$in: ['satoshisReceived']}});
  },
  task(ticket, job) {
    const firstName = ticket.buyerFirstName();
    const email     = ticket.buyerEmail();
    const ticketId  = ticket._id;

    job.log('assignProductPasscode', firstName, email, 'for ticket', ticketId);
    const productPasscode = generateProductPasscode();
    const productPasscodeHash = SHA256(productPasscode);
    updateInvoiceTicket('assignProductPasscode', ticket, { productPasscodeHash: productPasscodeHash });

    // we need to fetch the ticket again cause we changed the state
    const tix = InvoiceTickets.findOne({_id: ticket._id });
    job.log('sending receipt to', firstName, email, 'for ticket', tix._id);
    sendET301ReceiptEmails({
      ticketId: tix._id,
      productPasscode: productPasscode,
      productPasscodeHash: productPasscodeHash
    });
    updateInvoiceTicket('sendReceipt', tix, {});
  }
});
