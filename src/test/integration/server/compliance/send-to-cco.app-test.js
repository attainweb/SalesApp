import { resetDatabase } from 'meteor/xolvio:cleaner';
import {
  insertAutoincrements, stubLoggedInUser, restoreStubbedLoggedInUser
} from '/test/integration/server/helpers.app-tests';

describe('compliance', function() {
  console.log('compliance');
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  describe('sendUserToCco', function() {
    console.log('sendUserToCco');
    beforeEach(function() {
      this.buyer = Factory.create('user', { roles: ['buyer'] });
    });

    it('allows compliance officers to send user to CCO', function(done) {
      console.log('allows compliance officers to send user to CCO');
      const officer = Factory.create('user', { roles: ['compliance'] });
      stubLoggedInUser.call(this, officer);
      Meteor.call('sendUserToCco', this.buyer._id, (error) => {
        console.log('Error: ', error);
        try {
          restoreStubbedLoggedInUser.call(this);
          expect(error).to.be.undefined;
          const buyer = Meteor.users.findOne(this.buyer._id);
          expect(buyer.personalInformation.delegatedToCco).to.be.true;
          console.log('No errors found');
          done();
        } catch (exception) {
          console.log('Errors found', exception);
          done(exception);
        }
      });
    });

    it('denies customer service officers to send user to cco', function(done) {
      console.log('denies customer service officers to send user to cco');
      const officer = Factory.create('user', { roles: ['customerService'] });
      stubLoggedInUser.call(this, officer);
      Meteor.call('sendUserToCco', this.buyer._id, (error) => {
        console.log('Error: ', error);
        try {
          restoreStubbedLoggedInUser.call(this);
          expect(error.errorType).to.equal('Meteor.Error');
          expect(error.error).to.equal('unauthorized');
          const buyer = Meteor.users.findOne(this.buyer._id);
          expect(buyer.personalInformation.delegatedToCco).to.be.false;
          console.log('No errors found');
          done();
        } catch (exception) {
          console.log('Errors found', exception);
          done(exception);
        }
      });
    });
  });
});
