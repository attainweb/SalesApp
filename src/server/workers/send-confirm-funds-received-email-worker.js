'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { sendET205ConfirmFundsReceived } from '../../imports/server/email-actions.js';
import { updateInvoiceTicket } from '../../imports/server/invoice-ticket-state-machine';

Jobs.registerWorker({
  jobName: 'sendConfirmFundsReceivedEmailWorker',
  cursor: function getFundsReceivedConfirmedTickets() {
    return InvoiceTickets.find({ state: 'fundsReceivedConfirmed' });
  },
  task(ticket) {
    const options = { ticketId: ticket._id };
    sendET205ConfirmFundsReceived(options);
    updateInvoiceTicket('sendConfirmFundsReceived', ticket);
  }
});
