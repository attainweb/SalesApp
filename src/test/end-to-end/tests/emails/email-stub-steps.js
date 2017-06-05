import { waitForEmails } from '/test/end-to-end/tests/_support/emails';
import { _ } from 'lodash';

module.exports = function() {

  this.When(/^I send the email$/, function() {
    server.execute((userEmail) => {
      const emailActions = require('/imports/server/email-actions');
      emailActions.sendPasswordResetEmail(userEmail);
    }, this.user.email);
  });

  this.When(/^I send the email with (\d+) delay$/, function(delay) {
    server.execute((userEmail, sendDelay) => {
      const emailActions = require('/imports/server/email-actions');
      Meteor.setTimeout(() => {
        emailActions.sendPasswordResetEmail(userEmail);
      }, sendDelay);
    }, this.user.email, delay);
  });

  this.Then(/^I should receive it$/, function() {
    const history = waitForEmails();
    expect(history.length).to.equal(1);
    // TODO check for email subject and body based on user i18n
    console.log(history[0]);
    expect(history[0].to).to.equal(this.user.email);
  });

  this.Then(/^I should receive it async$/, function() {
    const emails = waitForEmails();
    expect(emails[0].to).to.equal(this.user.email);
    // TODO check for email subject and body based on user i18n
  });

  this.Then(/^I should receive both$/, function() {
    const history = waitForEmails(2);
    // TODO check for email subject and body based on user i18n
    expect(history.length).to.equal(2);
  });

  const assetMailBasic = function(emailAddress, language, emailCode) {
    const history = waitForEmails();
    const matching = _.filter(history, (email) => {
      return email.to === emailAddress && email.subject.indexOf(emailCode) > 0;
    });
    expect(matching.length).to.equal(1);
    const email = matching[0];
    // Assert footer data
    expect(email.text).to.contain("******");
    const supportEmail = server.execute( function(lang) {
      const settings = require('/imports/lib/settings');
      return settings.getSupportEmailByLanguage(lang);
    }, language);
    expect(email.text).to.contain(supportEmail);
    return email;
  };

  this.Then(/^User (.*) should receive an email with code EU([0-9]+)$/, function(userKey, emailCode) {
    const theUser = this.accounts.getUserByKey(userKey);
    assetMailBasic.bind(this)(theUser.email, theUser.personalInformation.language,'EU' + emailCode);
  });

  this.Then(/^User (.*) should receive an email with code ET([0-9]+)$/, function(userKey, emailCode) {
    const theUser = this.accounts.getUserByKey(userKey);
    const email = assetMailBasic.bind(this)(theUser.email, theUser.personalInformation.language, 'ET' + emailCode);
    console.log('email', email);
    expect(email.text).to.contain("Invoice ID");
    expect(email.text).to.contain("USD Requested");
    expect(email.text).to.contain("Invoice Date");
  });

  this.Then(/^User (.*) should receive an email with code E([U,T][0-9]+) containing (.*)$/, function(userKey, emailCode, content) {
    const theUser = this.accounts.getUserByKey(userKey);
    const email = assetMailBasic.bind(this)(theUser.email, theUser.personalInformation.language, emailCode);
    expect(email.text).to.contain(content);
  });

  this.Then(/^User (.*) should receive an email in '(.+)' with code E([U,T][0-9]+) containing (.*)$/, function(userKey, emailAddress, emailCode, content) {
    const theUser = this.accounts.getUserByKey(userKey);
    const email = assetMailBasic.bind(this)(emailAddress, theUser.personalInformation.language, emailCode);
    expect(email.text).to.contain(content);
  });
};
