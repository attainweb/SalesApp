'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { sendInvoiceEmail } from '../../imports/server/email-actions.js';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';

Jobs.registerWorker({
  jobName: 'sendInvoiceWorker',
  cursor: function getTickets() {
    return InvoiceTickets.find({ state: {$in:
      ['complianceApprovedBank', 'complianceApprovedBtc']
    }});
  },
  task: function sendInvoice(ticket) {
    const options = { ticketId: ticket._id };
    const changeToState = 'sendInvoice' + ticket.paymentOption;
    sendInvoiceEmail(options);
    updateInvoiceTicket(changeToState, ticket);
  },
});
