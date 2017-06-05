import Logger from '/imports/server/lib/logger';
import { preCancelInvoicesOnReject } from '/server/invoice-manager';
import { retireRefsBelongingToUser } from '/server/collections/refs';
import { checkPassword } from '/imports/server/users/check-password';
const parseField = function(field, data) {
  let hierachy = field.split('.');
  return _.reduce(hierachy, function(memo, level) { return memo[level]; }, data);
};

let updateUserField = function(userId, officerId, field, value) {
  let setFields = {};
  setFields[field] = value;

  const user = Meteor.users.findOne({_id: userId});
  if (!user) {
    Logger.error('[RPC][Warning] editField field:' + field + ': user notfound', `user[${userId}]`, `officer[${officerId}]`);
    throw new Meteor.Error('404');
  }

  let hierachy = field.split('.');
  const oldValue = _.reduce(hierachy, function(memo, level) { return memo[level]; }, user);
  if (value === oldValue) {
    Logger.error('[RPC][Warning] editField field:' + field + ': same', userId, value, user[field]);
    throw new Meteor.Error('same');
  }
  const rolesAllowedToUpdate = ["buyer", "distributor"];
  if ( _.difference(user.roles, rolesAllowedToUpdate).length > 0 ) {
    // the user to be edited has a role that we are not allowed to edit
    throw new Meteor.Error('notAllowed');
  }

  const res = Meteor.users.update({
    _id: userId
  }, {
    $set: setFields
  }, () => {
    switch (field) {
      case 'personalInformation.status':
        if (value === 'REJECTED') {
          preCancelInvoicesOnReject(userId);
          retireRefsBelongingToUser(userId);
        }
        if (value === 'APPROVED') Files.blocksUserExistingFiles(userId);
        break;
      default:
    }
  });

  return res;
};

Meteor.methods({

  editField(field, data, password) {
    Logger.info('[RPC][Info] editField: init');

    const officer = Meteor.user();
    if (!officer.isHeadCompliance()) {
      Logger.error('[RPC][Warning] editField: Unauthorized', 'officerId:', officer._id);
      throw new Meteor.Error('unauthorized');
    }
    Logger.info('[RPC][Info] editField: Authorized!', 'officerId', officer._id);

    checkPassword(officer, password, 'editField');

    const allowedFields = Match.Where((name) => {
      switch (name) {
        case 'personalInformation.name':
        case 'personalInformation.surname':
        case 'personalInformation.phone':
        case 'personalInformation.status':
        case 'personalInformation.birthdate':
        case 'personalInformation.language':
        case 'personalInformation.residenceCountry':
        case 'personalInformation.postaddress.address':
        case 'personalInformation.postaddress.zip':
        case 'personalInformation.postaddress.city':
        case 'personalInformation.postaddress.state':
        case 'personalInformation.isUnderInvestigation':
          return true;
        default:
          return false;
      }
    });
    // Could be use officer.currentlyReviewing()._id instead ?
    const userId2Update = data.userId;
    check( field, allowedFields );
    check( userId2Update, String );
    Logger.info('[RPC][Info] editField: Received data ok!', 'userId', userId2Update);

    const newVal = parseField(field, data);
    return updateUserField(userId2Update, officer._id, field, newVal);
  },

});

