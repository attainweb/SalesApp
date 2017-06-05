import UserBuilder from '/imports/lib/fixtures/user-builder.js';
import { createUser, updateUserField } from '/test/end-to-end/tests/_support/accounts.js';
import { waitAndClickButton } from '/test/end-to-end/tests/_support/webdriver';
import moment from 'moment';

module.exports = function() {

  const createDistributor = function(name, surname) {
    const user = new UserBuilder()
      .withEmail(`${name}.${surname}@company.com`)
      .withName(name)
      .withSurname(surname)
      .withStatus('APPROVED')
      .withRole('distributor')
      .build();
    return server.execute(createUser, user);
  };

  this.Given(/^there is a distributor named (.*) (.*)$/, function(name, surname) {
    this.fixtures.users[name] = createDistributor(name, surname);
  });

  const fillUserInput = function(client, inputName, inputValue) {
    const selector = `input[name="${inputName}"]`;
    client.waitForExist(selector);
    client.execute( (clientSelector, clientValue) => {
      $(clientSelector).val(clientValue);
      $(clientSelector).focus();
    }, selector, inputValue);
  };

  this.When(/^I search for the refcode$/, function() {
    const ref = this.fixtures.refs[0];
    fillUserInput(client, 'externalInfo.refcode', ref.refcode);
  });

  this.When(/^I search the refcode for (.*)$/, function(name) {
    const ownerId = this.fixtures.users[name]._id;
    const ref = this.fixtures.refs.find(refcode => refcode.originatorId === ownerId);
    fillUserInput(client, 'externalInfo.refcode', ref.refcode);
  });

  this.When(/^I search for the (.*) with value (.*)$/, function(field, value) {
    let inputSelector;
    if (field === 'email') {
      inputSelector = 'fuzzySearchEmails.normalized';
    } else {
      inputSelector = `personalInformation.${field}`;
    }
    fillUserInput(client, inputSelector, value);
  });

  this.When(/^I click search$/, function() {
    waitAndClickButton('.search-users');
  });

  this.When(/^I click review and back$/, function() {
    waitAndClickButton('button.review-btn');
    waitAndClickButton('button.cancel-user');
    waitAndClickButton('.modal-footer .btn-primary');
  });


  this.Then(/^I should see listed (.*) (.*) in position (\d+)$/, function(name, surname, position) {
    const xpath = `//tr[(td[contains(text(), '${name}')]) and (td[contains(text(), '${surname}')]) ]`;
    client.waitForVisible(xpath, 1000);
    const index = client.getAttribute(xpath, 'data-index');
    expect(parseInt(index, 10)).to.equal(position - 1);
  });

  this.Then(/^I should see the user with email (.*) in position (\d+)$/, function(email, position) {
    const xpath = `//tr[(td[contains(text(), '${email}')])]`;
    client.waitForVisible(xpath, 1000);
    const index = client.getAttribute(xpath, 'data-index');
    expect(parseInt(index, 10)).to.equal(position - 1);
  });

  this.Then(/^I should see the (.*) search field with the value (.*)$/, function(field, value) {
    let inputSelector;
    if (field === 'email') {
      inputSelector = 'fuzzySearchEmails.normalized';
    } else {
      inputSelector = `personalInformation.${field}`;
    }
    const selector = `input[name="${inputSelector}"]`;
    client.waitForExist(selector);
    let response = client.execute( (clientSelector) => {
      let curVal = $(clientSelector).val();
      return curVal;
    }, selector);
    expect(value).to.equal(response.value);
  });

  this.Given(/^User (.*) has set (.*) with value (.*)$/, function(userKey, field, value) {
    const userId = this.accounts.getUserByKey(userKey)._id;
    const parsedField = 'personalInformation.' + field;
    let updateValue = value;
    if (field === 'birthdate' || field === 'registrationDate') {
      updateValue = moment.utc(value).toDate();
    }
    updateUserField(userId, parsedField, updateValue);
  });


};
