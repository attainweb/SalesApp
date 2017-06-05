import { waitAndClickButton } from '/test/end-to-end/tests/_support/webdriver';
import { waitForEmails } from '/test/end-to-end/tests/_support/emails';
import { confirmModal, okModal } from '/test/end-to-end/tests/_support/alerts';
import { i18nTest } from '/test/end-to-end/tests/_support/i18n';
import { _ } from 'lodash';


module.exports = function() {

  this.Before(function() {
    this.OLD_PRODUCT_PASSCODE = "TEST_OLD_PRODUCT_PASSCODE";
    this.NEW_PRODUCT_PASSCODE = "TEST_NEW_PRODUCT_PASSCODE";
    server.execute( productPasscode => {
      require('/imports/server/product-passcode-generator').configure(function() {
        return productPasscode;
      });
    }, this.NEW_PRODUCT_PASSCODE);
  });

  this.Given(/^I have invoices with already receipt sent$/, function() {
    const buyerId = this.user.id;
    const btcInvoice = this.invoices.createAndSave("Btc", "receiptSent", buyerId);
    this.invoices.fakeSendReceipt(btcInvoice._id, this.OLD_PRODUCT_PASSCODE);
    const bankInvoice = this.invoices.createAndSave("Bank", "receiptSent", buyerId);
    this.invoices.fakeSendReceipt(bankInvoice._id, this.OLD_PRODUCT_PASSCODE);
  });

  this.When(/^I click Regenerate PRODUCT codes$/, function() {
    waitAndClickButton(".request-regenerate-all-product-passcodes-button");
  });

  this.When(/^I confirm the Regenerate Modal$/, function() {
    confirmModal();
    okModal();
  });

  this.When(/^I receive an email with confirmation link to regenerate PRODUCT codes$/, function() {
    const history = waitForEmails();
    expect(history.length).to.equal(1);
    expect(history[0].subject).to.contain('(Email Id: EU501)');
    expect(history[0].to).to.equal(this.user.email);
    expect(history[0].bcc).to.be.undefined;
  });

  this.Then(/^my invoices has regenerate your PRODUCT codes$/, function() {
    this.invoices.getInvoicesFromDB({}, {productPasscodeHash: 1}).forEach((invoice) => {
      expect(invoice.productPasscodeHash).to.equal(this.HASHED_NEW_PRODUCT_PASCODE);
    });
  });

  this.Then(/I should receive an email with code ET301 for each invoice with the new PRODUCT codes$/, function() {
    const history = waitForEmails(4);
    // emails = 4 because for each email to the buyer, the company receives a copy.
    const emails = _.filter(history, (email) => {
      return email.to === this.user.email && email.subject.indexOf('(Email Id: ET301)') > 0;
    });
    expect(emails.length).to.equal(2);
    emails.forEach((email) => {
      expect(email.text).to.not.contain(this.OLD_PRODUCT_PASSCODE);
      expect(email.text).to.contain(this.NEW_PRODUCT_PASSCODE);
    });
  });

  this.Then(/I should see a message saying that all my passcodes were regenerated successfully$/, function() {
    const successMessage = i18nTest('reGenerateProductPasscodes.success.confirmAll');
    const successElement = '.success';
    client.waitForVisible(successElement);
    expect(client.getText(successElement)).to.equal(successMessage);
  });
};
