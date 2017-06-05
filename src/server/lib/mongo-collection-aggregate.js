// Wrap the native mongo aggregate method and make it available on all collections
// https://docs.mongodb.com/v3.0/reference/method/db.collection.aggregate/
Mongo.Collection.prototype.aggregate = function(pipelines, options) {
  const raw = this.rawCollection();
  return Meteor.wrapAsync(raw.aggregate.bind(raw))(pipelines, options);
};
