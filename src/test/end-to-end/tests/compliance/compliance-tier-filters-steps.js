import { waitAndUncheck, getQueueItemValueByEmail } from '/test/end-to-end/tests/_support/webdriver';
import _ from 'lodash';
module.exports = function() {

  this.Then(/^I see all the users in the queue$/, function() {
    const queueId = ".table";
    client.waitForVisible(queueId);
    const allUsers = server.execute(() => {
      return Meteor.users.find({
        roles: {
          $in: ['buyer']
        }
      }).fetch();
    });
    expect(allUsers.length).to.be.above(0);
    allUsers.forEach( user => {
      const selector = getQueueItemValueByEmail(user.emails[0].address, 'email');
      const actualValue = client.execute(pageSelector => { return $(pageSelector).text(); }, selector).value;
      expect(user.emails[0].address).to.equal(actualValue);
    });
  });


  this.When(/^I deselect (.*) option from the tier filter$/, function(tier) {
    const filterId = `input[value=${tier}]`;
    waitAndUncheck(filterId);
  });

  this.Then(/^I should not see the users applying for tier (.*)$/, function(tier) {
    const queueId = ".table";
    client.waitForVisible(queueId);

    const users = server.execute(() => {
      return Meteor.users.find({
        roles: {
          $in: ['buyer']
        }
      }).fetch();
    });

    expect(users.length).to.be.above(0);
    users.forEach( user => {
      const selector = getQueueItemValueByEmail(user.emails[0].address, 'level');
      const applyingForComplianceLevel = client.execute(function(pageSelector) {
        return $(pageSelector).text();
      }, selector).value;
      const expectedValue = "/ " + _.capitalize(tier);
      expect(applyingForComplianceLevel).to.not.contain(expectedValue);
    });
  });


};
