import { waitAndClickButton } from '/test/end-to-end/tests/_support/webdriver';
import { createUser} from '/test/end-to-end/tests/_support/accounts';
import UserBuilder from '/imports/lib/fixtures/user-builder.js';
import _ from 'lodash';
import faker from 'faker';

const fieldsMap = {
  comparableFields: ["id", "accountType", "name", "email", "status", "birthdate",
    "createdAt", "enrollmentClientIP", "phone", "language", "residenceCountry",
    "address", "apiInvalidZip"
  ],
  companyFields: ["companyName", "registrationDate"],
  distributorFields: ["distlevel"],
  buyerFields: ["complianceLevels"],
  notPartnerFields: ["branchPartner", "referredBy"],
};

const getDifferentDate = function(date) {
  let newDate = faker.date.past();
  while (newDate === date) {
    newDate = faker.date.past();
  }
  return newDate;
};

const getFieldSelector = function(fieldCode) {
  return `.${fieldCode}-lbl`;
};

module.exports = function() {
  this.When(/^there is an user with the same birthday as (.*)$/, function(userKey) {
    this.firstUser = this.accounts.getUserByKey(userKey);
    this.secondUser = new UserBuilder()
                            .withRole(this.firstUser.roles[0])
                            .withBirthdate(this.firstUser.personalInformation.birthdate)
                            .withDistlevel(this.firstUser.personalInformation.distlevel)
                            .build();
    server.execute(createUser, this.secondUser);
  });

  this.When(/^there is an user with a different birthday than (.*)$/, function(userKey) {
    this.firstUser = this.accounts.getUserByKey(userKey);
    this.secondUser = new UserBuilder()
                            .withRole(this.firstUser.roles[0])
                            .withBirthdate(getDifferentDate(this.firstUser.personalInformation.birthdate))
                            .build();
    server.execute(createUser, this.secondUser);
    expect(this.firstUser.personalInformation.birthdate).to.not.equal(this.secondUser.personalInformation.birthdate);
  });

  this.When(/^there is a user with role (.*) with the same birthday as (.*)$/, function(role, userKey) {
    this.firstUser = this.accounts.getUserByKey(userKey);
    this.secondUser = new UserBuilder()
                            .withRole(role)
                            .withBirthdate(this.firstUser.personalInformation.birthdate)
                            .build();
    server.execute(createUser, this.secondUser);
  });

  this.When(/^I see a list of users with the same birthday$/, function() {
    expect(client.waitForVisible("#user-comparison")).to.equal(true);
  });

  this.When(/^I click expand button$/, function() {
    waitAndClickButton(".toggle-comparison");
  });

  this.Then(/^I should see matching birthdays$/, function() {
    const birthdateRevie = client.getHTML(".user-review .birthdate");
    const birthdatesCompared = client.getHTML(".user-compared .birthdate");
    expect(birthdateRevie).to.equal(birthdatesCompared);
  });

  this.Then(/^I should see an empty list of users with the same birthday$/, function() {
    client.waitForVisible("#user-comparison");
    expect(client.isVisible("#user-comparison")).to.equal(true);
    expect(client.isVisible("#toggle-comparison")).to.equal(false);
  });

  this.Then(/^I should not see the users with same birthday list$/, function() {
    expect(client.isVisible("#user-comparison")).to.equal(false);
  });

  this.Then(/^I should see the same fields shown for the reviewee to compare the data$/, function() {
    let fields = fieldsMap.comparableFields;

    if (this.firstUser.roles[0] === this.secondUser.roles[0]) {
      fields = fields.concat(fieldsMap[`${this.firstUser.roles[0]}Fields`]);

      if ((this.firstUser.roles[0] !== 'distributor') || (this.firstUser.personalInformation.distlevel !== 0 && this.secondUser.personalInformation.distlevel !== 0) ) {
        fields = fields.concat(fieldsMap.notPartnerFields);
      }
    }

    if (this.firstUser.accountType === 'company' && this.secondUser.accountType === 'company' ) {
      fields = fields.concat(fieldsMap.companyFields);
    }

    fields.forEach(function(field) {
      expect(client.getHTML(getFieldSelector(field)).length, `checking field ${field}`).to.equal(3);
    });
  });
};
