Sums = new Mongo.Collection('sums');

Sums.getSum = function sumsGet(name) {
  const sum = this.findOne(name);
  return sum && sum.sum || 0;
};

Sums.getCount = function countGet(name) {
  const sum = this.findOne(name);
  return sum && sum.count || 0;
};

Sums.has = function sumsHas(name) {
  return !!this.findOne(name);
};

if (Package.templating) {
  Package.templating.Template.registerHelper('getPublishedSums', function(name) {
    return Sums.getSum(name);
  });
}
