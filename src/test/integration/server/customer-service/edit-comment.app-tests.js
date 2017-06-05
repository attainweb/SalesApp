import { resetDatabase } from 'meteor/xolvio:cleaner';
import faker from 'faker';
import { stubLoggedInUser, restoreStubbedLoggedInUser } from '/test/integration/server/helpers.app-tests';
describe('customer-service', function() {
  console.log('customer-service');
  beforeEach(function() {
    resetDatabase();
    this.buyer = Factory.create('user', { roles: ['buyer'] });
  });

  it('allows customer service to edit user comment', function(done) {
    console.log('allows customer service to edit user comment');
    const customerServiceNewComment = faker.lorem.sentence();
    const officer = Factory.create('user', { roles: ['customerService'] });
    stubLoggedInUser.call(this, officer);
    Meteor.call('updateUserComment', this.buyer._id, customerServiceNewComment, (error) =>{
      console.log('Error: ', error);
      try {
        restoreStubbedLoggedInUser.call(this);
        expect(error).to.be.undefined;
        const buyer = Meteor.users.findOne(this.buyer._id);
        expect(buyer.comment).to.equal(customerServiceNewComment);
        console.log('No errors found');
        done();
      } catch (exception) {
        console.log('Errors found', exception);
        done(exception);
      }
    });
  });
});
