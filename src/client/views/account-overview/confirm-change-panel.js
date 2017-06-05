'use strict';

const message = new ReactiveVar();

TemplateController('confirmChange', {

  onCreated() {
    const refcode = this.data.refcode;
    const namespace = this.data.namespace;
    message.set("loading...");
    Meteor.call(this.data.confirmMeteorCall, refcode, function(err) {
      if (err) {
        message.set(namespace + '.errors.' + err.error);
      } else {
        message.set(namespace + '.thankYou');
      }
    });
  },
  helpers: {
    hasError() {
      return message.get().indexOf('errors') >= 0;
    },
    message() {
      return message.get();
    },
    progressSteps() {
      return this.data.progressSteps;
    },
    progressCol() {
      return 12 / this.data.progressSteps.length;
    }
  }
});
