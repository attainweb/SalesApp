'use strict';

/**
 * Returns a fuzzy email search term based on the following rules
 * - The following email format is supported user.name+alias@domain.com
 * - Searching by user.name@domain.com should return user.name+alias@domain.com
 * - Searching by username@domain.com should return user.name+alias@domain.com
 * - Searching by user.name+alias@domain.com should return user.name+alias@domain.com
 * - Searching by user.name+otherAlias@domain.com should not return user.name+alias@domain.com
 */
export const emailToFuzzySearchTerm = (email) => {
  const splittedEmail = email.split("@");
  const user = splittedEmail[0].replace(".", "");
  const domain = splittedEmail[1];
  const splittedUser = user.split("+");
  const searchTerm = {
    normalized: `${splittedUser[0]}@${domain}`,
  };
  if (splittedUser.length > 1) {
    searchTerm.alias = splittedUser.reduce(function(joined, current, index) {
      return index > 0 ? joined + current : '';
    }, '');
  }
  return searchTerm;
};
