Meteor.users.helpers({
  updateFields: function(fields, options) {
    return Meteor.users.update(this._id, { $set: fields }, options);
  },
});
