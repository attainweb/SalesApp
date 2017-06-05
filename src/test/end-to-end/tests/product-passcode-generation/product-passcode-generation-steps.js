import {waitForEmails} from '/test/end-to-end/tests/_support/emails';
import {getServerEnv, getSHA256} from '/test/end-to-end/tests/_support/helpers';

module.exports = function() {

  const checkForEmail = function checkForEmail(to, passcode) {
    const history = waitForEmails(2);
    expect(history.length).to.equal(2);
    const emailSentToBuyer = history.find(email => email.to === to);
    expect(emailSentToBuyer.subject).to.contain('(Email Id: ET301)');
    expect(emailSentToBuyer.text).to.contain(passcode);
  };

  this.Before(function() {
    this.PRODUCT_PASSCODE = "TEST_PRODUCT_PASSCODE";
    this.HASHED_PRODUCT_PASSCODE = getSHA256(this.PRODUCT_PASSCODE);
  });

  this.When(/^I pay my ticket$/, function() {
    server.execute( productPasscode => {
      require('/imports/server/product-passcode-generator').configure(function() {
        return productPasscode;
      });
    }, this.PRODUCT_PASSCODE);
    this.testInvoice = this.invoices.createAndSave("btc", "satoshisReceived", this.user._id, 1000);
  });

  this.Then(/^I get an ET301 email with the Product passcode in plain text$/, function() {
    checkForEmail(this.user.email, this.PRODUCT_PASSCODE);
  });

  this.Then(/COMPANY receives an ET301 email with masked hashed Product passcode/, function() {
    const serverEnv = getServerEnv();
    checkForEmail(serverEnv.COMPANY_BCC_EMAIL, '**********************');
  });

  this.Then(/^my plain text Product passcode is not stored in the database but the SHA256 is$/, function() {
    const refreshedInvoice = server.execute(invoiceId =>  { return InvoiceTickets.findOne({_id: invoiceId}); }, this.testInvoice._id );
    expect(refreshedInvoice.productPasscode).to.be.undefined;
    expect(refreshedInvoice.productPasscodeHash).to.equal(this.HASHED_PRODUCT_PASSCODE);
  });

  this.Then(/^my productPasscodeHash is logged in the changelog$/, function() {
    const refreshedInvoice = server.execute(invoiceId =>  { return InvoiceTickets.findOne({_id: invoiceId}); }, this.testInvoice._id );
    expect(refreshedInvoice.changelog[1].value).to.contain(this.HASHED_PRODUCT_PASSCODE);
    expect(refreshedInvoice.changelog[1].changedAt).to.exist;
  });

};
