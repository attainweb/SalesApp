import { waitForEmails } from '/test/end-to-end/tests/_support/emails';
import { expectAlertWithText } from '/test/end-to-end/tests/_support/alerts';
import { i18nTest } from '/test/end-to-end/tests/_support/i18n';

module.exports = function() {

  const loadReorderForm = function(module, client) {
    module.router.visit('reorder');
    const reoderFormId = "#reorderForm";
    client.waitForVisible(reoderFormId);
  };

  const completeForm = function(values, isLoggedInBuyer) {
    if (!isLoggedInBuyer) {
      client.waitForVisible("select[name=language]", 2000);
      client.setValue("input[name=email]", values.email);
      client.click('.confirmEmailBtn');
      client.waitForVisible("input[name=productAmount]", 2000);
    } else {
      expect(client.waitForExist("select[name=language]", undefined, true)).to.equal(true);
    }
    client.setValue("input[name=productAmount]", values.btcAmount);
    client.selectByValue("select[name=paymentMethod]", values.paymentMethod);
    if (values.acceptToc && client.isVisible("input[name=acceptToc]")) client.click("input[name=acceptToc]");
    if (values.acceptRisk && client.isVisible("input[name=acceptRisk]")) client.click("input[name=acceptRisk]");
    client.waitForEnabled("button[type=submit]", 2000);
    client.click("button[type=submit]");
  };

  const getUserEmail = function(module) {
    return module.user ? module.user.emails[0].email : module.userEmail;
  };

  this.When(/^I try to reorder (.*) usd worth PRODUCT paying with (Btc|Bank)( while logged in as buyer)*$/, function(btcAmount, paymentMethod, loggedInBuyer) {
    this.isLoggedInBuyer = !!loggedInBuyer;
    loadReorderForm(this, client);

    completeForm({
      email: getUserEmail(this),
      btcAmount: btcAmount,
      paymentMethod: paymentMethod,
      acceptToc: true,
      acceptRisk: true,
    }, this.isLoggedInBuyer);
  });

  this.When(/^I try to reorder$/, function() {
    loadReorderForm(this, client);
    client.setValue("input[name=email]", getUserEmail(this));
    client.click('.confirmEmailBtn');
  });

  this.Then(/^I should see a thank you message$/, function() {
    if (this.isLoggedInBuyer) {
      // The <br/> tag seems to render with different amount of spaces according
      // to the environment or version, that's why we included a replace spaces
      // transformation to guarantee test consistency
      const message = i18nTest('messages.reorderThankYou').replace(/<br.*\/>/g, '\n\n');
      expectAlertWithText(message, (text) => { return text.replace(/ /g, ''); });
    } else {
      const thankyouPanel = '.thank-you';
      client.waitForVisible(thankyouPanel, 10000);
    }
  });

  this.Then(/^I should see an error regarding to my approval state$/, function() {
    const helpBlockId = "#form-error";
    client.waitForVisible(helpBlockId, 10000);
    expect(client.getAttribute(helpBlockId, "data-error")).to.equal("reorder.errors.waitingForApproval");
  });

  this.Then(/^I should see an error regarding to unregistered state$/, function() {
    client.waitForVisible("#policies-error", 10000);
  });

  // TODO This code could be generalized in order to be used in enroll_steps as well
  this.Then(/^I should receive a mail saying my reorder ticket is in the waiting queue$/, function() {
    const history = waitForEmails();
    expect(history.length).to.equal(1);
    expect(history[0].to).to.equal(this.user.email);
    expect(history[0].subject).to.contain('(Email Id: ET101)');
  });

};
