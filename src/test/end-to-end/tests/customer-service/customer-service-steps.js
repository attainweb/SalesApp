import {waitAndClickButton, waitAndSetValue} from '/test/end-to-end/tests/_support/webdriver';

module.exports = function() {
  this.When(/^I search for the email (.*) in customer service dashboard$/, function(email) {
    const searchBar = 'input[type=text]';
    waitAndSetValue(searchBar, email);
    client.click('.text-center');
  });
  this.When(/^I click review user$/, function() {
    waitAndClickButton('.review-btn');
  });
  this.When(/^I send the user to HCO$/, function() {
    waitAndClickButton('.send-to-hco');
  });
  this.Then(/^I should see the sent to HCO message$/, function() {
    client.waitForVisible(".text-danger");
  });
  this.Then(/^the edit button is not there$/, function() {
    client.waitForVisible("button[class=edit-email]", undefined, true);
  });
};

