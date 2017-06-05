Schemas.FilesSchema = new SimpleSchema({
  connectionId: {
    type: String,
    optional: true,
  },
  url: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
  },
  key: {
    type: String,
  },
  name: {
    type: String,
  },
  uploadedAt: {
    type: Date,
    autoValue: function() { return new Date(); },
  },
  userId: {
    type: String,
    optional: true,
  },
  canBeDeleted: {
    type: Boolean,
  },
});

Files = new Meteor.Collection( 'files' );

Files.attachSchema(Schemas.FilesSchema);

Files.allow({
  insert: function() { return false; },
  update: function() { return false; },
  remove: function() { return false; }
});

Files.deny({
  insert: function() { return true; },
  update: function() { return true; },
  remove: function() { return true; }
});
