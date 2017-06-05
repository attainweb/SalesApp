'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import Logger from '/imports/server/lib/logger';

Jobs.registerWorker({
  jobName: 'assignHoldingWalletAddressWorker',
  cursor() {
    return PaymentExports.find({ holdingWalletAddress: 'false' });
  },
  task(paymentExport, job) {
    Meteor.Backend.getHoldingWalletAddress(function getHoldingWalletAddresscallback(err, res) {
      if (err) {
        Logger.error('Job[' + job.name + ']', '[' + job.id + ']', 'paymentExport[' + paymentExport._id + ']', err.message);
        Logger.error('paymentExport[' + paymentExport._id + ']', 'error');
        // we should alert people here
        return;
      } else {
        const holdingAddress = JSON.parse(res.content).address;
        Logger.info('PaymentExport: ' + ' holdingWalletAddress: ' + holdingAddress);
        PaymentExports.update({_id: paymentExport._id}, { $set: { holdingWalletAddress: holdingAddress}});
      }
    });
  }
});
