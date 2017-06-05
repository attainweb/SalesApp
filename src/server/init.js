'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import Logger from '/imports/server/lib/logger';
import wrappLoggerAsStream from './lib/logger-as-stream';
import { markJobAsReady } from '/imports/server/workers';
import { workerRegistrations } from '/server/workers/_register-worker';

const startWorkers = function(jlogger) {
  workerRegistrations.forEach(function(registration) {
    const jobName = registration.jobName;
    const callInterval = registration.callInterval || 120 * 1000;
    Jobs.jobNames[jobName] = jobName;
    let isInitialSetup = true;
    Logger.info('Job', jobName, 'initializing');

    // Cleanup the job history to avoid too many documents in the collection
    Jobs.remove({ type: jobName });

    const worker = function(job, cb) {
      const jobId = job._doc._id;
      const jlog = jlogger(jobId, jobName, job);
      const items = registration.cursor().fetch();
      const jobHash = {
        id: jobId,
        name: jobName,
        log: jlog,
        fail: job.fail,
        _doc: {
          _id: jobId
        }
      };

      // Cleanup completed jobs for this type
      Jobs.remove({ type: jobName, status: 'completed' });

      try {
        if (items.length > 0) {
          jlog('running', '[' + items.length + ']');

          let data = null;
          if (typeof registration.prepare === 'function') {
            data = registration.prepare(jobHash);
          }

          items.forEach(function(item) {
            /*
               (!) in case of error for a item, this try/catch will prevent that
               the worker doesn't finish. Allowing finish the work for the rest of the items.
            */
            try {
              return registration.task(item, jobHash, data);
            } catch (unexpectedException) {
              Logger.error(`Job[name: ${jobName}, id:${jobId}]`, '-', `Failed Item[_id: ${item._id}]`, '-', "Unexpected Exception:", unexpectedException);
              return undefined;
            }
          });
          jlog('done');
        }
        job.done();
      } catch (e) {
        Logger.error(`Job[name: ${jobName}, id:${jobId}]`, '-', "Exception:", e);
        // we are catching connection errors and timeouts here
        job.fail(`${jobName} failed: ${e}`, {
          fatal: false
        });
      }
      cb();
      return jobId;
    };

    let queue = Jobs.processJobs([jobName], {
      concurrency: 1,
      cargo: 1,
      prefetch: 0,
    }, worker);

    const job = new Job(Jobs, jobName, {})
    .retry({ retries: Jobs.forever, wait: callInterval })
    .repeat({ repeats: Jobs.forever, wait: callInterval })
    .save();

    // Trigger workers immediately when there is a job ready to be executed
    Jobs.find({ type: jobName, status: 'ready' }).observe({
      added: () => queue.trigger()
    });

    // Mark jobs to be rerun as soon as possible when new docs match the cursor
    registration.cursor().observe({
      added: () => !isInitialSetup && markJobAsReady(jobName)
    });

    isInitialSetup = false;
    return job;
  });
};

/**
  We are using the:
  {
    jobName: 'NAME',
    cursor: Collection.find(),
    task: function(item) {}
   }
**/
const createJLogger = function(theLogger) {
  return function(jobId, jobName, job) {
    return function() {
      const msg = Array.prototype.join.call(arguments, ' ');
      theLogger.info('Job[' + jobName + ']', '[' + jobId + ']', msg);
      job.log(msg);
    };
  };
};

Meteor.startup(function startup() {

  if ( !(process.env.TEST_MODE === "unit" || process.env.TEST_MODE === "integration") ) {
    if (!Meteor.settings.disableJobCollectionLogger) {
      const loggerAsStream = wrappLoggerAsStream(Logger);
      Jobs.setLogStream(loggerAsStream);
    }
    startWorkers(createJLogger(Logger));
    Jobs.startJobServer();

    Logger.info( 'server started' );
    Logger.info( 'process.env.NODE_ENV:', process.env.NODE_ENV );
    Logger.info( 'Start date:', new Date() );
  } else {
    console.log("Running in TEST_MODE", process.env.TEST_MODE);
  }
});
