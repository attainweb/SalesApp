import Logger from '/imports/server/lib/logger';

Meteor.methods({
  addCustomerServiceOfficer: function(userFields) {
    check(userFields, {
      email: String,
      password: String,
      personalInformation: {
        name: String,
        role: String,
      }
    });
    // authorization
    const adminId = this.userId;
    if (!Roles.userIsInRole(adminId, ['admin'])) {
      Logger.error('[RPC][Warning] addCustomerServiceOfficer: Unauthorized', 'adminId:', adminId);
      throw new Meteor.Error('unauthorized');
    }

    userFields.personalInformation.language = 'ja';

    const customerServiceId = Accounts.createUser(userFields);
    Meteor.users.update(customerServiceId, {$set: {'emails.0.verified': true}});

    Logger.info('[RPC]addCustomerServiceOfficer',
      'adminId:', adminId,
      'customerServiceId:', customerServiceId);
  },

  searchUsersWithAggregate: function(query) {
    if (!Roles.userIsInRole(this.userId, ['investigator'])) {
      Logger.error('[RPC][Warning] searchUsersWithAggregate: Unauthorized', 'for userId:', this.userId);
      throw new Meteor.Error('unauthorized');
    }
    console.log("searchUsersWithAggregate", "query", JSON.stringify(query));
    const result = Meteor.users.aggregate(query);
    return result;
  }
});
