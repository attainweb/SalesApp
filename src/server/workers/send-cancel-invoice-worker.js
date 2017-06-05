'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { sendET206InvoiceCanceledEmail } from '../../imports/server/email-actions.js';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';

Jobs.registerWorker({
  jobName: 'sendCancelInvoiceWorker',
  cursor: function() {
    return InvoiceTickets.find({ state: {$in:
      ['invoicePreCanceled']
    }});
  },
  task: function(ticket) {
    const options = { ticketId: ticket._id };
    sendET206InvoiceCanceledEmail(options);
    updateInvoiceTicket('cancelInvoice', ticket);
  },
});
