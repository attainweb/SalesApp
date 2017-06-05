'use strict';

import { Jobs } from '/lib/collections/jobs.js';

TemplateController('jobsMonitor', {
  onCreated() {
    Meteor.subscribe('jobs');
  },
  private: {
    isStalled(jobStatus, jobCreatedAt) {
      return jobStatus === 'running' && moment(/*now*/).subtract(1, 'hour').isAfter(jobCreatedAt);
    }
  },
  helpers: {
    jobs() {
      return Jobs.find({}, { sort: { type: 1, created: -1, updated: -1 }});
    },
    statusClass(jobStatus, jobCreatedAt) {
      if ( this.isStalled(jobStatus, jobCreatedAt)) {
        return 'danger';
      }
      switch (jobStatus) {
        case 'waiting':
          return 'info';
        case 'paused':
        case 'cancelled':
          return 'default';
        case 'ready':
        case 'running':
          return 'primary';
        case 'failed':
          return 'danger';
        case 'completed':
          return 'success';
        default:
          return 'warning';
      }
    },
    statusLabel(jobStatus, jobCreatedAt) {
      if (this.isStalled(jobStatus, jobCreatedAt)) {
        return 'stalled';
      }
      return jobStatus;
    }
  }
});
