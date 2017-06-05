'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';

Jobs.registerWorker({
  jobName: 'approveComplianceBankWorker',
  cursor() {
    return InvoiceTickets.find({ state: 'saleStartedBank' });
  },
  task(ticket) {
    const buyer      = ticket.buyer();
    const isApproved = buyer.isApproved();
    if (isApproved) updateInvoiceTicket('approveComplianceBank', ticket);
  }
});
