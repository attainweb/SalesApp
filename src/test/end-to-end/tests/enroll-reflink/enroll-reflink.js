import { waitAndClickButton } from '../_support/webdriver';

module.exports = function() {
  this.When(/^I click Generate Link button$/, function() {
    waitAndClickButton("button[id=genlink-btn]");
  });

  this.Then(/^I should see the link generated$/, function() {
    client.waitForVisible("p[id=newly-generated-link]");
    this.refs.enrollReflink = client.getText("p[id=newly-generated-link]");
    expect(client.isExisting("p[id=newly-generated-link]")).to.equal(true);
  });

  this.Then(/^I should see the refcode listed$/, function() {
    client.waitForVisible(".ref-link");
    expect(client.getHTML(".ref-link").toString()).to.contain(this.refs.enrollReflink);
  });
};
