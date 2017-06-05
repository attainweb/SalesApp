import Logger from '/imports/server/lib/logger';

export default API = {

  onAPIError: function onAPIError(response, errorCode, errorMessage) {
    response.statusCode = errorCode;
    response.end(errorMessage);
    Logger.error(`[API.${onAPIError.caller}] - error: ${errorMessage}`);
    throw new Meteor.Error(errorCode, errorMessage);
  }

};