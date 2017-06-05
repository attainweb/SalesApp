import Logger from '/imports/server/lib/logger';
import { checkRef, retireRef, checkEmailVerificationRef } from '/imports/lib/shared/refs';
import { checkPassword } from '/imports/lib/shared/check-password';
import { emailFromSref } from '/server/collections/refs';
import { agreeToPolicyServer,
    requestWalletAddressChange,
    confirmWalletAddressChange,
    requestEmailAddressChange,
    confirmEmailAddressAccount,
    confirmEmailAddressChange} from '/imports/server/accounts';
import {
  validateRefCode,
  validateEmail,
  retireRefIfOneTime,
  generateSref,
  checkParameters,
  agreeToPolicies,
  createHoldingWallet,
  createInvoiceTicketEnroll,
  sendSignupEmail,
  createUser
} from '/imports/server/enroll-user';
import { availableLanguages } from '/imports/lib/shared/i18n';
import { sendEmailVerificationCode } from '/imports/server/email-actions';

Meteor.methods({

  // Only for buyers and distributors; use Meteor.call('addComplianceAdmin', ...);
  // for creating compliance admins.
  // options: { userFields, documentId, paymentOption, usdRequested }
  enrollUser: function(options) {
    Logger.info("[enrollUser] - starting");
    Logger.info("[enrollUser] - checking if sale is over");
    if (Meteor.settings.public.salesOver) {
      Logger.info("[enrollUser] - sale is over");
      throw new Meteor.Error(404, i18n("reorder.errors.salesOver"));
    }
    Logger.info("[enrollUser] - sale is not over");

    Logger.info("[enrollUser] - checking parameters");
    checkParameters(options);
    Logger.info("[enrollUser - parameters checked ok!]");

    Logger.info('[enrollUser] options: ', options);

    const enrollmentClientIP = this.connection.clientAddress;
    Logger.info('Enrollment Client Request IP: ', enrollmentClientIP);

    const refcode       = options.refcode;
    const userFields    = options.userFields;
    const paymentOption = options.paymentOption;
    const usdRequested  = options.usdRequested;

    // get refcode and validate
    const ref = validateRefCode(refcode);

    // validate email
    validateEmail(userFields.email);

    // Map user personalInformations selected fields
    const userPersonalInformationFields = ['name', 'surname', 'accountType', 'phone', 'birthdate', 'roles', 'originatorId', 'distlevel',
      'language', 'residenceCountry', 'postaddress', 'companyName', 'registrationDate'];

    userFields.personalInformation = _.pick(options.userFields.personalInformation, userPersonalInformationFields);
    userFields.personalInformation.refcode = refcode;

    // normalize role
    const isValidRefType = _.includes(['partner', 'distributor', 'buyer'], ref.reftype );
    if (!isValidRefType) {
      Logger.error(`invalid ref type ${ref.reftype}`);
      throw new Meteor.Error('invalid-ref-type');
    }
    userFields.personalInformation.roles = [(ref.reftype === 'partner' ? 'distributor' : ref.reftype)];

    // validate language
    const userLanguage = userFields.personalInformation.language;
    if (availableLanguages.indexOf(userLanguage) === -1) {
      Logger.error(`invalid language option ${userLanguage}`);
      throw new Meteor.Error('invalid-language');
    }

    userFields.personalInformation.originatorId = ref.originatorId;
    userFields.personalInformation.distlevel = ref.distlevel;

    // Check user received at least one email (and entered the validation code)
    const emailVerificationRef = checkEmailVerificationRef(options.emailVerificationCode, options.userFields.email);

    // retire refcode if onetime use
    retireRefIfOneTime(ref);
    retireRefIfOneTime(emailVerificationRef);

    // Set up enrollment Client's IP on the users personalInformation
    userFields.personalInformation.enrollmentClientIP = enrollmentClientIP;

    Logger.info('[enrollUser]', 'creating account', 'userFields:', userFields);

    // create user account
    const user = createUser(userFields);

    // check if we have uploaded documents and if we can attach them to their new owner
    Files.update({connectionId: this.connection.id}, {$set: {userId: user._id}}, { multi: true });

    if (user.isDistributor()) {
      // create Holding Wallet for distributors
      createHoldingWallet(user);
      const sref = generateSref(user.primaryEmail());
      // generate sref
      sendSignupEmail(user, sref);
    } else {
      // create InvoiceTicket here if it is a buyer; send signup email if distributor
      createInvoiceTicketEnroll(user, paymentOption, usdRequested);
    }
    // aggree to policies
    agreeToPolicies(options, user);

    return user._id;
  },

  signupUser: function(options) {
    Logger.info('[signupUser] - starting:', 'options', options);
    check(options.refcode, String);
    const email = emailFromSref(options.refcode);
    const user = Meteor.users.findOne({'emails.address': email });
    Logger.info('user: ', user);
    if (!user) {
      Logger.info('[Error] Signup User: Email not found');
      throw new Meteor.Error('email-not-found');
    }
    const userId = user._id;
    Logger.info('userId: ', userId);

    const isValid = checkRef(options.refcode);
    if (!isValid) {
      Logger.info('[Error] Update Password: Reset code is invalid');
      throw new Meteor.Error('reset-code-invalid');
    }

    // Check wether password adheres to standard
    const checkedPassword = checkPassword(options.password);
    if (checkedPassword === null) {
      Logger.info('[Error] Update Password: Password format is invalid');
      throw new Meteor.Error('password-format-invalid');
    }

    Accounts.setPassword(userId, options.password);

    let affected = Meteor.users.update({_id: userId}, {
      $set: {
        'emails.0.verified': true,
      }
    });
    Logger.info('affected: ', affected);

    if (affected === 0) {
      Logger.info('[Error] Signup User: Update Failed');
      throw new Meteor.Error('update-failed');
    }

    affected = retireRef(options.refcode);
    if (affected === 0) {
      Logger.info('[Error] Update Password: Unable to retire reset code');
      throw new Meteor.Error('unable-to-retire-code');
    }
    Logger.info('[signupUser] - successfully finished', `user[${userId}]`);
  },

  updatePassword: function(options) {
    Logger.info('[updatePassword] - starting:', 'options (without password) ', _.omit(options, 'password'));
    check(options.refcode, String);
    check(options.password, String);
    const email = emailFromSref(options.refcode);
    const user = Meteor.users.findOne({'emails.address': email });
    Logger.info('user: ', user);
    if (!user) {
      Logger.info('[Error] Change Password: Email not found');
      throw new Meteor.Error('email-not-found');
    }
    const userId = user._id;
    Logger.info('userId: ', userId);

    const isValid = checkRef(options.refcode);
    if (!isValid) {
      Logger.info('[Error] Update Password: Reset code is invalid');
      throw new Meteor.Error('reset-code-invalid');
    }
    const affected = retireRef(options.refcode);
    if (affected === 0) {
      Logger.info('[Error] Update Password: Unable to retire reset code');
      throw new Meteor.Error('unable-to-retire-code');
    }
    Accounts.setPassword(userId, options.password);
    Logger.info('[updatePassword] - successfully finished', `user[${userId}]`);
  },

  agreeToPolicy: function(policyName) {
    check(policyName, String);

    // authorization
    const distributorId = this.userId;
    if (!Roles.userIsInRole(distributorId, ['distributor'])) {
      Logger.error('[RPC][Warning] agreeToPolicy: Unauthorized', 'distributorId:', distributorId);
      throw new Meteor.Error('unauthorized');
    }

    const res = agreeToPolicyServer(this.userId, policyName);

    Logger.info('[RPC] agreeToPolicy',
                'distributorId:', distributorId,
                'policyName:', policyName);

    return res;
  },

  confirmWalletAddressUpdate: function(refcode) {
    const ref = Refs.findOne( {refcode: refcode, reftype: 'confirmAddress'} );
    if (!ref || ! ref.isValid()) {
      Logger.info("[confirmWalletAddressUpdate] - Invalid Refcode");
      throw new Meteor.Error('invalid-ref-code');
    }
    const res = confirmWalletAddressChange(ref);
    if (res === 1) {
      retireRef(refcode);
    }
  },

  addWalletAddressToCurrentUser: function(walletAddress) {
    check(walletAddress, String);

    // authorization
    const distributorId = this.userId;
    if (!Roles.userIsInRole(distributorId, ['distributor'])) {
      Logger.error('[RPC][Warning] addWalletAddressToCurrentUser: Unauthorized', 'distributorId:', distributorId);
      throw new Meteor.Error('unauthorized');
    }
    const user = Meteor.users.findOne(this.userId, { fields: { 'personalInformation.walletAddress': 1 } });
    if (user.personalInformation.walletAddress === walletAddress) {
      Logger.info('[RPC][Warning] addWalletAddressToCurrentUser: Same wallet');
      throw new Meteor.Error('sameAddress');
    }
    if (!Meteor.validateBitcoinAddress(walletAddress)) {
      Logger.error('[RPC][Warning] addWalletAddressToCurrentUser: Invalid Wallet Address', 'walletAddress:', walletAddress);
      throw new Meteor.Error('invalidWalletAddress');
    }

    const res = requestWalletAddressChange(this.userId, walletAddress);

    Logger.info('[RPC] addWalletAddressToCurrentUser',
                'distributorId:', distributorId,
                'walletAddress:', walletAddress,
                'res', res);

    return res;
  },

  /**
   * This is the first step of changing address, it only sends the confirmations emial,
   * it does not actually change the address.
   * @param emailAddress
   * @returns {*}
   */
  changeEmailAddressToCurrentUser: function(emailAddress) {
    emailAddress = emailAddress.trim();
    check(emailAddress, String);

    const buyerId = this.userId;

    const emailObject = { address: emailAddress };
    const isValid = Schemas.EmailObject.namedContext("validateEmail").validateOne(emailObject, 'address');
    if (!isValid) {
      Logger.error('[RPC][Warning] changeEmailAddressToCurrentUser: invalid input for email', emailAddress);
      throw new Meteor.Error('invalidInput');
    }
    // authorization, only buyers are allowed to change emails
    if (!Roles.userIsInRole(buyerId, ['buyer'])) {
      Logger.error('[RPC][Warning] changeEmailAddressToCurrentUser: Unauthorized', 'userId:', buyerId);
      throw new Meteor.Error('unauthorized');
    }
    const user = Meteor.users.findOne(buyerId, { fields: { 'personalInformation.status': 1, emails: 1, oldEmails: 1 } });
    if (!user.isPending() && !user.isApproved()) {
      Logger.info('[RPC][Warning] changeEmailAddressToCurrentUser: user status not allowed', user.personalInformation.status);
      throw new Meteor.Error('unauthorized');
    }

    if (user.primaryEmail().toLowerCase() === emailAddress.toLowerCase()) {
      Logger.error('[RPC][Warning] changeEmailAddressToCurrentUser: sames email address', emailAddress);
      throw new Meteor.Error('sameEmail');
    }

    const existing = Meteor.users.findByEmail(emailAddress, {fields: {_id: 1, emails: 1}});
    if (existing) {
      Logger.error('[RPC][Warning] changeEmailAddressToCurrentUser: email already exists', emailAddress, ' user ', user._id);
      throw new Meteor.Error('emailAlreadyExists');
    }
    const res = requestEmailAddressChange(this.userId, emailAddress);

    Logger.info('[RPC] changeEmailAddressToCurrentUser',
        'buyerId:', buyerId,
        'new address:', emailAddress,
        'res', res);

    return res;
  },

  confirmEmailAccount: function(refcode) {
    const ref = Refs.findOne( {refcode: refcode, reftype: 'confirmEmailAccount'} );
    if (!ref || ! ref.isValid()) {
      Logger.info("[confirmEmailAccount] - Invalid Refcode");
      throw new Meteor.Error('invalid-ref-code');
    }
    const result = confirmEmailAddressAccount(ref.userId, ref.emailAddress);
    if (result) {
      Logger.info("[confirmEmailAccount] - retiring Refcode");
      retireRef(refcode);
    }
  },

  confirmEmailChange: function(refcode) {
    const ref = Refs.findOne( {refcode: refcode, reftype: 'confirmEmailChange'} );
    if (!ref || ! ref.isValid()) {
      Logger.info("[confirmEmailChange] - Invalid Refcode");
      throw new Meteor.Error('invalid-ref-code');
    }
    const res = confirmEmailAddressChange(ref);
    if (res === 1) {
      retireRef(refcode);
    }
  },

  getUserCountryByEmail: function(email) {
    const user = Meteor.users.findOne({'emails.address': email });
    try {
      return user.personalInformation.residenceCountry;
    } catch (err) {
      Logger.info('[Error] getUserCountryByEmail: Email not found');
      return undefined;
    }
  },

  sendEmailVerificationCode: function(refcode, email, language) {
    // We validate it's for a valid enroll link
    validateRefCode(refcode);
    const emailVerificationRef = Refs.createEmailVerification(email);
    // FIXME this should be done using a worker. In order to have a first version we will send it without it
    return sendEmailVerificationCode(emailVerificationRef, language);
  },

  checkEmailVerificationCode: function(email, emailRefCode) {
    check(email, String);
    check(emailRefCode, String);

    const isValid = checkEmailVerificationRef(emailRefCode, email);

    if (!isValid) {
      throw new Meteor.Error('email-verification-invalid-code');
    }

    return true;
  }
});
