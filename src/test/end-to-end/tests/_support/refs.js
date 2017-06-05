'use strict';

import RefsBuilder from '/imports/lib/fixtures/refs-builder.js';

module.exports = function() {

  this.Before(function() {
    this.refs = {};

    this.refs.getRefcodesByOriginatorId = function(originatorId, returnFields = {}) {
      return server.execute( (originatorId, fields) => {
        return Refs.find( { originatorId: originatorId }, { fields: fields}).fetch();
      }, originatorId, returnFields);
    };

    this.refs.getRefcodesByUserId = function(userId, returnFields = {}) {
      return server.execute( (userId, fields) => {
        return Refs.find( { userId: userId }, { fields: fields}).fetch();
      }, userId, returnFields);
    };

    this.refs.insertRefcode = function(refcode) {
      return server.execute((refcode) => {
        const id = Refs.insert(refcode);
        return Refs.findOne({_id: id});
      }, refcode);
    };

    this.refs.createRefcode = function(emailto, reftype, userId) {
      const refsBuilder = new RefsBuilder();
      let refcode = refsBuilder
          .withEmailto(emailto)
          .withReftype(reftype)
          .withEmailAddress(emailto);

      switch (reftype) {
        case 'confirmEmailAccount':
        case 'confirmEmailChange':
        case 'confirmAddress':
        case 're-generate-all':
        case 're-generate-one':
          refcode.withUserId(userId);
          break;
        case 'buyer':
        case 'distributor':
          refcode.withOriginatorId(userId);
          break;
        default:
          break;
      }
      return refcode.build();
    };
  });

  this.Given(/^User (.*) has a refcode with type (.*)/, function(userKey, reftype) {
    const user = this.accounts.getUserByKey(userKey);
    const refcode = this.refs.insertRefcode(this.refs.createRefcode(user.email, reftype, user.id));
    this.fixtures.refs.push(refcode);
  });
};
