Autoincrements = new Meteor.Collection( 'autoincrements' );

let invNum = Autoincrements.findOne({_id: "invoiceNumber"});
if (!invNum) {
  Autoincrements.insert({_id: "invoiceNumber", seq: 1000000});
}


const doAutoincrement = function(fieldName) {
  Autoincrements.upsert({
    _id: fieldName
  }, {
    $inc: {
      seq: 1
    }
  });
  const result = Autoincrements.findOne({_id: fieldName});
  return result;
};

Autoincrements.nextValue = function(fieldName) {
  return doAutoincrement(fieldName).seq;
};
