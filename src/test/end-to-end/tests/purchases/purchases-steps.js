import { waitAndClickButton, waitAndGetText } from '../_support/webdriver';
import { } from '../_support/refs';
import { i18nTest } from '/test/end-to-end/tests/_support/i18n';

module.exports = function() {

  this.Then(/^I should see the Purchases list$/, function() {
    client.waitForVisible('.data-panel');
  });

  this.When(/^I click "Regenerate PRODUCT Code"$/, function() {
    waitAndClickButton(".ticket-card-panel-toggle");
    waitAndClickButton(".regenerate-product-code");
  });

  const execMeteorCall = function(meteorMethod, param) {
    const result = client
      .timeoutsAsyncScript(5000)
      .executeAsync( function(meteorMethod, param, done) {
        Meteor.call(meteorMethod, param, function(err) {
          if (err) {
            done(err.error);
          } else {
            done();
          }
        });
      }, meteorMethod, param);
    this.error = result.value;
  };

  this.When(/^I try to execute the meteor call to re-generate other's buyer's ticket$/, function() {
    execMeteorCall.bind(this)('requestRegenerateProductPasscode', this.testTicket._id);
  });

  this.Then(/^I'm denied with unauthorized error$/, function() {
    expect(this.error).to.equal('unauthorized');
  });

  this.Then(/I should see a message saying that my passcode were regenerated successfully$/, function() {
    const successMessage = i18nTest('reGenerateProductPasscodes.success.confirmOne');
    const successElement = '.success';
    client.waitForVisible(successElement);
    expect(client.getText(successElement)).to.equal(successMessage);
  });

  this.Then(/Ticket should have increased the generation counter by one$/, function() {
    const productPascodeGenerations = waitAndGetText('.product-pascode-generations');
    expect(productPascodeGenerations).to.equal('2');
  });

};
