import { emailToFuzzySearchTerm } from '/imports/lib/shared/fuzzy-email-search';

/**
 * Returns a filtered cursor of Meteor.users that match the search fields.
 * @param {string} timeFilter Filters the query to users that have been updated within that time period.
 * For possible values see function definition. The default value is 'today'
 * @param {integer} limit Only return a maximum of records. Not used by default.
 * @returns {Collection.Cursor}
 */
findBySearchFields = function(sub, userId, query) {
  check(userId, String);
  check(query, {
    options: Match.Optional({
      limit: Match.Optional(Match.Integer)
    }),
    search: Match.Optional({
      'personalInformation.surname': Match.Optional(String),
      'personalInformation.name': Match.Optional(String),
      'personalInformation.phone': Match.Optional(String),
      'personalInformation.companyName': Match.Optional(String),
      'personalInformation.birthdate': Match.Optional(Date),
      'personalInformation.registrationDate': Match.Optional(Date),
      roles: Match.Optional([String]),
      'externalInfo.refcode': Match.Optional(String),
      'fuzzySearchEmails.normalized': Match.Optional(String),
      'fuzzySearchEmails.alias': Match.Optional(String)
    })
  });
  const matchConditions = [];
  const orConditions = [];
  const search = query.search;
  const aggregateQuery = [];

  if (search) {
    const setSel = (key, weight = 100) => {
      if (search[key]) {
        const val = {};
        if (search[key] instanceof Date) {
          val[key] = search[key];
        } else {
          val[key] = search[key];
        }
        orConditions.push(val);
        matchConditions.push({
          "$cond": {
            "if": {
              "$eq": ["$" + key, search[key]]
            },
            "then": weight,
            "else": 0
          }
        });
      }
    };

    if (search['externalInfo.refcode']) {
      const ref = Refs.findOne({refcode: search['externalInfo.refcode'], reftype: { $in: ['buyer', 'distributor'] } });
      if (ref) {
        Object.assign(search, { '_id': ref.originatorId });
        // Add extra weight so that this wins over other matches
        setSel('_id', 110);
      }
    }

    const emailSearch = search['fuzzySearchEmails.normalized'];
    if (emailSearch) {
      const emailFuzzySearchTerm = emailToFuzzySearchTerm(emailSearch);
      search['fuzzySearchEmails.normalized'] = emailFuzzySearchTerm.normalized;
      if (emailFuzzySearchTerm.alias) {
        search['fuzzySearchEmails.alias'] = emailFuzzySearchTerm.alias;
        // Alias just adds 1 to make it appear first, even if it's just one match
        setSel('fuzzySearchEmails.alias', 1);
      }

      // This is because element match doesn't work with aggregations
      aggregateQuery.push({
        "$unwind": "$fuzzySearchEmails"
      });

      setSel('fuzzySearchEmails.normalized', 109);
    }

    setSel('personalInformation.surname', 103);
    setSel('personalInformation.name', 101);
    setSel('personalInformation.phone', 104);
    setSel('personalInformation.birthdate', 102);
    setSel('personalInformation.companyName', 105);
    setSel('personalInformation.registrationDate', 102);

    setSel('personalInformation.postaddress.city', 100);
    setSel('personalInformation.postaddress.state', 100);
    setSel('personalInformation.postaddress.zip', 100);
  }

  let match = {
    $match: {
      roles: "distributor"
    }
  };
  if (orConditions.length > 0) {
    match.$match.$or = orConditions;
  }
  aggregateQuery.push(match);

  const projectBaseFields = {
    "personalInformation.name": 1,
    "personalInformation.status": 1,
    "personalInformation.surname": 1,
    "personalInformation.accountType": 1,
    "personalInformation.complianceLevel": 1,
    "personalInformation.applyingForComplianceLevel": 1,
    "personalInformation.walletAddress": 1,
    "personalInformation.residenceCountry": 1,
    "personalInformation.hasBeenReviewed": 1,
    emails: 1,
    roles: 1
  };

  aggregateQuery.push({
    $project: Object.assign({ matches: matchConditions }, projectBaseFields)
  });
  aggregateQuery.push({
    $project: Object.assign({ number: {$sum: "$matches"}}, projectBaseFields)
  });

  // OPTIONS: https://github.com/JcBernack/meteor-reactive-aggregate#usage
  if (query.options && query.options.limit) {
    aggregateQuery.push({
      $limit: query.options.limit
    });
  }

  aggregateQuery.push({
    $sort: {
      number: -1,
      updatedAt: -1
    }
  });
  aggregateQuery.push(
    { $match: { number: { $gte: 100 } } }
  );

  return Meteor.users.aggregate(aggregateQuery);
};



Meteor.methods({
  'investigatorQuery': function(query) {
      const auxQuery = query;
      delete auxQuery.search.roles;
      if (!Object.keys(auxQuery.search).length) {
        return [];
      }
      if (Roles.userIsInRole(this.userId, ['investigator'])) {
        const fixedQuery = Object.assign({search: {}}, query);
        // set default or override user settings
        // these need to be in sync with the counter -> distributors-count
        fixedQuery.search.roles = ['distributor'];
        return findBySearchFields(this, this.userId, fixedQuery);
      }
  }
});
