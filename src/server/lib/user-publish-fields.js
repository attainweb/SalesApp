'use strict';

const userDefaultPersonalInformationFieldsWhiteList = {
  'personalInformation.name': 1,
  'personalInformation.surname': 1,
  'personalInformation.companyName': 1,
  'personalInformation.registrationDate': 1,
  'personalInformation.status': 1,
  'personalInformation.residenceCountry': 1,
  'personalInformation.agreedToPolicyAt': 1,
  'personalInformation.language': 1,
};

const userPublicFieldsWhiteList = {
  emails: 1,
  roles: 1,
  reviewing: 1,
};

const distributorAllowedFields = {
  'personalInformation.distlevel': 1,
  'personalInformation.walletAddress': 1,
};

const officerAllowedFields = {
  fuzzySearchEmails: 1,
  notes: 1,
  personalInformation: 1,
  comment: 1,
  createdAt: 1,
  enrollmentClientIP: 1,
};

/**
 * Filters or sets the option's fields based on what's allowed to this role
 * @param {object} options - Current find options, could include a narrower fields white-list.
 * @param {string} userRole - User's role to filter the fields for.
*/
export const secureUserOptionsByRole = function secureUserOptionsByRole(options, userRole) {
  let allowedFieldsForRole;
  // In the future we should switch fields white-list by role
  switch (userRole) {
    case 'compliance':
    case 'chiefcompliance':
    case 'headCompliance':
    case 'customerService':
    case 'investigator':
      allowedFieldsForRole = Object.assign({}, userPublicFieldsWhiteList, officerAllowedFields);
      break;

    case 'distributor':
      allowedFieldsForRole = Object.assign({}, userPublicFieldsWhiteList, distributorAllowedFields, userDefaultPersonalInformationFieldsWhiteList);
      break;

    default:
      allowedFieldsForRole = Object.assign({}, userPublicFieldsWhiteList, userDefaultPersonalInformationFieldsWhiteList);
  }
  if (options && options.fields) {
    allowedFieldsForRole =  _.pick(allowedFieldsForRole, _.keys(options.fields));
  }
  return Object.assign({}, options, { fields: allowedFieldsForRole });
};
