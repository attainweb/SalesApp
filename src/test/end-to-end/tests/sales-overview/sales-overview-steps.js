import { waitAndGetText } from '../_support/webdriver';

module.exports = function() {
  this.Then(/I can see salesStatus as started/, function() {
    client.waitForVisible(".fa.fa-play");
  });

  this.Then(/I can see the ProductCounter values/, function() {
    const totalAmountAvailable = waitAndGetText("#total-amount-available");
    const overcapacityThreshold = waitAndGetText("#overcapacity-treshold");
    const amountInvoicedAndPaid = waitAndGetText("#amount-invoiced-and-paid");
    const amountPaid = waitAndGetText("#amount-paid");

    expect(totalAmountAvailable).to.not.equal('');
    expect(overcapacityThreshold).to.not.equal('');
    expect(amountInvoicedAndPaid).to.not.equal('');
    expect(amountPaid).to.not.equal('');
  });
};

