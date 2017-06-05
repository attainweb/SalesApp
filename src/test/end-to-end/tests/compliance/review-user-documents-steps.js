import { waitAndClickButton } from '/test/end-to-end/tests/_support/webdriver';
import { confirmModal } from '/test/end-to-end/tests/_support/alerts';

module.exports = function() {

  this.When(/^I select the image$/, function() {
    waitAndClickButton(`.doc-image[data-doc-id='${this.file._id}'] .file`);
  });

  this.When(/^I delete the image$/, function() {
    waitAndClickButton(`.delete`);
    confirmModal();
  });

  this.Then(/^I don't see the image anymore$/, function() {
    client.waitForVisible('.label-info');
    const deleteButtonDiv = client.execute(function() {
      return $(`.preview`);
    }).value;
    expect(deleteButtonDiv.length).to.equal(0);
  });

  this.Then(/^I can't delete the image$/, function() {
    client.waitForVisible(`.preview`);
    const deleteButtonDiv = client.execute(function() {
      return $(`.delete`);
    }).value;
    expect(deleteButtonDiv.length).to.equal(0);
  });

};
