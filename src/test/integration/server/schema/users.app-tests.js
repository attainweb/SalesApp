import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { insertAutoincrements } from '/test/integration/server/helpers.app-tests';

describe('users', function() {
  console.log('users');
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  describe('getFirstRole', function() {
    console.log('getFirstRole');
    beforeEach(function() {
      this.buyer = Factory.create('user', {
        roles: ['buyer'],
        emails: [{ address: "test-buyer@bla.com", verified: true }],
        'personalInformation.surname': 'Surname',
        'personalInformation.name': 'Name',
        'personalInformation.refcode': '123'
      });
    });

    it('should return exporter', function(done) {
      console.log('should return exporter');
      try {
        const user = Factory.create('user', {roles: ['exporter']} );
        expect( Meteor.users.getFirstRole(user._id) ).to.equal("exporter");
        console.log('No errors found');
        done();
      } catch (exception) {
        console.log('Errors found', exception);
        done(exception);
      }
    });
    it('should return undefined for empty roles', function(done) {
      console.log('should return undefined for empty roles');
      try {
        const user = Factory.create('user', {roles: []} );
        expect( Meteor.users.getFirstRole(user._id) ).to.equal(undefined);
        console.log('No errors found');
        done();
      } catch (exception) {
        console.log('Errors found', exception);
        done(exception);
      }
    });
    it('should return undefined for user without roles', function(done) {
      console.log('should return undefined for user without roles');
      try {
        const user = Factory.create('user', {'personalInformation.name': 'Name'} );
        expect( Meteor.users.getFirstRole(user._id) ).to.equal(undefined);
        console.log('No errors found');
        done();
      } catch (exception) {
        console.log('Errors found', exception);
        done(exception);
      }
    });
    it('should return undefined for wrong userId', function(done) {
      console.log('should return undefined for wrong userId');
      try {
        const user = Factory.create('user', {roles: []} );
        expect( Meteor.users.getFirstRole("fakeId") ).to.equal(undefined);
        console.log('No errors found');
        done();
      } catch (exception) {
        console.log('Errors found', exception);
        done(exception);
      }
    });
    it('should return undefined for user undefined user', function(done) {
      console.log('should return undefined for user undefined user');
      try {
        expect( Meteor.users.getFirstRole(undefined) ).to.equal(undefined);
        console.log('No errors found');
        done();
      } catch (exception) {
        console.log('Errors found', exception);
        done(exception);
      }
    });

  });


  describe('changelog', function() {
    console.log('changelog');
    const buyer = Factory.create('user', {
      roles: ['buyer'],
      emails: [{ address: "test-buyer@bla.com", verified: true }],
      'personalInformation.surname': 'Surname',
      'personalInformation.name': 'Name',
      'personalInformation.refcode': '123'
      // 'personalInformation.postaddress.city' !!! is intentionally NOT set !!!
    });

    describe('update', function() {
      console.log('update');

      const data = {
        'personalInformation.name': 'ChangedName',
        'personalInformation.refcode': 'Changed123',
        'personalInformation.postaddress.city': 'ChangedCity',
      };
      Meteor.users.update({_id: buyer._id}, {$set: data });
      let updUser = Meteor.users.findOne({_id: buyer._id});

      it('logs "personalInformation.name"', function(done) {
        console.log('logs "personalInformation.name"');
        try {
          expect(updUser.changelog.length).to.equal(9);
          expect(updUser.changelog[7].field).to.equal('personalInformation.name');
          expect(updUser.changelog[7].value).to.equal('ChangedName');
          console.log('No errors found');
          done();
        } catch (exception) {
          console.log('Errors found', exception);
          done(exception);
        }
      });
      it('logs "personalInformation.postaddress.city"', function(done) {
        console.log('logs "personalInformation.postaddress.city"');
        try {
          expect(updUser.changelog.length).to.equal(9);
          expect(updUser.changelog[8].field).to.equal('personalInformation.postaddress.city');
          expect(updUser.changelog[8].value).to.equal('ChangedCity');
          console.log('No errors found');
          done();
        } catch (exception) {
          console.log('Errors found', exception);
          done(exception);
        }
      });
      it('does NOT log "personalInformation.refcode"', function(done) {
        console.log('does NOT log "personalInformation.refcode"');
        try {
          const keys = updUser.changelog.map((l)=> l.field );
          expect(keys).not.to.contain('personalInformation.refcode');
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
