'use strict';

import { Meteor } from 'meteor/meteor';

class Logger {

  constructor() {
    // Create a loggly client if enabled in the settings
    if (Meteor.settings.loggly && Meteor.settings.loggly.enabled) {
      const logglyConfig = {
        json: true
      };
      Object.assign(logglyConfig, Meteor.settings.loggly);
      try {
        this.loggly = Npm.require('loggly').createClient(logglyConfig);
      }
      catch (e) {
        console.error('Loggly failed to load (Npm.require)\n', e);
      }
    }

    // Create different kinds of logging methods
    for (let method of ['log', 'trace', 'info', 'warn', 'error']) {
      this[method] = (...args) => {
        if (!process.env.DISABLE_CONSOLE_LOGS) {
          console[method](args);
        }
        if (!!this.loggly) {
          this.loggly.log(args, method);
        }
      };
    }
  }
}

// Export as default to make imports prettier (and since we do not export anything else)
export default new Logger();
