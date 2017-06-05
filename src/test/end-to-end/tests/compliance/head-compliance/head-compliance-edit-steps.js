import { waitAndClickButton, waitAndSetValue, waitAndSelect, waitAndGetText } from '/test/end-to-end/tests/_support/webdriver';
import { getUserFromDB } from '/test/end-to-end/tests/_support/accounts';
import { getTranslatedCountry } from '/test/end-to-end/tests/_support/residenceCountries';
import { getRefcodesByOriginatorId } from '../../_support/refs.js';
import RefsBuilder from '/imports/lib/fixtures/refs-builder.js';

import moment from 'moment';
import faker from 'faker';
import _ from 'lodash';

const testUser = {
  name: faker.name.firstName(),
  surname: faker.name.lastName(),
  email: faker.internet.email(),
  birthdate: "2016-09-13",
  phone: faker.phone.phoneNumber(),
  status: "PENDING",
  language: "ja",
  residenceCountry: "KH",
  zip: faker.address.zipCode(),
  state: faker.address.state(),
  city: faker.address.city(),
  address: faker.address.streetAddress(),
};


module.exports = function() {
  this.When(/^I enter the (.*)$/, function(field) {
    waitAndSetValue(`input[name='personalInformation.${field}']`, testUser[field]);
  });

  this.When(/^I click edit\-(.*)$/, function(field) {
    this.userBeforeSaving = getUserFromDB(this.accounts.getUser(this.reviewUserEmail)[0]._id);
    waitAndClickButton(`.edit-${field}`);
  });

  this.When(/^I enter my password$/, function() {
    waitAndSetValue(`input[name='password']`, this.user.password);
  });

  this.When(/^I submit a wrong password for field (.*)$/, function(field) {
    waitAndSetValue(`input[name='password']`, this.user.password + this.user.password);
    waitAndClickButton(`.update-${field}`);
  });

  this.Then(/^A new record in changelog about (.*) is created$/, function(field) {
    const updatedField = field === 'residence-country' ? 'residenceCountry' : field;
    const updatedUser = getUserFromDB(this.accounts.getUser(this.reviewUserEmail)[0]._id);
    const changelogLength = updatedUser.changelog.length;
    expect(changelogLength).to.equal(this.userBeforeSaving.changelog.length + 1);
    const changelogEntry = updatedUser.changelog[changelogLength - 1];
    expect(changelogEntry.field).to.contain(updatedField);
    let userData =  changelogEntry.value;
    if (updatedField === 'birthdate') {
      userData = moment.utc(updatedUser.changelog[changelogLength - 1].value).format('YYYY-MM-DD');
    }
    expect(userData).to.equal(testUser[updatedField]);
    expect(changelogEntry.changedBy).to.equal(this.user._id);
  });

  this.When(/^I submit the (.*)$/, function(field) {
    waitAndClickButton(`.update-${field}`);
    client.waitForVisible(`.update-${field}`, 5000, true);
  });

  this.When(/^I click update the (.*)$/, function(field) {
    waitAndClickButton(`.update-${field}`);
  });

  this.When(/^I change the (.*)$/, function(field) {
    waitAndSetValue(`input[name='personalInformation.postaddress.${field}']`, testUser[field]);
  });

  this.When(/^I edit the email address$/, function() {
    waitAndSetValue(`input[name=email]`, testUser.email);
    waitAndSetValue(`input[name=emailCheck]`, testUser.email);
  });

  this.When(/^I edit the (.*) to (.*)$/, function(field, select) {
    waitAndSelect(`select[name='personalInformation.${field === "residence-country" ? "residenceCountry" : field}']`, select);
  });

  this.Then(/^I should see the user\'s (.*) updated$/, function(field) {
    const text = waitAndGetText(`.${field}`);
    let userData = testUser[field === "residence-country" ? 'residenceCountry' : field];
    switch (field) {
      case "birthdate":
        userData = moment(userData, "YYYY-MM-DD").format('MM/DD/YYYY');
        break;
      case "status":
        userData = _.capitalize(userData);
        break;
      case "residence-country":
        userData = client.execute(getTranslatedCountry, userData).value;
        break;
      default:
        break;
    }
    expect(text).to.equal(userData);
  });

  this.Then(/^the validation error count should be (\d+)$/, function(count) {
    client.waitForVisible('div.has-error');
    const errors = client.execute(function() {
      return $("div.has-error").find(".help-block");
    }).value;
    expect(errors.length).to.equal(parseInt(count, 10));
  });

  this.Given(/^user (.+) has a valid (.+) refcode$/, function(userCode, refCodeType) {
    const user = this.accounts.getUserByKey(userCode);
    const refsBuilder = new RefsBuilder();
    let ref = refsBuilder
      .withOriginatorId(user.id)
      .withReftype(refCodeType)
      .withIsActive(true)
      .build();
    ref = this.refs.insertRefcode(ref);
    expect(ref.isActive).to.be.true;
  });

  this.Then(/^all refcodes belonging to (.+) should be expired$/, function(userCode) {
    const user = this.accounts.getUserByKey(userCode);
    const refs = this.refs.getRefcodesByOriginatorId(user.id);
    expect(refs.length).to.equal(2);
    expect(refs[0].isActive).to.be.false;
    expect(refs[1].isActive).to.be.false;
  });


};
