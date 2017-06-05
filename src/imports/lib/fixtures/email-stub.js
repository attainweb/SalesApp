const Future = Npm.require('fibers/future');

let history = [];
let future = new Future();

export const callCount = function() {
  return history.length;
};

export const create = function() {
  history = [];
  return function(to, subject, text, bcc) {
    const newEmail = {
      to,
      subject,
      text,
      bcc
    };
    history.push(newEmail);
  };
};

export const callHistory = function() {
  return new Array(...history);
};

export const dequeueCallHistory = function() {
  return history.shift();
};

export const reset = function() {
  history = [];
};

export const waitFor = function(count) {
  // console.log("waitFor", waitForCount, history.length, callCount());
  future = new Future();
  const waitForCount = parseInt(count || 1, 0);
  const self = {history, callCount };
  const doUntilMailIsReady = function() {
    // console.log("waitFor - inner", waitForCount, self.history.length, self.callCount());
    if (self.callCount() >= waitForCount) {
      future.return(self.history);
    } else {
      Meteor.setTimeout( () => {
        doUntilMailIsReady();
      }, 100);
    }
  };
  doUntilMailIsReady();
  return future.wait();
};
