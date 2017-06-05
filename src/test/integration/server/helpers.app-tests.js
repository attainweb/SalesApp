
before(function() {
  Logger.info = (message) => {
    console.log(message);
  };
  Logger.error = (message) => {
    console.error(message);
  };
});

export const insertAutoincrements = function() {
  let invNum = Autoincrements.findOne({_id: "invoiceNumber"});
  if (!invNum) {
    Autoincrements.insert({_id: "invoiceNumber", seq: 1000000});
  }
};

export const expectApiError = function(url, data, errorMessage, errorCode, done) {
  HTTP.post(url, { data }, (httpError) => {
    try {
      expect(httpError.response.content).to.equal(errorMessage);
      expect(httpError.response.statusCode).to.equal(errorCode);
      done();
    } catch (error) {
      done(error);
    }
  });
};

export const expectApiResult = function(url, data, message, done) {
  HTTP.post(url, { data }, (httpError, response) => {
    try {
      const signature = process.env.COMPANY_BACKEND_SIGNATURE;
      const content = sjcl.decrypt(signature, response.content);
      expect(content).to.equal(message);
      expect(response.statusCode).to.equal(200);
      done();
    } catch (error) {
      done(error);
    }
  });
};

/**
 * Normally i would rather use sinon.js for stubbing functions, however
 * i ran into this issue which makes it unusable:
 * https://github.com/practicalmeteor/meteor-sinon/issues/21
 */
export const stubLoggedInUser = function(user) {
  const stubs = this.stubs = {};
  stubs['Meteor.user'] = { original: Meteor.user, stub: () => user };
  Meteor.user = stubs['Meteor.user'].stub;
  stubs['Meteor.userId'] = { original: Meteor.userId, stub: () => user._id };
  Meteor.userId = stubs['Meteor.userId'].stub;
  stubs['Meteor.users.findOne'] = { original: Meteor.users.findOne, stub: () => user };
  Meteor.users.findOne = stubs['Meteor.users.findOne'].stub;
};

export const restoreStubbedLoggedInUser = function() {
  Meteor.user = this.stubs['Meteor.user'].original;
  Meteor.userId = this.stubs['Meteor.userId'].original;
  Meteor.users.findOne = this.stubs['Meteor.users.findOne'].original;
};
