module.exports = function() {
  this.Before(function() {
    // Create the email stub
    server.execute(() => {
      const emailStub = require('/imports/lib/fixtures/email-stub.js');
      require('/imports/server/email-service.js').configure(emailStub.create());
    });
  });
};

/**
 * Fetches from the stub the email service send call history
 */
module.exports.callHistory = function() {
  return server.execute(() => {
    const emailStub = require('/imports/lib/fixtures/email-stub.js');
    return emailStub.callHistory();
  });
};

/**
 * Fetches from the stub the email service the number of times
 * send was called
 */
module.exports.callCount = function() {
  return server.execute(() => {
    const emailStub = require('/imports/lib/fixtures/email-stub.js');
    return emailStub.callCount();
  });
};

/**
 * Waits until all emails are sent
 * @param count - Specifies to the email stub how many emails we expect
 */
module.exports.waitForEmails = function(expectedCount) {
  return server.execute((count) => {
    const emailStub = require('/imports/lib/fixtures/email-stub.js');
    return emailStub.waitFor(count);
  }, expectedCount);
};

/**
 * Reset call history
 */
module.exports.resetHistory = function() {
  return server.execute(() => {
    const emailStub = require('/imports/lib/fixtures/email-stub.js');
    return emailStub.reset();
  });
};
