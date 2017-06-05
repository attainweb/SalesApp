import { waitAndClickButton, waitAndGetText } from '/test/end-to-end/tests/_support/webdriver';
import { confirmModal, cancelModal, approveModal } from '/test/end-to-end/tests/_support/alerts';

module.exports = function() {

  this.When(/^I find the user pending in my queue$/, function() {
    client.waitForVisible(".user-summary-div");
  });

  this.When(/^I click review user button$/, function() {
    this.reviewUserEmail =  waitAndGetText(".email");
    waitAndClickButton(".review-btn");
  });

  this.Then(/^I go to review user panel$/, function() {
    expect(client.waitForVisible(".upload-area")).to.equal(true);
  });

  this.When(/^I click done button$/, function() {
    waitAndClickButton(".done_hco");
  });

  this.When(/^I click approve button$/, function() {
    waitAndClickButton(".approve-user");
  });

  this.When(/^I click reject button$/, function() {
    waitAndClickButton(".reject-user");
  });


  this.When(/^I click Cancel Ticket$/, function() {
    waitAndClickButton('.ticket-card-panel-toggle');
    waitAndClickButton('.cancel-ticket');
  });

  this.When(/^I confirm the modal$/, function() {
    confirmModal();
  });

  this.When(/^I approve the .*modal$/, function() {
    approveModal();
  });

  this.When(/^I cancel the modal$/, function() {
    cancelModal();
  });

  this.When(/^I see the current reviewer name$/, function() {
    const reviewerName = waitAndGetText(".reviewer-name");
    expect(this.officerReviewer.personalInformation.name).to.equal(reviewerName);
  });

  this.Then(/^I am redirected to queue page and I cannot find user$/, function() {
    client.waitForVisible(".review-btn", undefined, true);
  });

  this.Then(/^I see the take over reviewee modal$/, function() {
    client.waitForVisible(".take-over-reviewee-modal");
  });

};
