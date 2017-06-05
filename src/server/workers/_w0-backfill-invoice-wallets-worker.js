'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import { createDistributorWallet } from '/imports/server/create-distributor-wallet';

Jobs.registerWorker({
  jobName: 'backfillInvoiceWalletsWorker',
  cursor() {
    return Meteor.users.find({roles: 'distributor', 'personalInformation.hasInvoiceWallet': false});
  },
  task(distributor) {
    if (distributor._id) {
      createDistributorWallet(distributor._id);
    }
  }
});
