'use strict';

import { waitAndGetValue, waitAndGetText } from '../_support/webdriver';
import _ from 'lodash';

module.exports = function() {
  this.Then(/I can see the current jobs/, function() {

    const jobItems = waitAndGetValue('.job-item');
    expect(jobItems.length).to.be.gt(0);

    const firstItemSelector = 'tr.job-item:first';
    const jobType = client.execute(selector => { return $(selector).text(); }, `${firstItemSelector} .job-type`).value;
    const jobStatus = client.execute(selector => { return $(selector).text(); }, `${firstItemSelector} .job-status`).value;
    const jobCreated = client.execute(selector => { return $(selector).text(); }, `${firstItemSelector} .job-created`).value;
    const jobUpdated = client.execute(selector => { return $(selector).text(); }, `${firstItemSelector} .job-updated`).value;

    expect(jobType).to.contain("Worker");
    const possibleStatus =  ['waiting', 'paused', 'cancelled', 'ready', 'running', 'failed', 'completed', 'stalled'];
    expect(possibleStatus.indexOf(jobStatus.trim()), `Unrecognized status ${jobStatus}.`).to.be.gt(-1);
    expect(jobCreated).isObject;
    expect(jobUpdated).isObject;
  });

  this.Then(/there is a job in (.+) state started an hour ago/, function(jobStatus) {
    this.theJob = server.execute(jobStatus => {
      const Jobs  = require('/lib/collections/jobs.js').Jobs;
      const aJob = Jobs.find({}, { sort: { type: 1 } }).fetch()[0];
      const started = moment().subtract(1, 'hour').toDate();
      Jobs.update({_id: aJob._id}, { $set: { status: jobStatus, created: started} });
      return aJob;
    }, jobStatus);
  });

  this.Then(/I can see the job with status '(.+)' in red/, function(jobState) {
    const jobItems = waitAndGetValue('.job-item');
    expect(jobItems.length).to.be.gt(0);

    const selector = `tr.job-item:has(td:contains('${jobState}'))`;
    const stalledJob = client.execute(selector => { return $(selector).text(); }, selector).value;
    expect(stalledJob).to.contain(this.theJob.type);
  });
};



