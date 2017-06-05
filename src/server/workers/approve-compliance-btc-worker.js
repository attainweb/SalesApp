'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';

Jobs.registerWorker({
  jobName: 'approveComplianceBtcWorker',
  cursor() {
    return InvoiceTickets.find({ state: 'saleStartedBtc' });
  },
  task(ticket) {
    const buyer      = ticket.buyer();
    const isApproved = buyer.isApproved();
    if (isApproved) updateInvoiceTicket('approveComplianceBtc', ticket);
  }
});
