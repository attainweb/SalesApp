import { waitForEmails } from '/test/end-to-end/tests/_support/emails';
import { getUserFromDB, createMultipleUsers, createUser } from '/test/end-to-end/tests/_support/accounts';
import { residenceCountries } from '/test/end-to-end/tests/_support/residenceCountries';
import UserBuilder from '/imports/lib/fixtures/user-builder.js';

module.exports = function() {

  this.Given(/^the officer (.*) is reviewing the user (.*)$/, function(officerKey, reviewUserKey) {
    const officer = this.accounts.getUserByKey(officerKey);
    this.officerReviewer = officer;
    const user = this.accounts.getUserByKey(reviewUserKey);
    server.execute((userId, officerId) => {
      const { reviewUser } = require('/imports/server/users/compliance.js');
      reviewUser(userId, officerId);
    }, user.id, officer.id);
  });

  this.When(/^I review the (.*)$/, function(userKey) {
    const officer = this.user;
    const officerRole = this.user.roles[0];
    const buyer = this.accounts.getUserByKey(userKey);
    server.execute((buyerId, officerId, role) => {
      const { sendUserToOfficer, reviewUser } = require('/imports/server/users/compliance.js');
      if (role === 'chiefcompliance') {
        sendUserToOfficer(buyerId, 'Cco', officerId);
      }
      reviewUser(buyerId, officerId);
    }, buyer.id, officer.id, officerRole);
  });

  this.Then(/^I am not reviewing the user$/, function() {
    const officer = getUserFromDB(this.user._id);
    expect(officer.reviewing).not.to.exist; // matches undefined and null
  });

  this.Then(/^I am reviewing the (.*)$/, function(revieweeKey) {
    const officer = getUserFromDB(this.user._id);
    const reviewee = this.accounts.getUserByKey(revieweeKey);
    expect(officer.reviewing).to.equal(reviewee._id); // matches undefined and null
  });

  this.Then(/^(.*) should receive the approval email with code (.*)$/, function(userKey, emailCode) {
    const history = waitForEmails();
    const approvedUser = this.accounts.getUserByKey(userKey);
    expect(history.length).to.equal(1);
    expect(history[0].subject).to.contain('(Email Id: ' + emailCode + ')');
    expect(history[0].to).to.equal(approvedUser.email);
  });

  this.Given(/^there are (\d+) users in compliance$/, function(count) {
    const userTemplateFunction = function() {
      return new UserBuilder().withRole('buyer').withApplyingForComplianceLevel(1).withStatus('PENDING').build();
    };
    createMultipleUsers.bind(this)(count, userTemplateFunction);
  });

  this.Given(/^there are (\d+) users in compliance with country of residence (.+)$/, function(count, countryName) {
    const country = residenceCountries[countryName];
    const userTemplateFunction = function() {
      return new UserBuilder().withRole('buyer').withApplyingForComplianceLevel(1).withStatus('PENDING').withResidenceCountry(country).build();
    };
    createMultipleUsers.bind(this)(count, userTemplateFunction);
  });

  this.Given(/^there are users in compliance with every compliance level$/, function() {
    const userTemplateFunction = function(level) {
      return new UserBuilder().withRole('buyer').withApplyingForComplianceLevel(level).withStatus('PENDING').withResidenceCountry("JP").build();
    };
    for (let i = 1; i <= 12; i++) {
      server.execute(createUser, userTemplateFunction(i));
    }
  });
};
