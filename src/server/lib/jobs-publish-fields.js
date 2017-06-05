'use strict';

const sysOpAllowFields = {
  type: 1,
  status: 1,
  created: 1,
  updated: 1,
};

/**
 * Filters or sets the option's fields based on what's allowed to this role
 * @param {object} options - Current find options, could include a narrower fields white-list.
 * @param {string} userRole - User's role to filter the fields for.
*/
export const secureJobsOptionsByRole = function secureJobsOptionsByRole(options, userRole) {
  let allowedFieldsForRole;
  // In the future we should switch fields white-list by role
  switch (userRole) {
    case 'sysop':
      allowedFieldsForRole = Object.assign({}, sysOpAllowFields);
      break;
    default:
      allowedFieldsForRole = {};
  }
  if (options && options.fields) {
    allowedFieldsForRole =  _.pick(allowedFieldsForRole, _.keys(options.fields));
  }
  return Object.assign({}, options, { fields: allowedFieldsForRole });
};
