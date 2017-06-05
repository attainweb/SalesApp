import Logger from '/imports/server/lib/logger';

Accounts.onLogin( function( loginData ) {
  if (loginData.allowed) {
    const user = loginData.user;
    const email = loginData.user.emails[0] ? loginData.user.emails[0].address : '';
    const toLog = {
      type: loginData.type,
      userId: user._id,
      userEmail: email,
      connection: getConnectionDataToLog( loginData )
    };
    Logger.info('User loggedIn', toLog);
  } else {
    Logger.error('User loggedIn not allowed', loginData.error);
  }
});

const getConnectionDataToLog = function( loginData ) {
  return { id: loginData.connection.id,
    clientAddress: loginData.connection.clientAddress,
    httpHeaders: loginData.connection.httpHeaders
  };
};

Accounts.onLoginFailure( function( loginData ) {
  const toLog = {
    type: loginData.type,
    userInput: loginData.methodArguments[0].user,
    connection: getConnectionDataToLog( loginData )
  };
  Logger.error( 'User loggedIn failure', toLog );
});

Accounts.validateLoginAttempt( function( attempt ) {
  const user = Meteor.users.findOne( attempt.user );

  if ( user && user.emails && !user.emails[ 0 ].verified ) {
    Logger.info( 'email not verified' );
    return false; // the login is aborted
  }

  if ( user && user.isRejected() ) {
    throw new Meteor.Error( 403, '[Error] Login: Your account is rejected.' );
  }

  return true;
} );

/**
 * TODO: Review this once Accounts.onLogout() gets implemented
 * https://github.com/meteor/meteor/pull/6889
 */
Meteor.methods({
  onClientLogoutStart: function() {
    const connectionId = this.connection.id;
    const myUserId = Meteor.userId();
    // If myUserId is null, means the logout was already been done
    if (myUserId) {
      Logger.info( 'Client Logout Start for UserId: %s, connectionId: %s', myUserId, connectionId );
    } else {
      Logger.error( 'User is already loggedOut, connectionId: %s', connectionId );
    }
  },
  onClientLogoutComplete: function(userId) {
    const connectionId = this.connection.id;
    Logger.info( 'Client Logout Complete for UserId: %s, connectionId: %s', userId, connectionId );
  }
});
