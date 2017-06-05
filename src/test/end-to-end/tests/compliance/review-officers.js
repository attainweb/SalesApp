import { waitAndGetText } from '/test/end-to-end/tests/_support/webdriver';

module.exports = function() {
  this.Then(/^the reviewer name is empty$/, function() {
    const name = waitAndGetText(".reviewer-name");
    expect(name).to.eq('');
  });
};
