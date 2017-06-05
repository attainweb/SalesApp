import { waitAndClickButton, waitAndSetValue, waitAndGetText, pressEnter } from '/test/end-to-end/tests/_support/webdriver';


module.exports = function() {
  this.Then(/^the user is there$/, function() {
    const userEmail = waitAndGetText(".email");
    expect(userEmail).to.equal(this.currentTestUsers[0].email);
    const tabCounterText = waitAndGetText("#all");
    expect(tabCounterText).to.contain(1);
  });

  this.Then(/^the user (.*) is there$/, function(user) {
    const userEmail = waitAndGetText(".email");
    expect(userEmail).to.equal(this.accounts.getUserByKey(user).email);
  });

  this.When(/^I search by (.+) with a valid (.+)$/, function(filter, fieldName) {
    let seachingUserData = this.currentTestUsers[0].personalInformation[fieldName];
    if (fieldName === "email") {
      seachingUserData = this.currentTestUsers[0].email;
    }
    waitAndClickButton(".search_bar .dropdown-toggle");
    waitAndClickButton(`a[data-filter-label="${filter}"]`);
    waitAndSetValue('.input-search-value', seachingUserData);
    pressEnter();
  });

};
