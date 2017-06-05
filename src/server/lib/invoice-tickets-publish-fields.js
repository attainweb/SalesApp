'use strict';

const invoicePublicFieldsWhiteList = {
  buyerId: 1,
  buyerApprovedAt: 1,
  btcAddressAssignedAt: 1,
  inviteApprovedAt: 1,
  approvedInviteCanceledAt: 1,
  invoiceSentAt: 1,
  fundsReceivedAt: 1,
  fundsReceivedConfirmedAt: 1,
  fundsReceivedCanceledAt: 1,
  // officerThatRequestPreCancel: 1,
  // canceledAt: 1,
  satoshisExpectedAt: 1,
  satoshisReceivedAt: 1,
  receiptSentAt: 1,
  state: 1,
  invoiceNumber: 1,
  btcAddress: 1,
  paymentOption: 1,
  jpyUsd: 1,
  btcJpy: 1,
  btcUsd: 1,
  centsRequested: 1,
  centsAskPrice: 1,
  yenReceived: 1,
  satoshisExpected: 1,
  satoshisBought: 1,
  satoshisReceived: 1,
  fundsReceived: 1,
  invoiceTransactionId: 1,
  productAmount: 1,
  commissionsMoved: 1,
  commissions: 1,
  payoutTransactionId: 1,
  comment: 1,
  bank: 1,
  // productPasscode: 1,
  tranche: 1,
  // oldProductPasscodes : 1,
  // changelog : 1,
  refundTransactionId: 1,
  refundReason: 1,
  enqueuedEmailSentAt: 1,
  waitingForProductWhilePendingComplianceEmailSentAt: 1,
  // productVendingInvitation: 1,
  // avvmInformationObject: 1,
  // hasVended: 1,
  /* This are basic schemma fields*/
  createdAt: 1,
  createdBy: 1,
  updatedAt: 1,
  updatedBy: 1
};

const invoiceBuyerFieldsWhiteList = function() {
  return delete invoicePublicFieldsWhiteList.state;
};
/**
 * Filters or sets the option's fields based on what's allowed to this role
 * @param {object} options - Current find options, could include a narrower fields white-list.
 * @param {string} userRole - User's role to filter the fields for.
*/
export const secureInvoicesOptionsByRole = function secureInvoicesOptionsByRole(options, userRole) {
  let allowedFieldsForRole;
  // In the future we should switch fields white-list by role
  switch (userRole) {
    case 'buyer':
      // invoiceBuyerFieldsWhiteList(); for now disable this until we are sure this is not that issue (see #1674)
    default:
      allowedFieldsForRole = invoicePublicFieldsWhiteList;
  }
  if (options && options.fields) {
    allowedFieldsForRole =  _.pick(allowedFieldsForRole, _.keys(options.fields));
  }
  return Object.assign({}, options, { fields: allowedFieldsForRole });
};
