'use strict';

import Logger from '/imports/server/lib/logger';
import { Jobs } from '/lib/collections/jobs.js';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';

Jobs.registerWorker({
  jobName: 'assignInvoiceAddressWorker',
  cursor() {
    return InvoiceTickets.find({ state: 'started' });
  },
  task(ticket, job) {

    // ensures a holding wallet exists for the distributor
    if (!ticket.buyer().distributor().personalInformation.invoiceWalletId) {
      Logger.error('Job[' + job.name + ']', '[' + job.id + ']', 'ticket[' + ticket._id + ']', 'NO Distributor Invoice Wallet ID');
      job.log('ticket[' + ticket._id + ']', 'NO Distributor Invoice Wallet ID');
      job.fail('#{jobName} failed: NO Distributor ID)', {fatal: false});
      return;
    } else if (typeof ticket.btcAddress === "string") {
      Logger.error('Job[' + job.name + ']', '[' + job.id + ']', 'ticket[' + ticket._id + ']', 'Invoice Ticket already has Btc Address');
      job.log('ticket[' + ticket._id + ']', 'Invoice Ticket already has Btc Address');
      job.fail('#{jobName} failed: Invoice ticket already has Btc Address)', {fatal: false});
    } else {
      Meteor.Backend.getInvoiceAddress(ticket._id, function getInvoiceAddresscallback(err, res) {
        if (err) {
          Logger.error('Job[' + job.name + ']', '[' + job.id + ']', 'ticket[' + ticket._id + ']', err.message);
          Logger.error('ticket[' + ticket._id + ']', 'error');
          // we should alert people here
          return;
        } else {
          const btcAddress = res.data.address;
          Logger.info('Invoice address assigned to ticket._id:', ticket._id, 'btcAddress:', btcAddress);
          updateInvoiceTicket('assignBtcAddress', ticket, { 'btcAddress': btcAddress });
        }
      });
    }
  },
});
