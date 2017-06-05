import {waitAndGetText} from '/test/end-to-end/tests/_support/webdriver';

module.exports = function() {

  this.Then(/^the tab counters must be updated$/, function() {
    const forceReserveLabel = waitAndGetText('#forceReserve');
    const salePendingLabel = waitAndGetText('#salePending');
    expect(forceReserveLabel, 'The ticket is no longer in forceReserve tab').to.contains('0');
    expect(salePendingLabel, 'The ticket is now counted in sale pending').to.contains('1');
    if ( this.testTicket.paymentOption === 'Btc') {
      const btcOrdersLabel = waitAndGetText('#btcOrders');
      expect(btcOrdersLabel, 'The ticket is now counted in btc Orders').to.contains('1');
    }
  });

};
