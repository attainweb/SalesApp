import UserBuilder from '/imports/lib/fixtures/user-builder.js';
import { createUser } from '/test/end-to-end/tests/_support/accounts.js';
import { waitAndSetValue, pressEnter } from '/test/end-to-end/tests/_support/webdriver';

module.exports = function() {
  this.Given(/^there is a (.+) (.+) with email (.*)$/, function(status, role, email) {
    const user = new UserBuilder()
      .withEmail(email)
      .withStatus(status)
      .withRole(role)
      .build();

    server.execute(createUser, user);
  });

  this.When(/^search for (.*)$/, function(email) {
    waitAndSetValue(".form-control", email);
    pressEnter();
  });

  this.Then(/^I should see listed user with email (.*)$/, function(email) {
    client.waitForVisible(`//td[contains(text(), '${email}')]`);
  });

  this.Then(/^I should not see listed user with email (.*)$/, function(email) {
    client.waitForVisible(`//td[contains(text(), '${email}')]`, 1000, true);
  });
};
