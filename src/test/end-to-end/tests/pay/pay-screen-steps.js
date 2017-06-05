import { waitAndGetText } from '/test/end-to-end/tests/_support/webdriver';

module.exports = function() {
  this.When(/^I go to payment page$/, function() {
    this.router.visit(`pay/${this.testTicket._id}`);
  });

  this.Then(/^I shoudld see (.*) invoice data$/, function(invoiceType) {
    const usdRequested = waitAndGetText(".usdRequested");
    expect(usdRequested).to.equal("$1,000");
    if (invoiceType === 'Btc') {
      const btcAddress = waitAndGetText(".btcAddress");
      expect(btcAddress).to.equal(this.testTicket.btcAddress);
    }
  });
};
