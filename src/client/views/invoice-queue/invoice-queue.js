import { SubsManager } from 'meteor/meteorhacks:subs-manager';

const session = new ReactiveDict('invoice_queue');
export const invoiceManagerSubsManager = new SubsManager({
  cacheLimit: 10
});

TemplateController('invoiceQueue', {
  state: {
    scrollTarget: '.infinite-scroll',
  },
  'private': {
    INITIAL_RESULTS_LIMIT: 30,
    RESULTS_LIMIT_INCREMENT: 20,
    STATE_FILTER_DEFAULT: {
      'admin': 'unpaidBankInvoices',
      'headInvoiceManager': 'unpaidBankInvoices',
      'bankManager': 'unpaidBankInvoices',
      'bankChecker': 'confirmBankAmount',
      'exporter': 'bundling'
    },
    BUNDLE_TICKETS_FILTERS: ['bundling', 'export'],
    SORT_FIELD_BY_STATE_FILTER: {
      'salePending': { by: 'createdAt', order: 1},
      'unpaidBankInvoices': { by: 'createdAt', order: 1},
      'confirmBankAmount': { by: 'createdAt', order: 1},
      'sentToBankChecker': { by: 'createdAt', order: 1},
      'preBundle': { by: 'createdAt', order: 1},
      'currentBundle': { by: 'createdAt', order: 1},
      'bundling': { by: 'bundledAt', order: 1},
      'export': { by: 'finalizedAt', order: 1},
      'expiredInvoices': { by: 'createdAt', order: 1},
      'btcOrders': { by: 'createdAt', order: 1},
      'invalidFundsReceived': { by: 'createdAt', order: 1},
      'receiptSent': { by: 'createdAt', order: 1},
      'forceReserve': { by: 'createdAt', order: 1}
    },
    STATE_FILTERS: [
      'salePending',
      'unpaidBankInvoices',
      'confirmBankAmount',
      'sentToBankChecker',
      'preBundle',
      'currentBundle',
      'bundling',
      'export',
      'expiredInvoices',
      'btcOrders',
      'invalidFundsReceived',
      'receiptSent',
      'forceReserve'
    ],
    SEARCH_FILTER_CATEGORY_DEFAULT: 'invoiceNumber',

    initInfiniteScrollParams() {
      this.session.setDefault('resultsLimit', this.INITIAL_RESULTS_LIMIT);
      this.session.setDefault('scrollPosition', 0);
    },

    initStateFiltersParams() {
      this.session.setDefault('currentStateFilter', this.STATE_FILTER_DEFAULT[Meteor.user().primaryRole()]);
      this.session.setDefault('stateFilterCounts', {
        'salePending': 0,
        'unpaidBankInvoices': 0,
        'confirmBankAmount': 0,
        'sentToBankChecker': 0,
        'preBundle': 0,
        'currentBundle': 0,
        'bundling': 0,
        'export': 0,
        'expiredInvoices': 0,
        'invalidFundsReceived': 0,
        'btcOrders': 0,
        'receiptSent': 0,
        'forceReserve': 0
      });
    },
    initSearchFilterParams() {
      this.session.setDefault('searchValue', '');
    },
    initTimeFilterParams() {
      this.session.setDefault('timeFilter', {});
    },
    initDefaultSessionParams() {
      this.initStateFiltersParams();
      this.initInfiniteScrollParams();
      this.initSearchFilterParams();
      this.initTimeFilterParams();
    },
    getSortFieldByCurrentStateFilter() {
      const currentState = this.session.get('currentStateFilter');
      return this.SORT_FIELD_BY_STATE_FILTER[currentState];
    },
    getQueryOptions() {
      let query = {};
      query.stateFilter = this.session.get('currentStateFilter');
      query.limit = this.session.get('resultsLimit');
      query.sortField = this.getSortFieldByCurrentStateFilter();
      query.searchFilter = {
        category: this.session.get('searchCategory').category,
        value: this.session.get('searchValue')
      };
      query.timeFilter = _.omit(this.session.get('timeFilter'), _.isNull);
      return query;
    },
    updateStateFiltersCounters(query) {
      const invoiceFilterCounters = ReactiveMethod.call('invoiceTicketsStateFilterCounters',
        this.getInvoiceTicketFilters(),
        query);
      // at the moment the query parameter doesn't matters in this case
      const bundleFilterCounters = ReactiveMethod.call('bundleTicketsStateFilterCounters',
        this.getBundleTicketFilters(),
        query);
      if (invoiceFilterCounters && bundleFilterCounters) {
        const stateFilterCounts = Object.assign(invoiceFilterCounters, bundleFilterCounters);
        this.session.set('stateFilterCounts', stateFilterCounts);
      }
    },
    getCurrentStateFilterTotalResult() {
      const currentStateFilter = this.session.get('currentStateFilter');
      return this.session.get('stateFilterCounts')[currentStateFilter];
    },
    isFilterForBundleTickets(filter) {
      if (_.contains(this.BUNDLE_TICKETS_FILTERS, filter)) {
        return true;
      }
      return false;
    },
    getInvoiceTicketFilters() {
      return lodash.pick(this.STATE_FILTERS, (filter) => {
        return !(this.isFilterForBundleTickets(filter));
      });
    },
    getBundleTicketFilters() {
      return lodash.pick(this.STATE_FILTERS, (filter) => {
        return this.isFilterForBundleTickets(filter);
      });
    },
    isActiveCurrentBundleFilter() {
      return this.session.get('currentStateFilter') === 'currentBundle';
    },
    getCountersByCollectionName(collectionName, stateFilter) {
      Meteor.call(collectionName, stateFilter, this.getQueryOptions(), function(err, res) {
        if (res) {
          const currFiltersCounts = session.get('stateFilterCounts');
          for (let filterName in res) {
            if (filterName) {
              currFiltersCounts[filterName] = res[filterName];
            }
          }
          session.set('stateFilterCounts', currFiltersCounts);
        }
      });
    }
  },
  onCreated() {
    // add translation to the labels! obs: .category attachs directly to invoiceTickets(->collection) fields!
    this.session = session;
    this.initDefaultSessionParams();
    // Reactively update main filter counters
    this.autorun(() => {
      this.state.searchBarCategories = [{
        label: i18n('invoiceManager.searchBarCategories.invoiceNumber'),
        category: 'invoiceNumber',
      }, {
        label: i18n('invoiceManager.searchBarCategories.buyerId'),
        category: 'buyerId',
      }, {
        label: i18n('invoiceManager.searchBarCategories.invoiceTransactionId'),
        category: 'invoiceTransactionId',
      }, {
        label: i18n('invoiceManager.searchBarCategories.payoutTransactionId'),
        category: 'payoutTransactionId',
      }, {
        label: i18n('invoiceManager.searchBarCategories.btcAddress'),
        category: 'btcAddress',
      }, {
        label: i18n('invoiceManager.searchBarCategories.bank'),
        category: 'bank',
      }];
      this.session.set('searchCategory', this.state.searchBarCategories[0]);
    });

    // Update subscriptions and counters on current query
    this.autorun(() => {
      const query = this.getQueryOptions();
      if (this.isFilterForBundleTickets(query.stateFilter)) {
        invoiceManagerSubsManager.subscribe('paymentExports', query.stateFilter, query);
      } else {
        invoiceManagerSubsManager.subscribe('invoiceTicketsWithBuyers', query.stateFilter, query);
      }
    });

    // this code goes separately because runs 2 times instead of 1 - see 'ReactiveMethod.call()'
    this.autorun(() => {
      const query = this.getQueryOptions();
      this.updateStateFiltersCounters(query);
    });
  },
  onRendered() {
    invoiceManagerSubsManager.reset();
    const scrollTarget = $(this.state.scrollTarget);
    scrollTarget.scrollTop(this.session.get('scrollPosition'));
    scrollTarget.on('scroll', () => {
      this.session.set('scrollPosition', scrollTarget.scrollTop());
    });
  },
  onDestroyed() {
    invoiceManagerSubsManager.clear();
  },
  events: {
    'loadingIndicatorBecameVisible'() {
      if (!invoiceManagerSubsManager.ready()) return;
      const currentLimit = this.session.get('resultsLimit');
      this.session.set('resultsLimit', currentLimit + this.RESULTS_LIMIT_INCREMENT);
    }
  },
  helpers: {
    title: function() {
      if (!Meteor.user()) return false;
      const role = Meteor.user().primaryRole();
      const roles = ['headInvoiceManager', 'bankManager', 'bankChecker', 'exporter'];
      if (_.contains(roles, role)) {
        return i18n('invoiceManagerRoles.roles.' + role);
      }
      return "YYYYY";
    },
    stateFilterCounts() {
      return this.session.get('stateFilterCounts');
    },
    onCurrentStateFilterChanged() {
      return (value) => {
        this.session.set('currentStateFilter', value);
        // this.setSortParamsAcordingCurrentStateFilter();
      };
    },
    currentStateFilter() {
      return this.session.get('currentStateFilter');
    },
    isActiveCurrentBundleFilter() {
      return this.isActiveCurrentBundleFilter();
    },
    queueItems() {
      const query = this.getQueryOptions();
      if (this.isFilterForBundleTickets(query.stateFilter)) {
        return PaymentExports.findByStateAndQuery(query.stateFilter, query);
      }
      return InvoiceTickets.findByStateAndQuery(query.stateFilter, query);
    },
    isInvoiceTicket() {
      const query = this.getQueryOptions();
      return !this.isFilterForBundleTickets(query.stateFilter);
    },
    hasMoreToLoad() {
      return this.session.get('resultsLimit') < this.getCurrentStateFilterTotalResult();
    },
    getDateTimeLanguage() {
      let locale = i18n.getLanguage();
      if (locale === 'en_US') {
        locale = 'en';
      }
      return locale;
    },
    onRangeChanged() {
      return (range) => {
        this.session.set('timeFilter', range);
      };
    },
    datesRange() {
      return this.session.get('timeFilter');
    },
    onSearchSubmitted() {
      return (category, value) => {
        this.session.set('searchCategory', category);
        this.session.set('searchValue', value);
      };
    },
    searchCategory() {
      return this.session.get('searchCategory');
    },
    searchValue() {
      return this.session.get('searchValue');
    },
    eventCallback() {
      return {
        onActionGetCounterByInvoiceStateCb: (stateFilter) => {
          this.getCountersByCollectionName('invoiceTicketsStateFilterCounters', stateFilter);
        },
        onActionGetCounterByBundleStateCb: (stateFilter) => {
          this.getCountersByCollectionName('bundleTicketsStateFilterCounters', stateFilter);
        }
      };
    }
  }
});
