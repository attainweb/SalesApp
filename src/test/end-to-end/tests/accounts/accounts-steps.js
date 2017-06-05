import {waitAndClickButton, waitAndSetValue, waitAndSelect, waitAndGetText} from '/test/end-to-end/tests/_support/webdriver';
import {waitForEmails, callHistory, resetHistory} from '/test/end-to-end/tests/_support/emails';
import {expectAlertWithText} from '/test/end-to-end/tests/_support/alerts';
import {getUserFromDB} from '/test/end-to-end/tests/_support/accounts';
import { _ } from 'underscore';
import {i18nTest} from '/test/end-to-end/tests/_support/i18n';

const PAGE_COMPONENT_MAP = {
  "account": ".info.account-email",
  "queue": "div[id=queue]",
  "sale-overview": "[name=\"taa\"]",
  "invoiceManager/queue": "#invoice_queue",
  "investigator": "#investigator-dash",
  "customer-service": "#customer-service-dash"
};

module.exports = function() {

  this.When(/^I login with my account$/, function() {
    this.router.home();
    this.accounts.login(this.user);
    this.accounts.stubLoggedInMeteorUser(this.user);
  });

  this.When(/^I logout$/, function() {
    this.accounts.logout();
    client.waitForVisible("#login", 50000);
  });

  this.When(/^I fill login form with my account$/, function() {
    this.router.home();
    const currentUser = this.user;
    const emailClass = "input[type=email]";
    const passwordClass = "input[type=password]";
    waitAndSetValue(emailClass, currentUser.email);
    waitAndSetValue(passwordClass, currentUser.password);
    waitAndClickButton("button[type=submit]");
  });

  this.When(/^I click the forgot password button$/, function() {
    waitAndClickButton("#forgot-password");
  });

  this.When(/^I complete my email$/, function() {
    waitAndSetValue("#email", this.user.email);
  });

  this.When(/^Click on Send password reset$/, function() {
    waitAndClickButton("#password-reset-btn");
  });

  this.Then(/^I should see the generate partner link page$/, function() {
    const genPartnerLinkBox = '#reflink.partner';
    client.waitForVisible(genPartnerLinkBox);
  });

  this.Then(/I should see the (.*) page$/, function(targetUrl) {
    client.waitForVisible(PAGE_COMPONENT_MAP[targetUrl], 5000);
    const currentUrl = client.getUrl();
    expect( currentUrl.search(targetUrl) >= 0 ).to.equal(true);
  });

  this.Then(/^I should see the account info panel$/, function() {
    const accountInfoPanelClass = '.account-info-panel';
    client.waitForVisible(accountInfoPanelClass);
  });

  this.Then(/^I should see my name$/, function() {
    client.waitForVisible(".account-name p");
    expect(client.getText(".account-name p")).to.equal(`${this.user.personalInformation.surname} ${this.user.personalInformation.name}`);
  });

  this.Then(/^I should see my email$/, function() {
    client.waitForVisible(".account-name p");
    expect(client.getText(".account-email > p")).to.equal(this.user.email);
  });

  this.Then(/^I should see my status$/, function() {
    client.waitForVisible(".account-name p");
    let statusMessage = "";
    const userStatus = this.user.personalInformation.status;
    switch (userStatus) {
      case 'APPROVED':
        statusMessage = i18nTest('personalInformation.status.approved');
        break;
      case 'PENDING':
        statusMessage = i18nTest('personalInformation.status.pending');
        break;
      case 'REJECTED':
        statusMessage = i18nTest('personalInformation.status.rejected');
        break;
      default:
        statusMessage = i18nTest('personalInformation.status.invalid');
    }
    expect(client.getText(".account-status > p")).to.equal(statusMessage);
  });

  this.Then(/^A reset email should only be sent to me$/, function() {
    const history = waitForEmails();
    expect(history.length).to.equal(1);
    // I'm only checking the subject as there is no easy way to check email content
    expect(history[0].subject).to.contain('(Email Id: EU101)');
    expect(history[0].to).to.equal(this.user.email);
    expect(history[0].bcc).to.be.undefined;
  });

  this.When(/^I click the update wallet address button$/, function() {
    browser.waitForExist(".modal-backdrop", undefined, true);
    waitAndClickButton("#update-wallet-address-button");
  });

  this.When(/I move to the (.*) page$/, function(targetUrl) {
    client.waitForVisible(PAGE_COMPONENT_MAP[targetUrl], 5000);
  });

  this.When(/^I input the new wallet address '(.+)'$/, function(inputAddress) {
    // Set a testnet wallet I created from Copay
    client.waitForVisible('input[id=wallet-input]');
    this.prevWalletAddress =  this.user.personalInformation.walletAddress;
    this.newWalletAddress = inputAddress === 'sameAddress' ? this.prevWalletAddress : inputAddress;
    client.execute(`document.getElementById('wallet-input').setAttribute('value', '${this.newWalletAddress}')`);
  });

  this.When(/^I click the confirm button$/, function() {
    waitAndClickButton(".confirm-change");
  });

  this.Then(/^My existing wallet address is not changed$/, function() {
    expect(this.prevWalletAddress).to.equal(this.user.personalInformation.walletAddress);
    expect(this.newWalletAddress).not.to.equal(this.prevWalletAddress);
  });

  this.Then(/^My wallet address has changed$/, function() {
    const storedUser = getUserFromDB(this.user.id, { 'personalInformation.walletAddress': 1 });
    expect(storedUser.personalInformation.walletAddress).to.equal(this.newWalletAddress);
  });

  this.When(/^I follow the confirmation link$/, function() {
    /*
       Any confirmation link should be public: Adding this logout(),
       test that the confirmation link  was added to public routes in the client router
    */
    this.accounts.logout();
    const emailHistory = callHistory();
    const emailText = emailHistory[0].text;
    let confirmLink = emailText.substr(emailText.indexOf('http'));
    confirmLink = confirmLink.substr(0, confirmLink.indexOf('\n'));
    resetHistory();
    this.router.visitAbsolute(confirmLink);
    this.confirmLink = confirmLink;
  });

  this.Then(/^I receive the confirmation email$/, function() {
    const history = waitForEmails();
    const emails = _.filter(history, (email) => {
      return email.to === this.user.email && email.subject.indexOf('(Email Id: EU303)') > 0;
    });
    expect(emails.length).to.equal(1);
  });

  this.When(/^I follow the previous confirmation link$/, function() {
    this.router.visitAbsolute(this.confirmLink);
  });

  this.Then(/^I receive an error message with code (.+)$/, function(errorCode) {
    const errorMessage = i18nTest('walletPanel.errors.' + errorCode);
    expectAlertWithText(errorMessage);
  });

  this.Then(/^I should see the success message$/, function() {
    const successMessage = i18nTest('walletPanel.successMessage');
    expectAlertWithText(successMessage);
    client.waitForVisible('.modal-dialog');
    waitAndClickButton("button[data-bb-handler=ok]");
    client.waitForVisible(".bootbox", 20000, true);
  });

  this.Given(/^I go to login page$/, function() {
    this.router.home();
  });

  this.When(/^I select language (.*)$/, function(lang) {
    waitAndSelect("select[name=language]", lang.toLowerCase());
  });

  this.Then(/^I should see contact email address (.*)$/, function(email) {
    const linkText = waitAndGetText(".support_link");
    expect(linkText).to.equal(email);
  });

  this.Then(/^I should see a link to blockchain.info with my wallet-address$/, function() {
    const walletAddress = this.user.personalInformation.walletAddress;
    const expectedBlockChainInfoLink = `https://blockchain.info/address/${walletAddress}`;
    client.waitForVisible('.wallet-address', 2000);
    const userPanelBlockChainLink = client.getAttribute('.wallet-address', 'href');
    expect(userPanelBlockChainLink).to.equal(expectedBlockChainInfoLink);
  });
};
