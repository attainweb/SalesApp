'use strict';

import Commissions from '/imports/lib/collections/commissions';
import { emailToFuzzySearchTerm } from '/imports/lib/shared/fuzzy-email-search';
import { residenceCountryFiltersArray } from '/imports/lib/shared/residence-country-filters';

Meteor.users.helpers({
  primaryEmail() {
    return this.emails[0] && this.emails[0].address;
  },
  lang() {
    return this.personalInformation && this.personalInformation.language || 'ja';
  },
  firstName() {
    return this.personalInformation.name;
  },
  surname() {
    return this.personalInformation.surname;
  },
  lastName() {
    return this.surname();
  },
  fullName() {
    if (!this.lastName()) {
      return this.firstName();
    }
    return this.firstName() + ' ' + this.lastName();
  },
  distlevel() {
    return this.personalInformation && this.personalInformation.distlevel;
  },
  tier() {
    return this.distlevel();
  },
  primaryRole() {
    if (_.contains(this.roles, 'admin'))                  return 'admin';
    if (_.contains(this.roles, 'customerService'))        return 'customerService';
    if (_.contains(this.roles, 'compliance'))             return 'compliance';
    if (_.contains(this.roles, 'chiefcompliance'))        return 'chiefcompliance';
    if (_.contains(this.roles, 'headCompliance'))         return 'headCompliance';
    if (_.contains(this.roles, 'invoiceManager'))         return 'invoiceManager';
    if (_.contains(this.roles, 'bankChecker'))            return 'bankChecker';
    if (_.contains(this.roles, 'bankManager'))            return 'bankManager';
    if (_.contains(this.roles, 'exporter'))               return 'exporter';
    if (_.contains(this.roles, 'headInvoiceManager'))     return 'headInvoiceManager';
    if (_.contains(this.roles, 'distributor'))            return 'distributor';
    if (_.contains(this.roles, 'buyer'))                  return 'buyer';
    if (_.contains(this.roles, 'sysop'))                  return 'sysop';
    if (_.contains(this.roles, 'investigator'))   return 'investigator';

    return undefined;
  },
  isDistributor() {
    return this.primaryRole() === 'distributor';
  },
  isAdmin() {
    return this.primaryRole() === 'admin';
  },
  isCustomerService() {
    return this.primaryRole() === 'customerService';
  },
  isInvestigator() {
    return this.primaryRole() === 'investigator';
  },
  isCompliance() {
    return _.contains(Meteor.users.getComplianceRoles(), this.primaryRole());
  },
  isComplianceOfficer() {
    return this.primaryRole() === 'compliance';
  },
  isReviewOfficer() {
    return this.isCustomerService() || this.isCompliance() || this.isInvestigator();
  },
  isHeadCompliance() {
    return this.primaryRole() === 'headCompliance';
  },
  isInvoiceManagerRole() {
    return _.contains(Meteor.users.getInvoiceManagerValidRoles(), this.primaryRole());
  },
  isOfficer() {
    return this.isCustomerService() || this.isCompliance() || this.isInvoiceManagerRole() || this.isInvestigator();
  },
  canAddWebChecks() {
    return this.isCompliance();
  },
  canAddCalls() {
    return this.isCompliance();
  },
  canAddCustomerServiceNotes() {
    return this.isCustomerService();
  },
  canAddComments() {
    return this.isReviewOfficer();
  },
  isApproved() {
    return this.personalInformation.status === 'APPROVED';
  },
  isNotApproved() {
    return ! this.isApproved();
  },
  isPending() {
    return this.personalInformation.status === 'PENDING';
  },
  isRejected() {
    return this.personalInformation.status === 'REJECTED';
  },
  getStatus() {
    return this.personalInformation.status;
  },
  distlevelIsLTE(distlevel) {
    return this.personalInformation.distlevel <= distlevel;
  },
  distlevelIsGT(distlevel) {
    return this.personalInformation.distlevel > distlevel;
  },
  isPartner() {
    return this.primaryRole() === 'distributor' && this.personalInformation.distlevel === 0;
  },
  isBuyer() {
    return this.primaryRole() === 'buyer';
  },
  isSysop() {
    return this.primaryRole() === 'sysop';
  },
  files(selector, options) {
    const selectorExtend = _.extend({}, {userId: this._id}, selector);
    return Files.find(selectorExtend, options);
  },
  docs(selector, options) {
    const selectorExtend = _.extend({}, {userId: this._id}, selector);
    return Iddocs.find(selectorExtend, options);
  },
  findDoc(selector, options) {
    const selectorExtend = _.extend({}, {userId: this._id}, selector);
    return Iddocs.findOne(selectorExtend, options);
  },
  pendingDocs(selector, options) {
    const selectorExtend = _.extend({}, {status: 'PENDING'}, selector);
    return this.docs(selectorExtend, options);
  },
  rejectedDocs(selector, options) {
    const selectorExtend = _.extend({}, {status: 'REJECTED'}, selector);
    return this.docs(selectorExtend, options);
  },
  approvedDocs(selector, options) {
    const selectorExtend = _.extend({}, {status: 'APPROVED'}, selector);
    return this.docs(selectorExtend, options);
  },
  docReason() {
    const rejectionReason = this.rejectionReason();
    if (rejectionReason) return rejectionReason;
    const doc = this.findDoc({ statusReason: { $exists: true } }, { sort: { updatedAt: -1 } });
    if (! doc) return false;
    return doc.statusReason;
  },
  latestPolicyUpdate(name) {
    const country = this.personalInformation.residenceCountry;
    const regionByCountry = Meteor.settings.public.regionalMappings[country];
    const settingsByRegion = Meteor.settings.public.regionalSettings[regionByCountry];
    if (!settingsByRegion) {
      const errorMessage = 'Settings are not defined for region ' + regionByCountry;
      throw new Meteor.Error('Undefined Settings', errorMessage);
    }
    let latestPolicyUpdate = settingsByRegion.latestPolicyUpdate;
    if (!latestPolicyUpdate) {
      const errorMessage = 'Latest Policy Update Date is not defined for region ' + regionByCountry;
      throw new Meteor.Error('Undefined Policy Update Date', errorMessage);
    }
    if (name === 'PRIVACY') return moment(latestPolicyUpdate.PRIVACY).toDate();

    latestPolicyUpdate = latestPolicyUpdate[this.primaryRole()];
    if (this.isBuyer())       latestPolicyUpdate = latestPolicyUpdate[name];
    if (this.isDistributor()) latestPolicyUpdate = latestPolicyUpdate[this.tier()];

    return moment(latestPolicyUpdate).toDate();
  },
  agreedToPolicyAt(name) {
    if (!this.personalInformation || !this.personalInformation.agreedToPolicyAt) return [];
    return this.personalInformation.agreedToPolicyAt[name] || [];
  },
  lastAgreedToPolicyAt(name) {
    let agreedToPolicyAt = this.agreedToPolicyAt(name);
    agreedToPolicyAt = lodash.sortBy(agreedToPolicyAt, function toDate(date) { return moment(date).toDate(); });
    return lodash.last(agreedToPolicyAt);
  },
  hasAgreedToPolicy(name) {
    return !!this.lastAgreedToPolicyAt(name);
  },
  hasAgreedToLatestPolicy(name) {
    if (name === 'RISK' && ! this.isBuyer()) return true;
    const lastAgreedToPolicyAt = this.lastAgreedToPolicyAt(name);
    if (!lastAgreedToPolicyAt) return false;
    return lastAgreedToPolicyAt > this.latestPolicyUpdate(name);
  },
  mustAgreeToPolicy(name) {
    if (name === 'RISK' && ! this.isBuyer()) return false;
    else return ! this.hasAgreedToLatestPolicy(name);
  },
  mustAgreeToPolicies() {
    return this.mustAgreeToPolicy('TOC')
           || this.mustAgreeToPolicy('PRIVACY')
           || this.mustAgreeToPolicy('RISK');
  },
  hasAgreedToLatestPolicies() {
    return ! this.mustAgreeToPolicies();
  },
  distributor() {
    return Meteor.users.findOne({ _id: this.personalInformation.originatorId });
  },
  originator() {
    return this.distributor();
  },
  originatorId() {
    return this.personalInformation.originatorId;
  },
  branchPartner() {
    if (this.isPartner()) {
      return Meteor.users.findOne(this._id);
    }
    const originator = this.originator();
    if (typeof originator !== 'undefined') {
      return originator.branchPartner();
    }
    return false;
  },
  isUnderReview() {
    return !! Meteor.users.findOne({ reviewing: this._id });
  },
  currentlyReviewing() {
    return Meteor.users.findOne({ _id: this.reviewing });
  },
  currentComplianceOfficerReviewerName() {
    const user = Meteor.users.findOne({
      reviewing: this._id,
      roles: { $nin: ['customerService', 'investigator'] }
    },
    { fields: { 'personalInformation.name': 1 } });
    if (!user) return '';
    return user.firstName();
  },
  hasWalletAddress() {
    return !!this.personalInformation.walletAddress;
  },
  needsWalletAddress() {
    return this.isDistributor() && !this.hasWalletAddress();
  },
  birthdateText() {
    const birthdate = this.personalInformation.birthdate;
    if (!birthdate) return '-';
    const format = i18n('format.date');
    // Use UTC mode of moment.js to ignore the local timezone
    // http://momentjs.com/docs/#/parsing/utc/
    return moment.utc(birthdate).format(format);
  },
  registrationDateText() {
    const registrationDate = this.personalInformation.registrationDate;
    if (!registrationDate) return '-';
    const format = i18n('format.date');
    return moment(registrationDate).format(format);
  },
  latestUsdRequested() {
    const ticket = InvoiceTickets.findOne({ buyerId: this._id }, {sort: {createdAt: -1}});
    return ticket && ticket.usdRequested();
  },
  invoiceTickets(selector, options) {
    const selectorExtend = _.extend({}, { buyerId: this._id }, selector);
    return InvoiceTickets.find(selectorExtend, options);
  },
  currentTicket() {
    const tickets = this.invoiceTickets(
      { state: { $in: ['inviteSent', 'inviteAcceptedBtc'] } },
      { sort: [['inviteApprovedAt', 'asc']] }
    );
    return tickets.fetch()[0];
  },
  earliestSentInviteTicket() {
    return InvoiceTickets.findOne(
      { buyerId: this._id, state: 'inviteSent' },
      { sort: [['inviteApprovedAt', 'asc']] }
    );
  },
  hasSentInviteTicket() {
    return !!this.earliestSentInviteTicket();
  },
  hasAnyStartedOrBtcAddressAssignedInvoiceTickets() {
    return !!InvoiceTickets.findOne({
      buyerId: this._id,
      state: { $in: ['started', 'btcAddressAssigned'] }
    });
  },
  isWaitingOnInvite() {
    return this.hasAnyStartedOrBtcAddressAssignedInvoiceTickets();
  },
  inviteTickets() {
    return this.invoiceTickets({
      state: {
        $in: [
          'started',
          'btcAddressAssigned',
          'inviteApproved',
          'inviteSent'
        ]
      }
    });
  },
  hasAnyInviteTickets() {
    const inviteTickets = this.inviteTickets();
    const numInviteTickets = inviteTickets.count();
    const hasAnyInviteTickets =  numInviteTickets > 0;
    return hasAnyInviteTickets;
  },
  hasAnyLimitApprovalRequiredTickets() {
    return this.invoiceTickets({
      state: { $in: ['limitApprovalRequired', 'limitApprovedBtc'] }
    }).count() > 0;
  },
  canRequest() {
    return this.isBuyer() && this.isApproved() && this.hasAgreedToLatestPolicies() &&
           !this.hasAnyInviteTickets() && !this.currentTicket() &&
           !this.hasAnyLimitApprovalRequiredTickets();
  },
  usdRequested() {
    const ticket = this.earliestSentInviteTicket();
    return ticket && ticket.usdRequested();
  },
  accountType() {
    return this.personalInformation.accountType;
  },
  isPersonalAccount() {
    return this.accountType() === 'personal';
  },
  isCompanyAccount() {
    return this.accountType() === 'company';
  },
  complianceLevel() {
    return this.personalInformation.complianceLevel;
  },
  applyingForComplianceLevel() {
    return this.personalInformation.applyingForComplianceLevel;
  },
  buyers(limit, options = {}) {
    let buyersSelector = null;
    // Distributors can only see their direct buyers, admins can see all
    if (this.isDistributor()) {
      buyersSelector = { "personalInformation.originatorId": this._id, roles: { $in: ['buyer'] } };
    } else if (this.isAdmin()) {
      buyersSelector = { roles: { $in: ['buyer'] } };
    }
    // Query options
    const opts = { sort: { createdAt: -1 } }; // newest first
    if (limit !== undefined) opts.limit = limit;

    if (buyersSelector !== null) {
      return Meteor.users.find(buyersSelector, Object.assign({}, opts, options));
    } else {
      return null;
    }
  },
  buyerTickets(buyerId) {
    return InvoiceTickets.find({ buyerId: buyerId }).fetch();
  },
  commissions(limit) {
    const userId = this._id;
    let options = { sort: { paidAt: -1 } };
    if (limit !== undefined) options.limit = limit;
    return Commissions.find({"distributorId": userId}, options).fetch();
  },
  isAllowedToReserveProduct() {
    return _.indexOf(Meteor.settings.public.residenceCountriesAllowedSale, this.personalInformation.residenceCountry) >= 0;
  }
});

Meteor.users.getComplianceRoles = function() {
  return [ 'compliance',
           'chiefcompliance',
           'headCompliance' ];
};

Meteor.users.getInvoiceManagerValidRoles = function() {
  return [ 'headInvoiceManager',
           'bankManager',
           'bankChecker',
           'exporter' ];
};

Meteor.users.getClientRoles = function() {
  return [ 'buyer', 'distributor' ];
};

Meteor.users.getFirstRole = function(userId) {
  const user = Meteor.users.findOne({_id: userId});
  if (!user) return undefined;

  return user.primaryRole();
};

/*
 * Allow
 */

Meteor.users.allow({
  insert: function() {
    // Disallow user inserts on the client by default.
    return false;
  },
  update: function() {
    // Disallow user updates on the client by default.
    return false;
  },
  remove: function() {
    // Disallow user removes on the client by default.
    return false;
  }
});

/*
 * Deny
 */

Meteor.users.deny({
  insert: function() {
    // Deny user inserts on the client by default.
    return true;
  },
  update: function() {
    // Deny user updates on the client by default.
    return true;
  },
  remove: function() {
    // Deny user removes on the client by default.
    return true;
  }

});

// TODO: Move this method to another module.
const getResidenceCountrySelector = function(query) {
  let countrySelector = {};

  if (!query.residenceCountryFilters) {
    return countrySelector;
  }

  countrySelector.$or = [];

  const residenceCountries = query.residenceCountryFilters.residenceCountry;

  // Add others countries if the option was selected
  if (query.residenceCountryFilters.residenceCountry.indexOf("others") !== -1) {
    countrySelector.$or.push({
      'personalInformation.residenceCountry': {
        $nin: residenceCountryFiltersArray
      }
    });
  }

  // Add selected countries to the query
  _.remove(residenceCountries, function(country) { // (!) _.remove returns an array with the removed elements
    return country === "others";
  });

  countrySelector.$or.push({
    'personalInformation.residenceCountry': {
      $in: residenceCountries
    }
  });

  return countrySelector;
};

/**
 * Returns a filtered cursor of Meteor.users that are pending review via compliance.
 * This means users with the roles "distributor" or "buyer" that have the status "pending".
 * @param {string} timeFilter Filters the query to users that have been updated within that time period.
 * For possible values see function definition. The default value is 'today'
 * @param {integer} limit Only return a maximum of records. Not used by default.
 * @returns {Collection.Cursor}
 */
Meteor.users.findByPendingForReview = function(query, userId, options = {}) {
  check(userId, String);
  check(query, {
    mainFilter: Match.Optional(String),
    limit: Match.Optional(Match.Integer),
    fineTuneFilters: Match.Optional({
      roles: [String],
      accountTypes: [String],
      tiers: [Match.OneOf(null, Match.Integer)]
    }),
    residenceCountryFilters: Match.Optional({
      residenceCountry: [String]
    }),
    timeFilter: Match.Optional({
      startDate: Match.Optional(Date),
      endDate: Match.Optional(Date)
    }),
    search: Match.Optional({ category: String, value: String })
  });
  let today = moment().startOf('day');
  let selector = {};

  if (!query.fineTuneFilters) {
    // Default fine tune filters -> otherwise the totals are not right!
    // TODO: there are some users in the DB that are not matching this criteria!
    query.fineTuneFilters = {
      roles: Meteor.users.getClientRoles(),
      accountTypes: ['personal', 'company'],
      tiers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    };
  }

  switch (query.mainFilter) {
    case 'recent':
      selector = { 'personalInformation.enteredComplianceAt': { $gte: today.subtract(7, 'day').toDate() }}; break;
    case 'unreviewed':
      selector = { 'personalInformation.hasBeenReviewed': false }; break;
    case 'watching':
      selector = { 'personalInformation.watchedBy': userId }; break;
    case 'fundsReceived':
      selector = { 'personalInformation.receivedSatoshisPreComplianceCheck': true }; break;
    case 'cco':
      selector = { 'personalInformation.delegatedToCco': true }; break;
    default:
  }

  if (query.search) {
    const regex = new RegExp(query.search.value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'i');
    switch (query.search.category) {
      case 'surname':
      case 'name':
        selector[`personalInformation.${query.search.category}`] = regex;
        break;
      case 'email':
        selector['emails.address'] = regex;
        break;
      default:
    }
  }

  if (query.mainFilter !== 'watching') {
    // set base selector for everybody except watching
    _.extend(selector, { 'personalInformation.status': 'PENDING' } );
  }

  // Optional date range filters
  if (query.timeFilter) {
    const startDate = query.timeFilter.startDate;
    const endDate = query.timeFilter.endDate;
    if (startDate || endDate) {
      const dateSelector = {};
      if (startDate) dateSelector.$gte = moment(startDate).toDate();
      if (endDate) dateSelector.$lt = moment(endDate).add(1, 'days').toDate();
      selector['personalInformation.enteredComplianceAt'] = dateSelector;
    }
  }

  _.extend(selector, {
    $and: [
      {'personalInformation.accountType': { $in: query.fineTuneFilters.accountTypes }},
      {$or: [
        {'personalInformation.applyingForComplianceLevel': {$in: query.fineTuneFilters.tiers}},
        {'personalInformation.applyingForComplianceLevel': {$exists: false}}
      ]},
      {roles: { $in: query.fineTuneFilters.roles }},
    ]
  });

  selector.$and.push(getResidenceCountrySelector(query));

  const opts = { sort: { updatedAt: 1 } };
  if (query.limit !== undefined) opts.limit = query.limit;

  // filter for delegatedToCco
  if (Roles.userIsInRole(userId, 'chiefcompliance')) {
    selector['personalInformation.delegatedToCco'] = true;
  }

  // filter for delegatedToHco
  if (Roles.userIsInRole(userId, 'headCompliance')) {
    selector['personalInformation.delegatedToHco'] = true;
    delete selector['personalInformation.status'];
  }

  return Meteor.users.find(selector, Object.assign({}, opts, options));
};

/**
 * Returns a filtered cursor of Meteor.users that are pending review via customer service.
 * This means users with the roles "distributor" or "buyer".
 * The cursor is limited to return one and only one document.
 * @param {string} searchValue String containing the search value to be used for exact matching in the
 * users collection
 * @returns {Collection.Cursor} Cursor containing one or zero documents matching the search.
 */
Meteor.users.findOnePendingForReviewByExactSearch = function(searchValue, options = {}) {
  const searchTerm = emailToFuzzySearchTerm(searchValue);
  const query = {
    "fuzzySearchEmails": {
      $elemMatch: searchTerm
    },
    "roles": {
      $in: Meteor.users.getClientRoles()
    }
  };
  return Meteor.users.find(query, Object.assign({}, options));
};

Meteor.users.findBySameBirthdate = function(buyerId, birthdate, options = {}) {
  check(birthdate, Date);
  return Meteor.users.find({"personalInformation.birthdate": birthdate, _id: {$ne: buyerId}}, options);
};


/**
 * Return the user for the matching email, ignoring case
 * @param options
 * @returns User
 */
Meteor.users.findByEmail = function(emailAddress, options = {}) {
  // Use regex to ignore case
  const escapedEmail = emailAddress.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  const emailRegEx = new RegExp(`^${escapedEmail}$`, 'i');
  return Meteor.users.findOne({"emails": {$elemMatch: {"address": {$regex: emailRegEx}}}}, options);
};
