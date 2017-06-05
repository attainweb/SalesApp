ReviewRecords = new Mongo.Collection('reviewRecords');

ReviewRecords.helpers({
  complianceAdmin() {
    return Meteor.users.findOne(this.complianceId);
  },
  targetText() {
    return i18n('complianceRecords.targetTypes.' + this.target);
  },
  statusText() {
    return i18n('compliance.statusTypes.' + this.status);
  },
  reasonText() {
    return i18n('compliance.reasonTypes.' + this.reason);
  },
});

ReviewRecords.create = function(obj) {
  if (Array.isArray(obj)) return obj.map(ReviewRecords.create);
  if (typeof obj !== 'object') {
    throw new Meteor.Error('ReviewRecords.create: expected input to be an object or array, not "' + typeof obj + '"');
  }

  const record = _.pick(obj, ['userId', 'complianceId', 'target', 'status', 'reason']);
  if (record.docId  === undefined) record.docId  = null;
  if (record.reason === undefined) record.reason = null;
  record.createdAt = new Date();

  return ReviewRecords.findOne(ReviewRecords.insert(record));
};

ReviewRecords.findByReviweeId = function(revieweeId) {
  return ReviewRecords.find({userId: revieweeId}, {sort: { createdAt: -1 }});
};

ReviewRecords.findWithLimit = function(limit) {
  return ReviewRecords.find({}, {limit: limit});
};
