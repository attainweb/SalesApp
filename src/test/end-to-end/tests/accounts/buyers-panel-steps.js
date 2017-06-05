import { waitAndClickButton } from '../_support/webdriver';

const getStateArrayByLable = function(invoices, stateLable) {
  switch (stateLable) {
    case 'paid':
      return invoices.paidStates;
    case 'unpaid':
      return invoices.unpaidStates;
    case 'cancelled':
      return invoices.distributorsCancelledStates;
    default:
      break;
  }
  return [];
};

module.exports = function() {
  this.When(/I click the open all tabs button/, function() {
    waitAndClickButton('.toggle-all');
  });

  this.Given(/^there are tickets in (.+) states for user (.*)/, function(state, reviewUserKey) {
    const user = this.accounts.getUserByKey(reviewUserKey);
    const states = getStateArrayByLable(this.invoices, state);
    for (let i = 0; i < states.length; i++) {
      this.invoices.createAndSave('Btc', states[i], user._id, '1000');
    }
  });

  this.Then(/All tickets should show paymentState (.+)/, function(state) {
    const expectedLenght = getStateArrayByLable(this.invoices, state).length;
    expect(client.getHTML(`.${state}`).length, `Invalid amount of Tickets with state ${state}`).to.equal(expectedLenght);
  });
};
