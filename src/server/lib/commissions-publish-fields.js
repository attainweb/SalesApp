'use strict';

const commissionsPublicFields = {
  payoutAmount: 1,
  payoutTransactionId: 1,
  paidAt: 1,
  originator: 1,
  invoiceNumber: 1,
  distributorId: 1
};

export const secureCommissionsOptions = function secureCommissionsOptions(options) {
  let allowedFields = commissionsPublicFields;

  if (options && options.fields) {
    allowedFields = _.pick(allowedFields, _.keys(options.fields));
  }

  return Object.assign({}, options, { fields: allowedFields });
};
