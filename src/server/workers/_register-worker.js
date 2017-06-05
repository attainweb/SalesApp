'use strict';

import { Jobs } from '/lib/collections/jobs.js';

export const workerRegistrations = [];

Jobs.registerWorker = function(options) {
  workerRegistrations.push(options);
};
