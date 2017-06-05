import { Meteor } from 'meteor/meteor';
import Logger from '/imports/server/lib/logger';
import { retireRef } from '/imports/lib/shared/refs';
import {
    sendWalletAddressChangedEmailConfirmation,
    sendWalletAddressChangedEmail,
    sendEmailChangeNewAccountConfirmation,
    sendEmailChangeCurrentEmailConfirmation,
    sendEmailChangedEmail } from '/imports/server/email-actions';
import { regenerateAllProductPasscodes } from '/server/re-generate-product-passcode';

export const agreeToPolicyServer = function(userId, name) {
  let modifier = {
    $push: {
      ['personalInformation.agreedToPolicyAt.' + name]: new Date(),
    },
  };
  // Logger.info("agreeToPolicyServer", name, userId, modifier);
  return Meteor.users.update(userId, modifier);
};

export const confirmWalletAddressChange = (ref) => {

  const userId = ref.userId;
  const userToUpdate = Meteor.users.findOne(userId, { fields: { 'personalInformation.walletAddress': 1 } });
  if (!userToUpdate) {
    Logger.error('confirmWalletAddressChange no user to set');
    return 0;
  }
  const newAddress = ref.address;
  if (userToUpdate.personalInformation.walletAddress === newAddress) {
    Logger.error('Address already set', 'userId', userId, 'newAddress', newAddress);
    return 0;
  }

  const res = Meteor.users.update({
    _id: userId
  }, {
    $set: {
      'personalInformation.walletAddress': newAddress
    },
    $push: {
      'personalInformation.oldWalletAddresses': {
        value: newAddress,
        createdAt: new Date()
      }
    }
  });
  if (res === 0) {
    Logger.error("confirmWalletAddressChange No user was updated", 'userId', userId);
  } else if (res === 1) {
    sendWalletAddressChangedEmail(userId, newAddress);
    Logger.info("confirmWalletAddressChange User was updated", 'userId', userId);
  } else {
    Logger.error("confirmWalletAddressChange Unexpected result when updating user", 'userId', userId, 'result', res);
  }
  return res;
};

export const requestWalletAddressChange = (userId, walletAddress) => {

  let ref = Refs.findOne({ reftype: 'confirmAddress', userId: userId, isActive: true });
  if (ref && ref.isValid()) {
    if (ref.address === walletAddress) {
      Logger.info('[RPC][Info] requestWalletAddressChange: Existing ref code for this address. Resending Email', userId, walletAddress);
    } else {
      Logger.info('[RPC][Warning] requestWalletAddressChange: Existing ref code for this user with different address. ' +
          'retiring previous one. User', userId, 'requestAddress', walletAddress, 'prev ref address', ref.address);
      retireRef(ref.refcode);
      ref = null;
    }
  } else {
    ref = null;
  }

  if (!ref) {
    ref = Refs.create({reftype: 'confirmAddress', userId: userId, address: walletAddress});
  }
  if (!ref) {
    Logger.error("requestWalletAddressChange error creating refcode", 'userId', userId, 'walletAddress', walletAddress);
    return false;
  } else  {
    sendWalletAddressChangedEmailConfirmation(userId, walletAddress, ref.refcode);
    Logger.info("requestWalletAddressChange email sent", 'userId', userId, 'walletAddress', walletAddress);
    return true;
  }
};

export const requestEmailAddressChange = (userId, emailAddress) => {

  let ref = Refs.findOne({ reftype: 'confirmEmailAccount', userId: userId, isActive: true });
  if (ref) {
    if (ref.isValid()) {
      if (ref.emailAddress === emailAddress) {
        Logger.info('[RPC][Info] requestEmailAddressChange: Existing ref code for this address. Resending Email', userId, emailAddress);
      } else {
        Logger.info('[RPC][Warning] requestEmailAddressChange: Existing ref code for this user with different address. ' +
            'retiring previous one. User', userId, 'requestAddress', emailAddress, 'prev refcode', ref.refcode);
        retireRef(ref.refcode);
        ref = null;
      }
    } else {
      ref = null;
      // Check if there is also a confirmEmailChange ref-type for this user
      const confirmAccountRef = Refs.findOne({reftype: 'confirmEmailChange', userId: userId, isActive: true});
      if (confirmAccountRef && confirmAccountRef.isValid()) {
        Logger.info('[RPC][Warning] requestEmailAddressChange: retiring previous confirmEmailChange as well. User',
            userId, 'requestAddress', emailAddress, 'prev refcode', confirmAccountRef.refcode);
        retireRef(confirmAccountRef.refcode);
      }
    }
  }

  if (!ref) {
    ref = Refs.create({reftype: 'confirmEmailAccount', userId: userId, emailAddress: emailAddress});
  }
  if (!ref) {
    Logger.error("requestEmailAddressChange error creating refcode", 'userId', userId, 'emailAddress', emailAddress);
    return false;
  } else  {
    sendEmailChangeNewAccountConfirmation(userId, emailAddress, ref.refcode);
    Logger.info("requestEmailAddressChange email sent", 'userId', userId, 'emailAddress', emailAddress);
    return true;
  }
};

/**
 * Created a confirmEmailChange RefCode and sends an email to the "current" email address to confirm the change
 * @param userId
 * @param emailAddress
 * @returns {boolean}
 */
export const confirmEmailAddressAccount = (userId, emailAddress) => {

  let ref = Refs.findOne({ reftype: 'confirmEmailChange', userId: userId, isActive: true });
  if (ref && ref.isValid()) {
    if (ref.emailAddress === emailAddress) {
      Logger.info('[RPC][Info] confirmEmailAddressAccount: Existing ref code for this address. Resending Email', userId, emailAddress);
    } else {
      Logger.info('[RPC][Warning] confirmEmailAddressAccount: Existing ref code for this user with different address. ' +
          'retiring previous one. User', userId, 'requestAddress', emailAddress, 'prev ref address', ref.emailAddress);
      retireRef(ref.refcode);
      ref = null;
    }
  } else {
    ref = null;
  }

  if (!ref) {
    ref = Refs.create({reftype: 'confirmEmailChange', userId: userId, emailAddress: emailAddress});
  }
  if (!ref) {
    Logger.error("confirmEmailAddressAccount error creating refCode", 'userId', userId, 'emailAddress', emailAddress);
    return false;
  } else  {
    sendEmailChangeCurrentEmailConfirmation(userId, emailAddress, ref.refcode);
    Logger.info("confirmEmailAddressAccount email sent", 'userId', userId, 'emailAddress', emailAddress);
    return true;
  }
};

/**
 * Updates the user email
 * @param ref
 * @returns [int] number of updated Users
 */
export const confirmEmailAddressChange = (ref) => {

  const userId = ref.userId;
  const userToUpdate = Meteor.users.findOne(userId);

  const newEmailAddress = ref.emailAddress;
  if (ref.reftype !== 'confirmEmailChange') {
    Logger.error('Invalid refCode to change email', ref.reftype);
    return 0;
  }
  if (userToUpdate.primaryEmail() === newEmailAddress) {
    Logger.error('Email Address already set', 'userId', userId, 'newEmailAddress', newEmailAddress);
    return 0;
  }

  const res = Meteor.users.update({
    _id: userId
  }, {
    $set: {
      'emails.0.address': newEmailAddress
    },
    $push: {
      'oldEmails': {
        value: newEmailAddress,
        changedAt: new Date()
      }
    }
  });
  if (res === 0) {
    Logger.error("confirmEmailAddressChange No user was updated", 'userId', userId);
  } else if (res === 1) {
    regenerateAllProductPasscodes(userId);
    sendEmailChangedEmail(userId);
    Logger.info("confirmEmailAddressChange User was updated", 'userId', userId);
  } else {
    Logger.error("confirmEmailAddressChange Unexpected result when updating user", 'userId', userId, 'result', res);
  }
  return res;
};

