import { waitAndClickButton } from '../_support/webdriver';
import { getUserFromDB } from '../_support/accounts';
import { expectAlertWithText } from '../_support/alerts';
import { i18nTest } from '../_support/i18n';
import { waitForEmails } from '../_support/emails';

const inputEmail = function (client, inputEmailAddress) {
  client.waitForVisible('input[id=email-input]');
  client.execute(`document.getElementById('email-input').setAttribute('value', '${inputEmailAddress}')`);
};

module.exports = function() {

  this.When(/^I click the change email button$/, function () {
    browser.waitForExist(".modal-backdrop", undefined, true);
    waitAndClickButton("#update-email-button");
  });

  this.When(/^I input the new email '(.+)'$/, function(inputEmailAddress) {
    this.inputEmailAddress = inputEmailAddress;
    inputEmail(client, inputEmailAddress);
  });

  this.Then(/^My existing email address is not changed$/, function() {
    const storedUser = getUserFromDB(this.user.id, { emails : 1 });
    expect(storedUser.emails[0].address).not.to.equal(this.inputEmailAddress);
  });

  this.Then(/^My email address has changed$/, function() {
    // One mail for confirmation, two for generated invoices with copies to bcc
    waitForEmails(5);
    const storedUser = getUserFromDB(this.user.id, {emails : 1 });
    expect(storedUser.emails[0].address).to.equal(this.inputEmailAddress);
    // Update email in tests as well
    this.user.email = this.inputEmailAddress;
  });

  this.Then(/^I input my current email for the new email$/, function() {
    inputEmail(client, this.user.email);
  });

  this.Then(/^I receive an email change error for (.+)$/, function(errorCode) {
    const errorMessage = i18nTest('modals.accountInfo.changeEmail.errors.' + errorCode);
    expectAlertWithText(errorMessage);
  });

  this.Then(/^I input (.+)'s email address for the new email$/, function(userCode) {
    const otherUser = this.accounts.getUserByKey(userCode);
    inputEmail(client, otherUser.email);
  });

  this.Then(/^I don't see the change email button$/, function() {
      browser.waitForExist(".account-email", 100);
      browser.waitForExist('.update-email-button', 100, true);
  });

  this.Then(/^I get unauthorized error if I execute the meteor call$/, function() {
    const result = client
      .timeoutsAsyncScript(5000)
      .executeAsync(function(emailAddress, done) {
        Meteor.call('changeEmailAddressToCurrentUser', emailAddress, function(err) {
          if (err) {
            done(err.error);
          } else {
            done();
          }
        });
      }, 'test@test.com');
      expect(result.value).to.equal('unauthorized');
  });


};
