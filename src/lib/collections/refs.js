import { Ref } from '/imports/lib/shared/refs';

Refs = new Mongo.Collection("refs");

const HOURS_IN_MILLISECONDS = 60 * 60 * 1000;
const REF_EXPIRATION_TIME_IN_MILLISECONDS = 24 * HOURS_IN_MILLISECONDS;
const NON_EXPIREABLE_REFTYPES = ['partner', 'distributor', 'buyer', 'signup'];

const pastExpiration = function(createdAt) {
  const today = moment();
  const creationDate = moment(createdAt);
  const timeSinceCreatedInMilliseconds = today.diff(creationDate);

  return timeSinceCreatedInMilliseconds < REF_EXPIRATION_TIME_IN_MILLISECONDS;
};

const getOwner = function(ref) {
  if (ref.originatorId) {
    return ref.originatorId;
  }
  return ref.userId;
};

const isOwnerUnderInvestigation = function(ref) {
  const ownerId = getOwner(ref);
  if (ownerId) {
    const owner = Meteor.users.findOne(ownerId);
    return owner.personalInformation.isUnderInvestigation;
  }
  return false;
};

Refs.helpers({
  update(modifier) {
    return Refs.update(this._id, { $set: modifier });
  },
  isExpired() {
    return !_.includes(NON_EXPIREABLE_REFTYPES, this.reftype) && !pastExpiration(this.createdAt);
  },
  isValid() {
    if (this.expiresByTime()) {
      return !this.isExpired() && this.isActive && !isOwnerUnderInvestigation(this);
    } else {
      return this.isActive && !isOwnerUnderInvestigation(this);
    }
  },
  expiresByTime() {
    return !(_.includes(NON_EXPIREABLE_REFTYPES, this.reftype));
  },
});

Refs.create = function(options) {
  let ref = new Ref(options);
  let refId = Refs.insert(ref);
  return Refs.findOne(refId);
};

Refs.createEmailVerification = function(emailto) {
  return Refs.create({
    reftype: 'emailVerification',
    emailto: emailto
  });
};
