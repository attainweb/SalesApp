import Logger from '/imports/server/lib/logger';

export const checkPassword = function(user, password, callerMethod) {
  result = Accounts._checkPassword(user, password);
  if (result.error) {
    Logger.info(`[RPC][Warning] ${callerMethod}: Incorrect password`, 'userId', user._id);
    throw result.error;
  }
  Logger.info(`[RPC][Info] ${callerMethod}: Password ok!`, 'userId', user._id);
};
