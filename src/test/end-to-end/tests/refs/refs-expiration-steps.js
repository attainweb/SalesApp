import moment from 'moment';

module.exports = function() {

  const createRef = function createRef(reftype, createdAt) {
    return server.execute((theReftype, date) => {
      return Refs.create({
        reftype: theReftype,
        createdAt: date
      });
    }, reftype, createdAt);
  };

  this.Given(/^a ref of type (.*) was created almost (\d+) hours ago$/, function(reftype, hours) {
    this.ref = createRef(reftype, moment().subtract(hours, 'hours').add(1, 'minutes').toDate());
  });

  this.Given(/^a ref of type (.*) was created more than (\d+) hours ago$/, function(reftype, hours) {
    this.ref = createRef(reftype, moment().subtract(hours, 'hours').subtract(1, 'minutes').toDate());
  });

  this.When(/^I get the ref state$/, function() {
    this.refIsValid = server.execute((refId) => {
      return Refs.findOne(refId).isValid();
    }, this.ref._id);
  });

  this.Then(/^it should be expired$/, function() {
    expect(this.refIsValid).to.equal(false);
  });

  this.Then(/^it should not be expired$/, function() {
    expect(this.refIsValid).to.equal(true);
  });

};
