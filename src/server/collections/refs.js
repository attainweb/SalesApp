import Logger from '/imports/server/lib/logger';
import { checkRef, retireRef, allowedToRetireRef } from '/imports/lib/shared/refs';

export const emailFromSref = (sref) => {
  Logger.info('[RPC]emailFromSref - starting', 'sref:', sref);
  // The sref is the authentication token here

  let ref = Refs.findOne({ refcode: sref });
  if (ref === undefined || ref === null) {
    Logger.error('[RPC][Warning] emailFromSref: Ref code not found.', 'sref:', sref);
    throw new Meteor.Error('ref-code-not-found');
  }

  let email = ref.emailto;
  if (email === undefined || email === null) {
    Logger.error('[RPC][Warning] emailFromSref: E-mail not found.', 'email:', email, 'sref', sref);
    throw new Meteor.Error('email-not-found');
  }

  Logger.info('[RPC]emailFromSref', 'sref:', sref, 'email:', email);
  return email;
};

export const retireRefsBelongingToUser = function(userId) {
  Logger.info('[RPC] retireRefsBelongingToUser - starting', 'userId:', userId);
  const user = Meteor.users.findOne({_id: userId});
  if ( user && user.isRejected() ) {
    const result = Refs.update({
      originatorId: userId
    }, {
      $set: {
        isActive: false
      }
    }, {
      multi: true
    });
    Logger.info('[RPC] retireRefsBelongingToUser - success', 'expired refcodes:', result);
    return result;
  } else {
    Logger.error('[RPC][Warning] retireRefsBelongingToUser: Unauthorized', 'userId:', userId);
    throw new Meteor.Error('unauthorized');
  }
};

Meteor.methods({

  genPartnerRef: function(options) {
    check(options, {
      name: String,
      notes: String,
    });

    // authorization
    const adminId = this.userId;
    if (!Roles.userIsInRole(adminId, ['admin'])) {
      Logger.error('[RPC][Warning] genPartnerRef: Unauthorized', 'adminId:', adminId);
      throw new Meteor.Error('unauthorized');
    }

    options.originatorId = adminId;
    options.reftype = 'partner';
    const ref = Refs.create(options);

    Logger.info('[RPC]genPartnerRef', 'adminId:', adminId, 'refId:', ref._id);
    return ref.refcode;
  },

  genDistributorRef: function(options) {
    check(options, {
      distlevel: Number,
      timetype: String,
      name: String,
      notes: String,
    });

    // authorization
    const distributorId = this.userId;
    if (!Roles.userIsInRole(distributorId, ['distributor']) || Meteor.user().isNotApproved()) {
      Logger.error('[RPC][Warning] genDistributorRef: Unauthorized', 'distributorId:', distributorId);
      throw new Meteor.Error('unauthorized');
    }

    let distributorData = Meteor.users.findOne(distributorId);
    if ( options.distlevel > 3
     || options.distlevel < 0
     || options.distlevel <= distributorData.distlevel()) {
      Logger.error(
        '[RPC][Warning] genDistributorRef: Distributor is on too low level.',
        'Distributor distlevel:', distributorData.distlevel(),
        'Requested distlevel', options.distlevel,
        'distributorId:', distributorId
      );
      throw new Meteor.Error('invalidParameter');
    }

    options.originatorId = distributorId;
    options.reftype = 'distributor';
    const ref = Refs.create(options);

    Logger.info('[RPC]genDistributorRef', 'distributorId:', distributorId, 'refId:', ref._id);
    return ref.refcode;
  },

  genBuyerRef: function(options) {
    check(options, {
      timetype: String,
      name: String,
      notes: String,
    });

    // authorization
    const distributorId = this.userId;
    if (!Roles.userIsInRole(distributorId, ['distributor']) || Meteor.user().isNotApproved()) {
      Logger.error('[RPC][Warning] genBuyerRef: Unauthorized', 'distributorId:', distributorId);
      throw new Meteor.Error('unauthorized');
    }

    options.originatorId = distributorId;
    options.reftype = 'buyer';
    const ref = Refs.create(options);

    Logger.info('[RPC]genBuyerRef', 'distributorId:', distributorId, 'refId:', ref._id);
    return ref.refcode;
  },

  // Validating a given refcode
  checkRef: function(refcode) {
    check(refcode, String);
    // The refcode is the authentication token here
    const isValid = checkRef(refcode);
    if (!isValid) {
      Logger.error('[RPC][Warning] checkRef: Ref code not valid.', 'refcode:', refcode);
      throw new Meteor.Error('refCodeNotValid');
    }

    Logger.info('[RPC]checkRef', 'refcode:', refcode, 'isValid:', isValid);
    return isValid;
  },

  retireRef: function(refcode) {
    check(refcode, String);
    // authorization
    const userId = this.userId;
    if (allowedToRetireRef(refcode)) {
      Logger.error('[RPC][Warning] retireRef: Unauthorized', 'userId:', userId, 'refcode', refcode);
      throw new Meteor.Error('unauthorized');
    }

    const res = retireRef(refcode);
    Logger.info('[RPC]retireRef', 'userId:', userId, 'refcode:', refcode);
    return res;
  },

});
