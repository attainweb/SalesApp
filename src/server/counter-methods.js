import Commissions from '/imports/lib/collections/commissions';

const getStateFilterCounters = function(filters, countQueryBy) {
  const stateFilterCounts = {};
  _.each(filters, (filter) => {
    stateFilterCounts[filter] = countQueryBy(filter);
  });
  return stateFilterCounts;
};

Meteor.methods({

  'buyers-count'() {
    this.unblock();
    if (!Roles.userIsInRole(this.userId, ['distributor', 'admin'])) return null;
    let query = Meteor.users.findOne(this.userId).buyers();
    return query === null ? 0 : query.count();
  },

  'commissions-counters'() {
    if (!this.userId) return null;
    this.unblock();
    if (!Roles.userIsInRole(this.userId, ['distributor', 'admin'])) return null;

    const total = Commissions.aggregate([
      { $match: { distributorId: this.userId } },
      { $group: { _id: "$distributorId", total: { $sum: "$payoutAmount" } }}
    ]);

    return {
      results: InvoiceTickets.find({ "commissions.distributorId": this.userId }).count(),
      total: (total.length === 0) ? 0 : total[0].total
    };
  },

  invoiceTicketsStateFilterCounters(filters, query) {
    this.unblock();
    if (Roles.userIsInRole(this.userId, Meteor.users.getInvoiceManagerValidRoles())) {
      const invoiceTicketCountQueryBy = (filter) => {
        return InvoiceTickets.findByStateAndQuery(filter, query).count();
      };
      return getStateFilterCounters(filters, invoiceTicketCountQueryBy);
    }
    return undefined;
  },

  bundleTicketsStateFilterCounters(filters, query) {
    this.unblock();
    if (Roles.userIsInRole(this.userId, Meteor.users.getInvoiceManagerValidRoles())) {
      const bundleTicketCountQueryBy = (filter) => {
        return PaymentExports.findByStateAndQuery(filter, query).count();
      };
      return getStateFilterCounters(filters, bundleTicketCountQueryBy);
    }
    return undefined;
  },

  complianceMainFilterCounters(filters, query) {
    this.unblock();
    if (!Roles.userIsInRole(this.userId, ['compliance', 'chiefcompliance'])) return undefined;
    const mainFilterCounts = {};
    const myFilters = _.uniq(_.intersection(filters, ['recent', 'unreviewed', 'fundsReceived', 'watching', 'cco', 'all']));
    _.each(myFilters, (filter) => {
      mainFilterCounts[filter] = Meteor.users.findByPendingForReview(Object.assign({}, query, {
        mainFilter: filter
      }), this.userId).count();
    });
    return mainFilterCounts;
  },

  complianceQueueResultsCount(options) {
    this.unblock();
    if (!Roles.userIsInRole(this.userId, Meteor.users.getComplianceRoles())) return null;
    delete options.limit;
    // Params are checked in findByPendingForReview
    return Meteor.users.findByPendingForReview(options, this.userId).count();
  },

  reviewRecordsResultsCount() {
    this.unblock();
    if (!Roles.userIsInRole(this.userId, ['compliance', 'chiefcompliance'])) return null;
    return ReviewRecords.find({}).count();
  },

});
