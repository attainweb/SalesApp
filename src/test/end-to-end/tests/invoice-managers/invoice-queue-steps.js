import {waitAndClickButton, waitAndSetValue, waitAndGetText, waitAndSelect, pressEnter} from '/test/end-to-end/tests/_support/webdriver';
import { confirmModal } from '/test/end-to-end/tests/_support/alerts';
import {i18nTest} from '/test/end-to-end/tests/_support/i18n';
import faker from 'faker';

module.exports = function() {

  this.When(/^I switch to tab (.*)$/, function(tab) {
    const tabId = '#' + tab;
    browser.waitForExist(".modal-backdrop", undefined, true);
    waitAndClickButton(tabId);
  });

  // TO DO: Add pause before switching tab in order to update filters and so ticket appears inside tab
  // this.When(/^after pause I switch to tab (.*)$/, function(tab) {
  // });

  this.When(/^I expand the card of the ticket$/, function() {
    const expandClass = ".ticket-card-panel-toggle";
    waitAndClickButton(expandClass);
  });

  this.When(/^I set (.*) YEN as funds received$/, function(amount) {
    waitAndSetValue("input[type=number]", amount);
  });

  this.When(/^I click funds received$/, function() {
    waitAndClickButton(".btn.funds-received");
  });

  this.When(/^I confirm funds$/, function() {
    confirmModal();
  });

  this.When(/^I choose (.*) as bank$/, function(bank) {
    waitAndSelect("select[name=bank]", bank);
  });

  this.When(/^I confirm Payment$/, function() {
    waitAndClickButton(".confirm-payment.btn.btn-primary");
    client.waitForVisible(".modal-dialog");
    waitAndClickButton("button[data-bb-handler=confirm]");
    client.waitForVisible(".bootbox", 30000, true);
  });

  this.When(/^I search for the invoice with a valid (.+) value$/, function(fieldName) {
    const dataName = i18nTest(`invoiceManager.searchBarCategories.${fieldName}`);
    waitAndClickButton(".search_bar .dropdown-toggle");
    waitAndClickButton(`a[data-filter-label="${dataName}"]`);
    waitAndSetValue('.input-search-value', this.fixtures.invoices[0][fieldName]);
    pressEnter();
  });

  this.When(/^there is a (.+) ticket with "No PRODUCT reserved" \((.+)\)$/, function(ticketType, ticketState) {
    this.testTicket = this.invoices.createAndSave(ticketType, ticketState, this.accounts.getUserByKey('approvedBuyer')._id, 1000);
  });

  this.When(/^I click "Force reserve PRODUCT"$/, function() {
    waitAndClickButton(".ticket-card-panel-toggle");
    waitAndClickButton(".force-reserve");
  });

  this.When(/^I click the Approve Invalid Ticket button$/, function() {
    waitAndClickButton(".approve-invalid-ticket");
  });

  this.When(/^I click the "Set as Refunded" button$/, function() {
    waitAndClickButton(".refund-invalid-ticket");
  });

  this.When(/^I fill the (.*) field in the popup$/, function(field) {
    const randomText = faker.lorem.text();
    waitAndSetValue('#' + field, randomText);
  });

  this.When(/^I confirm the refund modal$/, function() {
    client.waitForVisible(".modal-dialog");
    waitAndClickButton(".confirm-refund");
  });

  this.Then(/^the ticket is there$/, function() {
    const invoiceNumber = waitAndGetText(".invoice-number");
    expect(invoiceNumber).to.equal(this.fixtures.invoices[0].invoiceNumber);
  });

  this.Then(/^the ticket state should be changed to have reserved PRODUCT$/, function() {
    const savedInvoice = server.execute(invoiceId => {
      return InvoiceTickets.findOne({ _id: invoiceId });
    }, this.testTicket._id);
    expect(savedInvoice.state).to.equal(`saleStarted${this.testTicket.paymentOption}`);
  });

  this.Then(/^the ticket should be included in current tranche$/, function() {
    server.execute(invoiceId => {
      const savedInvoice = InvoiceTickets.findOne({ _id: invoiceId }, {fields: {tranche: 1}});
      expect(savedInvoice.tranche).to.equal(Meteor.settings.public.salesLimits.currentTranche);
    }, this.testTicket._id);
  });

  this.Then(/^the ticket should not have a toggle button$/, function() {
    client.waitForVisible(".data-panel"); // wait for ticket card
    const toggleButtonDiv = client.execute(function() {
      return $(".ticket-card-panel-toggle");
    }).value;
    // if the div is not found it, the method returns an empty array
    expect(toggleButtonDiv.length).to.equal(0);
  });

  this.Then(/^the ticket is in state (.*)$/, function(expectedState) {
    client.waitUntil(() => {
      const invoice =  server.execute( () => {
        return InvoiceTickets.findOne();
      });
      return invoice.state === expectedState;
    });
  });

  this.Then(/^I get an error indicating I need to set a reason$/, function() {
    client.waitForVisible('.bootbox-body');
    expect(client.getText('.bootbox-body')).to.equal(i18nTest('refundInvalidFunds.errors.invalidRefundReason'));
  });

  this.Then(/^I get an error indicating I need to set a valid bitcoin transaction id$/, function() {
    client.waitForVisible('.bootbox-body');
    expect(client.getText('.bootbox-body')).to.equal(i18nTest('refundInvalidFunds.errors.invalidTransactionId'));
  });

  this.Then(/^I try to call the change state functions for an invalid funds received ticket to invalidTicketApproved$/, function() {
    this.error = server.execute(() => {
      const invoice = InvoiceTickets.findOne();
      let methodError = '';
      invoice.changeState('invalidTicketApproved', {}, (err) => {
        methodError =  err.error;
      });
      return methodError;
    });
  });

};
