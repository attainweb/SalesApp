import Logger from '/imports/server/lib/logger';
import { sendDistributorApprovalEmail, sendEU201BuyerApprovalEmail } from '/imports/server/email-actions.js';
import {
  addUserNote, updateUserComment, reviewUser, sendUserToOfficer, finishReviewing
} from '/imports/server/users/compliance.js';
import { markJobAsReady } from '/imports/server/workers';
import { preCancelInvoicesOnReject } from '/server/invoice-manager';
const checkRevieweeExistance = (userId, callerMethod) => {
  const reviewee = Meteor.users.findOne(userId);
  if (reviewee === undefined || reviewee === null) {
    Logger.error('[RPC][Warning] ', callerMethod, ': User not found.', 'userId:', userId, 'customerServiceId:', this.userId);
    throw new Meteor.Error('userNotFound');
  }
  return reviewee;
};

const getReviewee = (userId, callerMethod) => {
  return checkRevieweeExistance(userId, callerMethod);
};

const sendUserTo = function(userId, role, complianceId) {
  const user = getReviewee(userId, 'sendUserTo' + role);
  // update database
  sendUserToOfficer(userId, role, complianceId);
  Logger.info('[RPC]sendUserTo' + role, 'userId: ', userId, 'updated user: ', user);
};

const authorize = (methodName, userId, requiredPermission) => {
  const currentUser = Meteor.users.findOne(userId);
  if (currentUser && !currentUser[requiredPermission]()) {
    Logger.error(`[RPC][Warning] ${methodName}: Unauthorized`, 'userId:', userId);
    throw new Meteor.Error('403', `[Error] ${methodName}: Unauthorized`);
  }
};

const handleError = (methodName, userId) => {
  return (error) => {
    if (error) {
      Logger.error(`Error in ${methodName} for user: ${userId}`);
      Logger.error(error);
    }
  };
};

Meteor.methods({

  addUserNote: function(userId, type, comment) {
    check(userId, String);
    check(comment, String);
    check(type, String);

    const note = {
      userId: Meteor.userId(),
      name: Meteor.user().personalInformation.name,
      type: type,
      role: Meteor.user().roles[0],
      comment: comment,
      createdAt: new Date()
    };

    const complianceId = this.userId;
    const authorizeMethodValidation = 'canAdd' + _.capitalize(type) + 's';
    authorize('addUserNote', complianceId, authorizeMethodValidation);

    Logger.info('[RPC]updateUserCustomerServiceNotes', 'complianceId:', complianceId, 'note:', note);
    addUserNote( userId, note, (error) => {
      if (error) {
        Logger.error('Error adding note of type [' + note.type + '] for user: ' + userId);
        Logger.error(error);
      }
    });

  },
  updateUserComment: function(userId, comment) {
    check(userId, String);
    check(comment, String);
    const complianceId = this.userId;
    authorize('updateUserComment', complianceId, 'canAddComments');
    Logger.info('[RPC]updateUserComment', 'complianceId:', complianceId, 'comment:', comment);
    return updateUserComment(userId, comment, handleError('updateUserComment', userId));
  },

  addComplianceAdmin: function(userFields) {
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
      Logger.error('[RPC][Warning] addComplianceAdmin: Unauthorized', 'adminId:', adminId);
      throw new Meteor.Error('unauthorized');
    }

    userFields.personalInformation.language = 'ja';

    const complianceId = Accounts.createUser(userFields);
    Meteor.users.update(complianceId, {$set: {'emails.0.verified': true}});

    Logger.info('[RPC]addComplianceAdmin',
      'adminId:', adminId,
      'complianceId:', complianceId);
  },

  startReviewing: function(userId, takeOverReviewee) {
    check(userId, String);
    // authorization
    const officer = Meteor.user();
    if (!officer.isReviewOfficer()) {
      Logger.error('[RPC][Warning] startReviewing: Unauthorized',
        'officerId:', officer._id);
      throw new Meteor.Error('unauthorized');
    }

    // only compliance officers block each other to review other users
    const otherCompliance = Meteor.users.findOne({
      reviewing: userId,
      roles: {
        $in: Meteor.users.getComplianceRoles()
      }
    });
    if (officer.isCompliance() && otherCompliance !== undefined && otherCompliance !== null) {
      if (!takeOverReviewee) {
        Logger.error('[RPC][Warning] startReviewing: reviewee is being reviewed by other Compliance Officer.',
          'userId:', userId,
          'otherComplianceId', otherCompliance._id,
          'complianceId:', officer._id);
        throw new Meteor.Error('reviewedByOtherOfficer', null, { otherOfficer: otherCompliance.fullName() });
      } else {
        // Take over reviewee from other officer
        Logger.info(`Officer ${officer._id} takes over reviewee ${userId} from ${otherCompliance._id}`);
        finishReviewing(otherCompliance._id);
      }
    }

    // set the reviewer to review the requested user
    const updatedUser = reviewUser(userId, officer._id);
    if (updatedUser === 0) {
      Logger.error('[RPC][Warning] startReviewing: Could not add reviewee.',
        'userId:', userId,
        'officerId:', officer._id,
        'updated user:', updatedUser);
      throw new Meteor.Error('couldNotAddReviewee');
    }

    Logger.info('[RPC]startReviewing',
      'userId', userId,
      'officerId:', officer._id,
      'updated users:', updatedUser);

    return true;
  },

  finishReviewing: function() {
    // authorization
    const officer = Meteor.users.findOne(this.userId);
    if (!officer.isReviewOfficer()) {
      Logger.error('[RPC][Warning] finishReviewing: Unauthorized',
        'officerId:', officer._id);
      throw new Meteor.Error('unauthorized');
    }

    // remove officer from reviewee
    const numberOfUpdatedOfficers = finishReviewing(officer._id);
    if (numberOfUpdatedOfficers !== 1) {
      Logger.error('[RPC][Warning] finishReviewing: Could not remove reviewee.',
        'officerId:', officer._id,
        'number of updated users:', numberOfUpdatedOfficers);
      throw new Meteor.Error('couldNotRemoveReviewee');
    }

    Logger.info('[RPC]finishReviewing',
      'officerId:', officer._id,
      'number of updated users:', numberOfUpdatedOfficers);

    return true;
  },

  approveUser: function(userId) {
    check(userId, String);

    // authorization
    const complianceId = this.userId;
    if (!Roles.userIsInRole(complianceId, ['compliance', 'chiefcompliance'])) {
      Logger.error('[RPC][Warning] approveUser: Unauthorized', 'complianceId:', complianceId, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }
    const user = getReviewee(userId, 'approveUser');
    const newComplianceLevel = user.applyingForComplianceLevel();

    // update database
    const status = 'APPROVED';
    const record = ReviewRecords.create({
      userId: userId,
      complianceId: complianceId,
      target: 'USER',
      status: status,
      previousComplianceLevel: user.complianceLevel(),
      newComplianceLevel: newComplianceLevel,
    });
    Meteor.users.update(userId, {
      $set: {
        approvedAt: new Date(),
        'personalInformation.status': status,
        'personalInformation.complianceLevel': newComplianceLevel,
        'personalInformation.receivedSatoshisPreComplianceCheck': false,
      },
      $unset: { 'personalInformation.applyingForComplianceLevel': true },
    });
    Logger.info('[RPC]approveUser',
      'userId:', userId,
      'complianceId:', complianceId,
      'created review record: ', record,
      'updated user: ', Meteor.users.findOne(userId));

    Files.blocksUserExistingFiles(userId);
    Meteor.call('finishReviewing');

    // send compliance email
    const primaryEmailAddress = user.primaryEmail();
    const options = { userId: user._id, to: primaryEmailAddress };
    const sref = Refs.findOne({ emailto: primaryEmailAddress });
    if (sref && user.isDistributor()) {
      options.refcode = sref.refcode;
      sendDistributorApprovalEmail(options);
    }
    if (user.isBuyer()) {
      markJobAsReady('approveComplianceBtcWorker');
      markJobAsReady('approveComplianceBankWorker');
      sendEU201BuyerApprovalEmail(options);
    }
    return true;
  },

  sendUserToCco: function(userId) {
    check(userId, String);
    // Authorization
    const currentUser = Meteor.users.findOne(this.userId);
    if (!currentUser.isCompliance()) {
      Logger.error('[RPC][Warning] sendUserToCco: Unauthorized',
                   'complianceId:', currentUser._id, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }
    sendUserTo(userId, 'Cco', currentUser._id);
  },

  sendUserToHco: function(userId) {
    check(userId, String);
    // Authorization
    const currentUser = Meteor.users.findOne(this.userId);
    if (!currentUser.isCustomerService()) {
      Logger.error('[RPC][Warning] sendUserToHco: Unauthorized',
                   'customerServiceId:', currentUser._id, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }
    sendUserTo(userId, 'Hco', currentUser._id);
  },

  watchUser: function(userId) {
    check(userId, String);

    // authorization
    const complianceId = this.userId;
    if (!Roles.userIsInRole(complianceId, ['compliance', 'chiefcompliance'])) {
      Logger.error('[RPC][Warning] watchUser: Unauthorized', 'complianceId:', complianceId, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }

    checkRevieweeExistance(userId, 'watchUser');
    // update database
    Meteor.users.update(userId, {
      $addToSet: {
        'personalInformation.watchedBy': complianceId,
      },
    });
    Logger.info('[RPC]watchUser',
      'userId: ', userId,
      'updated user: ', Meteor.users.findOne(userId));
  },

  unwatchUser: function(userId) {
    check(userId, String);

    // authorization
    const complianceId = this.userId;
    if (!Roles.userIsInRole(complianceId, ['compliance', 'chiefcompliance'])) {
      Logger.error('[RPC][Warning] unwatchUser: Unauthorized', 'complianceId:', complianceId, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }

    checkRevieweeExistance(userId, 'unwatchUser');
    // update database
    Meteor.users.update(userId, {
      $pull: {
        'personalInformation.watchedBy': complianceId,
      },
    });
    Logger.info('[RPC]unwatchUser',
      'userId: ', userId,
      'updated user: ', Meteor.users.findOne(userId));
  },

  rejectUser: function(userId) {
    check(userId, String);

    // authorization
    const complianceId = this.userId;
    if (!Roles.userIsInRole(complianceId, ['compliance', 'chiefcompliance', 'headCompliance'])) {
      Logger.error('[RPC][Warning] rejectUser: Unauthorized', 'complianceId:', complianceId, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }

    checkRevieweeExistance(userId, 'rejectUser');

    // update database
    const status = 'REJECTED';
    const record = ReviewRecords.create({
      userId: userId,
      complianceId: complianceId,
      target: 'USER',
      status: status,
    });
    Meteor.users.update(userId, {
      $set: {
        rejectedAt: new Date(),
        'personalInformation.status': status,
        'personalInformation.receivedSatoshisPreComplianceCheck': false,
      }
    });
    Logger.info('[RPC]rejectUser',
      'userId:', userId,
      'complianceId:', complianceId,
      'created review record: ', record,
      'updated user: ', Meteor.users.findOne(userId));
    preCancelInvoicesOnReject(userId);
    Meteor.call('finishReviewing');

    return true;
  },

  updateHasBeenReviewed: function(userId) {
    check(userId, String);

    // authorization
    const complianceId = this.userId;
    if (!Roles.userIsInRole(complianceId, ['compliance', 'chiefcompliance'])) {
      Logger.error('[RPC][Warning] updateHasBeenReviewed: Unauthorized', 'complianceId:', complianceId, 'userId:', userId);
      throw new Meteor.Error('unauthorized');
    }

    const user = getReviewee(userId, 'rejectUser');

    Meteor.users.update(userId, {
      $set: {
        'personalInformation.hasBeenReviewed': !user.personalInformation.hasBeenReviewed,
      }
    });
    Logger.info('[RPC]updateHasBeenReviewed',
      'userId:', userId,
      'complianceId:', complianceId);
  },

  doneEditingHco: function(userId) {
    check(userId, String);
    authorize('doneEditingHco', this.userId, 'isHeadCompliance');
    const updatedUsers = Meteor.users.update(userId, { $set: { 'personalInformation.delegatedToHco': false }});
    if (updatedUsers !== 1) {
      Logger.error('[RPC][Warning] doneEditingHco: Could not finish editing user.',
        'complianceId:', complianceId,
        'updated users:', updatedUsers);
      throw new Meteor.Error('couldNotFinishEditingUser');
    }
    Meteor.call('finishReviewing');
  },

  deleteDocFile: function(fileId) {
    check(fileId, String);
    const currentUser = Meteor.users.findOne(this.userId);
    if (!currentUser.isComplianceOfficer()) {
      Logger.error('[RPC][Warning] deleteDocFile: Unauthorized',
                   'officer id:', currentUser._id, 'doc file:', fileId);
      throw new Meteor.Error('unauthorized');
    }
    Files.removeFile(fileId);
  }

});
