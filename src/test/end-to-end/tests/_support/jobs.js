'use strict';

module.exports.waitForWorkerIsReady = function(jobName) {
  server.execute(function(jobType) {
    const Future = require('fibers/future');
    let jobMarkAsReady = new Future();
    const doUntilJobIsReady = function() {
      let { markJobAsReady } = require('/imports/server/workers');
      let isReady = markJobAsReady(jobType);
      if (isReady === true) {
        jobMarkAsReady.return(isReady);
      } else {
        Meteor.setTimeout( () => {
          doUntilJobIsReady();
        }, 100);
      }
    };
    doUntilJobIsReady();
    return jobMarkAsReady.wait();
  }, jobName);
};
