import { getUserFromDB } from '/test/end-to-end/tests/_support/accounts';
module.exports = function() {

  this.When(/^I take over the review process for (.+) via the api$/, function(reviewUserKey) {
    const reviewUser = this.accounts.getUserByKey(reviewUserKey);
    this.accounts.stubLoggedInMeteorUser(this.user);
    server.execute((userId) => {
      return Meteor.call('startReviewing', userId, true);
    }, reviewUser._id);
    this.accounts.restoreLoggedInMeteorUserStub();
  });

  this.Then(/^(.*) is not reviewing the (.*) anymore$/, function(reviewerKey, revieweeKey) {
    const officer = getUserFromDB(this.accounts.getUserByKey(reviewerKey)._id);
    expect(officer.reviewing).not.to.exist; // matches undefined and null
  });

};
