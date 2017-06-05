export const addUserNote = (userId, note, callback) => {
  return Meteor.users.update(
    userId, { $push: { notes: note }}, callback
  );
};

export const updateUserComment = (userId, comment, callback) => {
  return Meteor.users.update(userId, { $set: { comment: comment } }, callback);
};

export const reviewUser = (userId, officerId, callback) => {
  return Meteor.users.update(officerId, { $set: { reviewing: userId } }, callback);
};

export const sendUserToOfficer = (userId, role, complianceId, callback) => {
  const modifier = { $set: { [`personalInformation.delegatedTo${role}`]: true }};
  if (role === 'Cco') modifier.$addToSet = { 'personalInformation.watchedBy': complianceId };
  return Meteor.users.update(userId, modifier, callback);
};

export const finishReviewing = (complianceId, callback) => {
  return Meteor.users.update(complianceId, { $set: { reviewing: null } }, callback);
};
