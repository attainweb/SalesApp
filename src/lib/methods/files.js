'use strict';

const isDeletableFile = function isDeletableFile(fileOwnerId) {
  const fileOwner = Meteor.users.findOne(fileOwnerId);
  if (!fileOwner) {
    return true;
  }
  return !fileOwner.isApproved();
};

Meteor.methods({
  storeUrlInDatabase: function(url, key, name, ownerId) {
    check(url, String);
    Modules.both.checkUrlValidity(url);
    try {
      let fileOwnerId = undefined;
      const user = Meteor.user();
      if (user && user.isReviewOfficer() && ownerId ) {
        fileOwnerId = ownerId;
      }
      Files.insert({
        url: encodeURI(url),
        userId: fileOwnerId,
        key: key,
        name: name,
        connectionId: this.connection ? this.connection.id : null,
        canBeDeleted: isDeletableFile(fileOwnerId),
      });
      return true;
    } catch (exception) {
      return exception;
    }
  }
});
