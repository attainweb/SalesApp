import Logger from '/imports/server/lib/logger';

Meteor.methods({

  validateBitcoinAddress: function(address) {
    check(address, String);
    if (!Roles.userIsInRole(this.userId, ['distributor'])) {
      Logger.error('[RPC][Warning] validateBitcoinAddress: Unauthorized', 'userId:', this.userId);
      throw new Meteor.Error('unauthorized');
    }
    return { isValid: Meteor.validateBitcoinAddress(address) };
  },

});
