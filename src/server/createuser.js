import Logger from '/imports/server/lib/logger';

const exists = function(obj) {
  return obj !== null && obj !== undefined;
};

Accounts.onCreateUser(function(options, user) {
  const opts = _.cloneDeep(options);
  const usr = _.cloneDeep(user);
  // Logger.info('opts: ', opts);
  // Logger.info('usr: ', usr);

  const personalInformation = opts.personalInformation;
  usr.roles = _.compact(_.union([personalInformation.role], personalInformation.roles));
  delete personalInformation.role;
  delete personalInformation.roles;
  usr.personalInformation = personalInformation;
  const role = usr.roles[0];
  // Logger.info('usr: ', usr);

  usr.personalInformation = lodash.defaults({}, usr.personalInformation, {status: 'PENDING'});

  if (usr.personalInformation.refcode) {
    const ref = Refs.findOne({refcode: usr.personalInformation.refcode});

    if (!ref) {
      Logger.info('[Error] Create User: No ref found for refcode ', usr.personalInformation.refcode);
    } else {
      if (role === 'distributor' &&
        ref.distlevel === undefined || ref.distlevel === null) {
        Logger.info('[Warning] Create User: ref.distlevel is undefined');
      }
      if (ref.originatorId === undefined || ref.originatorId === null) {
        Logger.info('[Warning] Create User: ref.originatorId is undefined');
      }

      if (!exists(usr.personalInformation.distlevel)) {
        _.extend(usr.personalInformation, {
          distlevel: ref.distlevel,
        });
      }

      if (!exists(usr.personalInformation.originatorId)) {
        _.extend(usr.personalInformation, {
          originatorId: ref.originatorId,
        });
      }

      const upline = Meteor.users.findOne(usr.personalInformation.originatorId);
      if (!upline) Logger.info('[Warning] Create User: no upline found');
    }
  }

  // Sanitize distlevel and role relation here.
  // Could be moved to Accounts.validateNewUser.
  const distlevel = usr.personalInformation.distlevel;
  if (role === 'admin') {
    if (distlevel !== -1) {
      Logger.info('[Error] Create User: The distlevel of admin must be -1.');
      return null;
    }
  }
  if (role === 'distributor') {
    if (!_.contains([0, 1, 2, 3], distlevel)) {
      Logger.info('[Error] Create User: The distlevel of distributor must be 0 or 1 or 2 or 3.');
      return null;
    }
  }
  if (role === 'buyer') {
    if (distlevel || distlevel === 0) {
      Logger.info('[Error] Create User: The distlevel of buyer must not be set.');
      return null;
    }
  }

  return usr;
});
