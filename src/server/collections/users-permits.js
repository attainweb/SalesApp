import Logger from '/imports/server/lib/logger';

Logger.info('Meteor.users', "access control");

Security.permit(['update', 'remove', 'insert']).collections([
  Meteor.users
]).never().apply();
