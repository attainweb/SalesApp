import Logger from '/imports/server/lib/logger';
import { renderLocalizedEmail } from '/imports/server/localization';
import { sendEmail } from '/imports/server/email-service.js';
import { getProductNameByLanguage } from '/imports/lib/settings';

const COMPANY_ROOT_URL = Meteor.absoluteUrl();
const COMPANY_BCC_EMAIL = process.env.COMPANY_BCC_EMAIL;
// This properties won't be ignored in nested objects
const DO_NOT_LOG = ['productPasscode', 'url'];

const logEmailDebugMessages = (template, email, language, subject, params) => {
  if (Meteor.isDevelopment) { // This check is done to log url in development environment,
    _.remove(DO_NOT_LOG, function(arg) {
      return arg === 'url';
    });
  }
  const loggableParams = _.omit(params, DO_NOT_LOG);
  Logger.info(`
    Sending ${template} email to ${email}
    Language: ${language}
    Subject: ${subject}
    Params: ${JSON.stringify(loggableParams)}
  `);
};
// const formatYen = (amount) => '¥' + numeral(amount).format('0,0');
const formatBtc = (amount) => numeral(amount).format('0,0.00000000') + ' BTC';
const formatProduct = (amount) => numeral(amount).format('0,0') + ' ' + getProductNameByLanguage(i18n.getLanguage());
const formatUsd = (amount) => numeral(amount).format('0,0.00') + ' USD';

export const sendET205ConfirmFundsReceived = function sendET205ConfirmFundsReceived(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const emailAddress = ticket.buyerEmail();
  const template = 'et205-confirm-funds-received';
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const subject = i18n('emailSubjects.confirmFundsReceived', 'ET205');

  const templatePrams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    date: moment().format(i18n('format.date')),
    usdRequested: ticket.usdRequested(),
    yenReceived: ticket.yenReceived
  };
  const emailText = renderLocalizedEmail(template, language, templatePrams);

  logEmailDebugMessages(template, emailAddress, language, subject, templatePrams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendWaitingForSaleToStartEmail = function(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const emailAddress = ticket.buyerEmail();
  const template = 'et102-waiting-for-sale-to-start';
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const subject = i18n('emailSubjects.waitForSaleToStart', 'ET102');

  const templateParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    usdRequested: formatUsd(ticket.usdRequested()),
    date: moment(ticket.createdAt).format(i18n('format.date'))
  };
  const emailText = renderLocalizedEmail(template, language, templateParams);

  logEmailDebugMessages(template, emailAddress, language, subject, templateParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendInvoiceEmail = function(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const emailAddress = ticket.buyerEmail();
  // Email template based on payment option i.e.: invoiceBank, invoiceBtc
  const paymentType = ticket.paymentOption.toLowerCase();
  let emailNumber = '';
  if (paymentType === 'btc') {
    emailNumber = 'et203';
  }
  if (paymentType === 'bank') {
    emailNumber = 'et202';
  }
  const template = `${emailNumber}-invoice-${paymentType}`;
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const url = COMPANY_ROOT_URL + `pay/${ticket._id}?lang=${language}`;
  // Subject based on payment option i.e.: emailSubjects.invoiceBank
  const subject = i18n('emailSubjects.invoice' + ticket.paymentOption, ticket.paymentOption === 'Bank' ? 'ET202' : 'ET203');

  const emailParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    usdRequested: formatUsd(ticket.usdRequested()),
    processingFee: formatUsd(ticket.processingFee()),
    total: formatUsd(ticket.totalCostUsd()),
    halfBtcAddress: ticket.btcAddress.slice(0, ticket.btcAddress.length / 2),
    url: url,
    date: moment(ticket.createdAt).format(i18n('format.date'))
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendET204InvoiceExpiredEmail = function sendET204InvoiceExpiredEmail(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const emailAddress = ticket.buyerEmail();
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const template = 'et204-invoice-expired-email';
  const subject = i18n('emailSubjects.ET204InvoiceExpiredEmail', 'ET204');
  const url = COMPANY_ROOT_URL + `reorder?lang=${language}`;

  const emailParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    usdRequested: formatUsd(ticket.usdRequested()),
    url: url,
    date: moment(ticket.createdAt).format(i18n('format.date'))
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendET206InvoiceCanceledEmail = function sendET206InvoiceCanceledEmail(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const emailAddress = ticket.buyerEmail();
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const template = 'et206-invoice-canceled-email';
  const subject = i18n('emailSubjects.ET206InvoiceCanceledEmail', 'ET206');
  const url = COMPANY_ROOT_URL + `reorder?lang=${language}`;

  const emailParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    usdRequested: formatUsd(ticket.usdRequested()),
    url: url,
    date: moment(ticket.createdAt).format(i18n('format.date'))
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendET201ProductReservedButPending  = function sendET201ProductReservedButPending(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const emailAddress = ticket.buyerEmail();
  const template = 'et201-product-reserved-but-pending';
  const subject = i18n('emailSubjects.productReservedButPending', 'ET201');

  const emailParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    date: moment().format(i18n('format.date')),
    usdRequested: ticket.usdRequested(),
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

const createET301ReceiptEmailParams = function(ticket, productPasscode) {
  return {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    date: moment().format(i18n('format.date')),
    btcUsd: ticket.btcUsd,
    btcReceived: formatBtc(ticket.btcReceived()),
    paymentOptionBank: ticket.paymentOption === 'Bank',
    productPurchased: formatProduct(ticket.productAmount),
    productPasscode: productPasscode,
    usdRequested: formatUsd(ticket.usdRequested()),
  };
};

export const sendET301ReceiptEmails = function sendET301ReceiptEmails(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const emailAddress = ticket.buyerEmail();
  const template = 'et301-receipt';
  const subject = i18n('emailSubjects.ET301Receipt', 'ET301');

  // we don't want to bcc' this email as it contains the unhashed productPasscode as
  // requested in https://trello.com/c/Gd3wWpT3/122-start-to-sha256-hash-productcodes
  // That's why the bcc is sent in a separate action within this same method
  const emailParams = createET301ReceiptEmailParams(ticket, options.productPasscode);
  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  const emailText = renderLocalizedEmail(template, language, emailParams);
  sendEmail(emailAddress, subject, emailText, undefined);

  const bccEmailParams = createET301ReceiptEmailParams(ticket, "**********************");
  logEmailDebugMessages(template, COMPANY_BCC_EMAIL, language, subject, bccEmailParams);
  const bccEmailText = renderLocalizedEmail(template, language, bccEmailParams);
  sendEmail(COMPANY_BCC_EMAIL, subject, bccEmailText, undefined);
};

export const sendDistributorSignupEmail = function(options) {
  const user = Meteor.users.findOne(options.userId);
  const language = user.lang();
  i18n.setLanguage(language);
  const emailAddress = user.primaryEmail();
  const template = 'eu301-distributor-signup';
  const subject = i18n('emailSubjects.signup', 'EU301');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    url: COMPANY_ROOT_URL + 'signup/' + options.refcode + `?lang=${language}`
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

export const sendDistributorApprovalEmail =  function sendDistributorApprovalEmail(options) {
  check(options.userId, String);

  const user = Meteor.users.findOne(options.userId);
  const emailAddress = user.primaryEmail();
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu202-distributor-approval';
  const subject = i18n('emailSubjects.distributorApproval', 'EU202');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    url: COMPANY_ROOT_URL
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendEU201BuyerApprovalEmail =  function sendBuyerApprovalEmail(options) {
  check(options.userId, String);

  const user = Meteor.users.findOne(options.userId);
  const emailAddress = user.primaryEmail();
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu201-buyer-approval';
  const subject = i18n('emailSubjects.buyerApproval', 'EU201');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName()
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendPasswordResetEmail = function sendPasswordResetEmail(emailAddress) {
  check(emailAddress, String);

  const user = Meteor.users.findOne({ 'emails.0.address': emailAddress });
  if (!user) {
    throw new Meteor.Error(404, `[Error] sendPasswordResetEmail: Email not found`);
  }

  const refParams = {
    reftype: 'reset',
    emailto: emailAddress
  };
  const ref = Refs.create(refParams);
  Logger.info(`[sendPasswordResetEmail - Info]`, `Ref[${ref._id}] created`);

  const language = user.lang();
  i18n.setLanguage(language);

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    url: `${COMPANY_ROOT_URL}password-reset/${ref.refcode}?lang=${language}`
  };

  const template = 'eu101-password-reset';
  const subject = i18n('emailSubjects.reset', 'EU101');
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

// use only for a valid user
export const sendEU501RegenerateAllProductPasscodes = function sendEU501RegenerateAllProductPasscodes(user) {
  const emailAddress = user.primaryEmail();
  const refParams = {
    reftype: 're-generate-all',
    emailTo: emailAddress,
    userId: user._id
  };
  const ref = Refs.create(refParams);
  Logger.info(`[sendEU501RegenerateAllProductPasscodes - Info]`, `Ref[${ref._id}] created`);

  const language = user.lang();
  i18n.setLanguage(language);

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    url: `${COMPANY_ROOT_URL}re-generate-all-product-passcodes/${ref.refcode}?lang=${language}`
  };

  const template = 'eu501-re-generate-all-product-passcodes';
  const subject = i18n('emailSubjects.sendEU501RegenerateAllProductPasscodes', 'EU501');
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

// use only for a valid user and ticket
export const sendEU502RegenerateProductPasscode = function sendEU502RegenerateProductPasscode(user, ticket) {
  const emailAddress = user.primaryEmail();
  const refParams = {
    reftype: 're-generate-one',
    emailTo: emailAddress,
    userId: user._id,
    invoiceTicketId: ticket._id
  };
  const ref = Refs.create(refParams);
  Logger.info(`[sendEU502RegenerateProductPasscode - Info]`, `Ref[${ref._id}] created`);

  const language = user.lang();
  i18n.setLanguage(language);

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    invoiceNumber: ticket.invoiceNumber,
    usdRequested: formatUsd(ticket.usdRequested()),
    date: moment(ticket.createdAt).format(i18n('format.date')),
    url: `${COMPANY_ROOT_URL}re-generate-product-passcode/${ref.refcode}?lang=${language}`
  };

  const template = 'eu502-re-generate-product-passcode';
  const subject = i18n('emailSubjects.sendEU502RegenerateProductPasscode', 'EU502');

  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

export const sendWalletAddressChangedEmailConfirmation = function(userId, walletAddress, refcode) {
  check(userId, String);
  check(walletAddress, String);

  const user = Meteor.users.findOne(userId);

  const emailAddress = user.primaryEmail();
  if (!emailAddress) {
    Logger.error('[Email] sendWalletAddressChangedEmailConfirmation Email not found', 'userId', userId, 'walletAddress', walletAddress);
    throw new Meteor.Error(404, '[Error] sendWalletAddressChangedEmail: Email not found');
  }
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu302-wallet-address-changed-confirmation';
  const subject = i18n('emailSubjects.EU302WalletAddressChangedConfirmation', 'EU302');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    walletAddress: walletAddress,
    url: COMPANY_ROOT_URL + "confirm-address-change/" + refcode + "?lang=" + language
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

export const sendWalletAddressChangedEmail = function(userId, walletAddress) {
  check(userId, String);
  check(walletAddress, String);

  const user = Meteor.users.findOne(userId);

  const emailAddress = user.primaryEmail();
  if (!emailAddress) {
    Logger.error('[Email] sendWalletAddressChangedEmail Email not found', 'userId', userId, 'walletAddress', walletAddress);
    throw new Meteor.Error(404, '[Error] sendWalletAddressChangedEmail: Email not found');
  }
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu303-wallet-address-changed';
  const subject = i18n('emailSubjects.EU303WalletAddressChanged', 'EU303');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    walletAddress: walletAddress,
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendEmailChangeNewAccountConfirmation = function(userId, newEmailAddress, refcode) {
  check(userId, String);
  check(newEmailAddress, String);

  const user = Meteor.users.findOne(userId);
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu304-email-change-new-email-confirmation';
  const subject = i18n('emailSubjects.EU304EmailChangeNewEmailConfirmation', 'EU304');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    url: COMPANY_ROOT_URL + "confirm-email-account/" + refcode + "?lang=" + language
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, newEmailAddress, language, subject, emailParams);
  return sendEmail(newEmailAddress, subject, emailText);
};

export const sendEmailChangeCurrentEmailConfirmation = function(userId, newEmailAddress, refcode) {
  check(userId, String);
  check(newEmailAddress, String);

  const user = Meteor.users.findOne(userId);
  const emailAddress = user.primaryEmail();
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu305-email-change-current-email-confirmation';
  const subject = i18n('emailSubjects.EU305EmailChangeCurrentEmailConfirmation', 'EU305');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName(),
    newEmailAddress: newEmailAddress,
    url: COMPANY_ROOT_URL + "confirm-email-change/" + refcode + "?lang=" + language
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

export const sendEmailChangedEmail = function(userId) {
  check(userId, String);

  const user = Meteor.users.findOne(userId);
  const emailAddress = user.primaryEmail();
  const language = user.lang();
  i18n.setLanguage(language);
  const template = 'eu306-email-changed';
  const subject = i18n('emailSubjects.EU306EmailChanged', 'EU306');

  const emailParams = {
    firstName: user.firstName(),
    lastName: user.lastName()
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText);
};

export const sendET101TicketEnqueuedEmail = function(options) {
  check(options.ticketId, String);

  const ticket = InvoiceTickets.findOne(options.ticketId);
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const emailAddress = ticket.buyerEmail();
  const template = 'et101-ticket-enqueued-email';
  const subject = i18n('emailSubjects.ET101TicketEnqueuedEmail', 'ET101');

  if (!emailAddress) {
    Logger.error('[Email] ET101TicketEnqueuedEmail Email not found', 'userId', ticket.buyerId);
    throw new Meteor.Error(404, '[Error] ET101TicketEnqueuedEmail: Email not found');
  }
  const emailParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName(),
    invoiceNumber: ticket.invoiceNumber,
    usdRequested: formatUsd(ticket.usdRequested()),
    date: moment(ticket.createdAt).format(i18n('format.date'))
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendWaitingForProductWhilePendingComplianceEmail = function(ticket) {
  const emailAddress = ticket.buyerEmail();
  const template = 'eu102-waiting-for-product-while-pending-compliance';
  const language = ticket.buyerLang();
  i18n.setLanguage(language);
  const subject = i18n('emailSubjects.EU102waitingForProductWhilePendingCompliance', 'EU102');

  const templateParams = {
    firstName: ticket.buyerFirstName(),
    lastName: ticket.buyerLastName()
  };
  const emailText = renderLocalizedEmail(template, language, templateParams);

  logEmailDebugMessages(template, emailAddress, language, subject, templateParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};

export const sendEmailVerificationCode = function(emailVerificationRef, language) {
  const emailAddress = emailVerificationRef.emailto;
  check(emailVerificationRef.refcode, String);
  check(emailAddress, String);

  i18n.setLanguage(language);
  const template = 'eu103-verification-code';
  const subject = i18n('emailSubjects.emailVerificationCode');

  const emailParams = {
    code: emailVerificationRef.refcode
  };
  const emailText = renderLocalizedEmail(template, language, emailParams);

  logEmailDebugMessages(template, emailAddress, language, subject, emailParams);
  return sendEmail(emailAddress, subject, emailText, COMPANY_BCC_EMAIL);
};
