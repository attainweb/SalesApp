import { Jobs } from '/lib/collections/jobs.js';

Jobs.jobNames = {};

Meteor.startup(function jobsStartup() {
  Jobs.startJobServer();
});
