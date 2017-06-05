'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import Logger from '/imports/server/lib/logger';

export const markJobAsReady = function(jobType) {
  Logger.info("[workers] - markJobAsReady: Starting", "jobType:", jobType);
  const rawJob = Jobs.findOne({ type: jobType, status: 'waiting' });
  if (typeof rawJob === 'undefined') {
    Logger.info("[workers] - markJobAsReady: Warning", "jobType:", jobType, "couldn't mark jobs as ready");
    return undefined;
  }
  const job = new Job(Jobs, rawJob);
  const withinOneFromNow = new Date(Math.round(new Date().getTime()) + 60 * 60 * 1000);
  // Set the job to ready if it was scheduled to repeat within the next hour
  job.ready({ time: withinOneFromNow });
  Logger.info("[workers] - markJobAsReady: Success", "jobType:", jobType);
  return true;
};
