'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { sendET204InvoiceExpiredEmail } from '/imports/server/email-actions';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';
import dateService from '/imports/lib/shared/date-service.js';

const olderThanExpirationDeadline = function(paymentMethod, expirationType) {
  const expirationSchema = Meteor.settings.public.expireTickets[paymentMethod][expirationType];
  let daysAgo;
  if (expirationSchema.businessDays) {
    daysAgo = moment(dateService.now()).subtractWeekDays(expirationSchema.days).startOf('day').toDate();
  } else {
    daysAgo = moment(dateService.now()).subtract(expirationSchema.days, 'd').startOf('day').toDate();
  }
  return {$lt: daysAgo};
};

Jobs.registerWorker({
  jobName: 'expireInvoiceWorker',
  cursor: function() {
    return InvoiceTickets.find({
      $or: [
        {
          state: 'invoiceSentBank',
          invoiceSentAt: olderThanExpirationDeadline('bank', 'afterInvoiceSent')
        },
        {
          state: 'invoiceSentBtc',
          invoiceSentAt: olderThanExpirationDeadline('btc', 'afterInvoiceSent')
        },
      ],
      invoiceTransactionSeenAt: { $exists: false }
    });
  },
  task(ticket) {
    updateInvoiceTicket('expireInvoice', ticket);
    const options = { ticketId: ticket._id };
    sendET204InvoiceExpiredEmail(options);
  }
});
