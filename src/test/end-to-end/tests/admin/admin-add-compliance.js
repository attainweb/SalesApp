import faker from "faker";

module.exports = function() {
  this.When(/^I fill in the form with a valid name, email and password$/, function() {
    client.waitForVisible("#admin-name");
    this.newUser = {
      email: faker.internet.email(),
      password: "Aasdf1234"
    };
    client.setValue("#admin-name", faker.name.firstName());
    client.setValue("#admin-email", this.newUser.email);
    client.setValue("#admin-password", this.newUser.password);
  });

  this.When(/^I fill in the form with an email already in use$/, function() {
    client.waitForVisible("#admin-name");
    this.newUser = {
      email: "test-email+admin1@company.com",
      password: "Aasdf1234"
    };
    client.setValue("#admin-name", faker.name.firstName());
    client.setValue("#admin-email", this.newUser.email);
    client.setValue("#admin-password", this.newUser.password);
  });

  this.When(/^I confirm$/, function() {
    client.click("#btn-signup");
  });

  this.When(/^I fill in the form with (.*) email$/, function name(userName) {
    client.waitForVisible("#admin-name");
    this.newUser = {
      email: this.accounts.getUserByKey(userName).email,
      password: "Aasdf1234"
    };
    client.setValue("#admin-name", faker.name.firstName());
    client.setValue("#admin-email", this.newUser.email);
    client.setValue("#admin-password", this.newUser.password);
  });

  this.Then(/Confirmation should be seen/, function() {
    client.waitForVisible("#add-compliance-officer-form .notifications");
  });

  this.Then(/^New user should be able to login$/, function() {
    this.accounts.login(this.newUser);
  });
  this.Then(/^error message should be displayed$/, function() {
    client.waitForVisible(".bootbox-body");
  });

};
