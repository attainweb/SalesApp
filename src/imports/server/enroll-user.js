import { retireRef } from '/imports/lib/shared/refs';
import Logger from '/imports/server/lib/logger';
import { sendDistributorSignupEmail } from '/imports/server/email-actions';
import { createInvoiceTicket } from '/imports/server/invoice-tickets/create-invoice-ticket';
import { agreeToPolicyServer } from '/imports/server/accounts';

export const validateRefCode = function(refcode) {
  Logger.info("[enrollUser] - Validating refcode");
  const ref = Refs.findOne({refcode: refcode});
  if (!ref || ! ref.isValid()) {
    Logger.info("[enrollUser] - Invalid Refcode");
    throw new Meteor.Error('invalid-ref-code');
  }
  Logger.info("[enrollUser] - Ref code ok!!");
  return ref;
};

export const validateEmail = function(email) {
  Logger.info("[enrollUser] - Validating email");
  const matches = Meteor.users.find({ 'emails.0.address': email });
  if (matches.count() > 0) {
    throw new Meteor.Error('email-exists');
  }
  Logger.info("[enrollUser] - Email ok!!");
};

export const retireRefIfOneTime = function(ref) {
  Logger.info("[enrollUser] - Executing retireRefIfOneTime method");
  if (ref.timetype === 'onetime') {
    Logger.info('retiring ref: ', ref.refcode);
    retireRef(ref.refcode);
  } else {
    Logger.info('ref code not retired because type is not onetime');
  }
  Logger.info("[enrollUser] - retireRefIfOneTime method finished!");
};

export const agreeToPolicies = function(options, user) {
  Logger.info("[enrollUser] - Aggreeing to policies");
  if (options.acceptRisk) {
    agreeToPolicyServer(user._id, 'RISK');
    Logger.info("Aggreed RISK");
  }
  if (options.acceptToc) {
    agreeToPolicyServer(user._id, 'TOC');
    Logger.info("Aggreed TOC");
  }
  if (options.acceptPrivacy) {
    agreeToPolicyServer(user._id, 'PRIVACY');
    Logger.info("Aggreed PRIVACY");
  }
  Logger.info("[enrollUser] - Finished agreeToPolicies");
};

export const generateSref = function(email) {
  const sref = Refs.create({
    reftype: 'signup',
    emailto: email,
  });
  return sref;
};

export const checkParameters = function(options) {
  check(options, {
    refcode: String,
    emailVerificationCode: String,
    userFields: {
      email: String,
      personalInformation: {
        name: Match.Optional(String),
        surname: Match.Optional(String),
        accountType: Match.Optional(String),
        phone: Match.Optional(String),
        birthdate: Match.Optional(Date),
        language: Match.Optional(String),
        residenceCountry: Match.Optional(String),
        postaddress: Match.Optional({
          zip: Match.Optional(String),
          apiInvalidZip: Match.Optional(Boolean),
          state: Match.Optional(String),
          city: Match.Optional(String),
          address: Match.Optional(String)
        }),
        companyName: Match.Optional(String),
        registrationDate: Match.Optional(Date)
      },
    },
    paymentOption: Match.Optional(String),
    usdRequested: Match.Optional(Number),
    acceptRisk: Boolean,
    acceptToc: Boolean,
    acceptPrivacy: Boolean,
  });
};

export const createHoldingWallet = function(user) {
  user.updateFields({'personalInformation.hasInvoiceWallet': false});
  // actual assignment is done async by _w0_backfill_holding_wallets_worker.js
  Logger.info("Distributor wallet created for user ", user._id);
};

export const createInvoiceTicketEnroll = function(user, paymentOption, usdRequested) {
  Logger.info("[enrollUser] - starting createInvoiceTicket method");
  Logger.info("Creating Invoice ticket for user ", user._id);
  createInvoiceTicket({ buyerId: user._id, paymentOption: paymentOption, usdRequested: usdRequested });
  Logger.info("[enrollUser] - finished createInvoiceTicket method");
};

export const sendSignupEmail = function(user, sref) {
  Logger.info("[enrollUser] - starting sendSignupEmail method");
  Logger.info("Sending Signup Email for distributor ", user._id);
  sendDistributorSignupEmail({ userId: user._id, refcode: sref.refcode, role: 'distributor' });
  Logger.info("[enrollUser] - finished sendSignupEmail method");
};

export const createUser = function(userFields) {
  Logger.info("[enrollUser] - starting createUser method");
  const userId = Accounts.createUser(userFields);
  const user = Meteor.users.findOne(userId);
  const history = { value: userFields.email };
  const pushOldEmail = { $push: {'oldEmails': history} };
  const res = Meteor.users.update(userId, pushOldEmail);
  Logger.info("[enrollUser]", "pushOldEmail", res, pushOldEmail);
  Logger.info("[enrollUser] - finished createUser method");
  return user;
};
