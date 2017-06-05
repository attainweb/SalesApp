import { residenceCountryFiltersArray } from '/imports/lib/shared/residence-country-filters';

// Use reactive-dict to survive page navigation and hot code pushes.
const session = new ReactiveDict('compliance-queue');

TemplateController('queue', {

  state: {
    scrollTarget: '#page-content-wrapper',
  },

  'private': {
    INITIAL_RESULTS_LIMIT: 30,
    RESULTS_LIMIT_INCREMENT: 20,
    MAIN_FILTER_DEFAULT: {
      compliance: 'all',
      chiefcompliance: 'all',
      headCompliance: 'hco'
    },
    MULTIPLE_CHOICE_FILTERS: {
      buyer: true, distributor: true, company: true, personal: true,
      a: true, b: true, c: true, 'd+': true
    },
    getDefaultResidenceCountryChoiceFilters() {
      const filtersObject = { others: true };
      residenceCountryFiltersArray.forEach(function(elem) {
        filtersObject[elem] = true;
      });
      return filtersObject;
    },
    getQueryOptions() {
      if ( Roles.userIsInRole(Meteor.userId(), 'headCompliance') ) {
        return { limit: this.session.get('resultsLimit') };
      }

      const query = {
        fineTuneFilters: { roles: [], accountTypes: [], tiers: [] },
        residenceCountryFilters: { residenceCountry: [] },
        timeFilter: _.omit(this.session.get('timeFilter'), _.isNull), // clean nulls
        mainFilter: this.session.get('mainFilter'),
        limit: this.session.get('resultsLimit')
      };
      if (this.session.get('searchValue') !== '') {
        query.search = {
          category: this.session.get('searchCategory').category,
          value: this.session.get('searchValue')
        };
      }
      const fineTuneFilters = this.session.get('fineTuneFilters');

      // Filter by user roles
      _.each(_.pick(fineTuneFilters, 'buyer', 'distributor'), (value, type) => {
        if (value) query.fineTuneFilters.roles.push(type);
      });
      // Filter by user account type
      _.each(_.pick(fineTuneFilters, 'personal', 'company'), (value, type) => {
        if (value) query.fineTuneFilters.accountTypes.push(type);
      });
      // Filter by user tier
      const tiers = [];
      _.each(_.pick(fineTuneFilters, 'a', 'b', 'c', 'd+'), (value, type) => {
        if (value) {
          switch (type) {
            case 'a': tiers.push(1); break;
            case 'b': tiers.push(2); break;
            case 'c': tiers.push(3); break;
            case 'd+': tiers.push(4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14); break;
            default:
          }
        }
      });
      query.fineTuneFilters.tiers = tiers;

      // Filter By residence country
      const residenceCountryFilters = this.session.get('residenceCountryFilters');
      _.each(_.pick(residenceCountryFilters, residenceCountryFiltersArray, 'others'), (value, type) => {
        if (value) query.residenceCountryFilters.residenceCountry.push(type);
      });

      return query;
    }
  },
  onCreated() {
    this.session = session;
    this.session.setDefault('timeFilter', {});
    this.session.setDefault('resultsLimit', this.INITIAL_RESULTS_LIMIT);
    this.session.setDefault('fineTuneFilters', this.MULTIPLE_CHOICE_FILTERS);
    this.session.setDefault('residenceCountryFilters', this.getDefaultResidenceCountryChoiceFilters());
    this.session.setDefault('mainFilter', this.MAIN_FILTER_DEFAULT[Meteor.user().primaryRole()]);
    this.session.setDefault('scrollPosition', 0);
    this.session.setDefault('searchValue', '');
    this.session.setDefault('mainFilterCounts', {
      'recent': 0, 'unreviewed': 0, 'fundsReceived': 0, 'watching': 0, 'cco': 0, 'all': 0
    });
    // Update subscriptions and counters on state changes
    this.autorun(() => {
      const options = this.getQueryOptions();
      this.sub = SubsManager.subscribe('pendingReview', options);
      const searchResultsCount = ReactiveMethod.call('complianceQueueResultsCount', options);
      if (_.isNumber(searchResultsCount)) {
        this.session.set('searchResultsCount', searchResultsCount);
      }
    });

    this.autorun(() =>{
      this.state.searchBarCategories = [
        {label: i18n('queueDoc.searchBarCategory.surname'), category: 'surname'},
        {label: i18n('queueDoc.searchBarCategory.name'), category: 'name'},
        {label: i18n('queueDoc.searchBarCategory.email'), category: 'email'},
      ];
      this.session.set('searchCategory', this.state.searchBarCategories[0]);
    });

    // Reactively update main filter counters
    this.autorun(() => {
      const user = Meteor.user();
      if (user.isCompliance() && !user.isHeadCompliance()) {
        // this get is necessary to reactively watch this var and refresh the counter on change
        this.session.get('mainFilter');
        const filters = ['recent', 'unreviewed', 'fundsReceived', 'watching', 'cco', 'all'];
        const counts = ReactiveMethod.call('complianceMainFilterCounters', filters, this.getQueryOptions());
        if (counts) this.session.set('mainFilterCounts', counts);
      }
    });
  },
  onRendered() {
    // Scroll to the same position that the reviewer was before going into
    // the detail view by clicking on "review" button on a user
    const scrollTarget = $(this.state.scrollTarget);
    scrollTarget.scrollTop(this.session.get('scrollPosition'));
    scrollTarget.on('scroll', () => {
      this.session.set('scrollPosition', scrollTarget.scrollTop());
    });
  },
  events: {
    // The loading indicator becamse visible -> increment the results limit
    // to load more (aka: infinite scrolling)
    'loadingIndicatorBecameVisible'() {
      // Avoid increasing the limit when the indicator is visible but nothing
      // has been loaded yet.
      if (!this.sub.ready()) return;
      const currentLimit = this.session.get('resultsLimit');
      this.session.set('resultsLimit', currentLimit + this.RESULTS_LIMIT_INCREMENT);
    }
  },
  helpers: {
    title: function() {
      const role = Meteor.user().primaryRole();
      let title = '';
      switch (role) {
        case 'compliance':
          title = i18n('approval.title');
          break;
        case 'chiefcompliance':
          title = i18n('approval.chiefComplianceTitle');
          break;
        case 'headCompliance':
          title = i18n('approval.headComplianceTitle');
          break;
        default:
          title = "YYYYY";
      }
      return title;
    },
    showMainFilter() {
      const user = Meteor.user();
      return user.isCompliance() && !user.isHeadCompliance();
    },
    isComplianceOfficer() {
      const user = Meteor.user();
      return user.isComplianceOfficer();
    },
    flash() {
      return Session.get('flash');
    },
    requesting() {
      return !this.sub.ready();
    },
    compliance_queue() {
      if (!Meteor.userId()) return false; // Bad fix for now, something is wrong with the way logout works, it refreshes the Meteor.users sub causing this helper to rerun
      return Meteor.users.findByPendingForReview(this.getQueryOptions(), Meteor.userId());
    },
    hasMoreToLoad() {
      return this.session.get('resultsLimit') < this.session.get('searchResultsCount');
    },
    fineTuneFilters() {
      return this.session.get('fineTuneFilters');
    },
    onFineTuneFiltersChanged() {
      return (selection) => {
        this.session.set('fineTuneFilters', selection);
      };
    },
    residenceCountryFilters() {
      return this.session.get('residenceCountryFilters');
    },
    onResidenceCountryFiltersChanged() {
      return (selection) => {
        this.session.set('residenceCountryFilters', selection);
      };
    },
    mainFilter() {
      return this.session.get('mainFilter');
    },
    mainFilterCounts() {
      return this.session.get('mainFilterCounts');
    },
    onMainFilterChanged() {
      return (value) => {
        this.session.set('mainFilter', value);
      };
    },
    getDateTimeLanguage() {
      let locale = i18n.getLanguage();
      return locale;
    },
    onRangeChanged() {
      const self = this;
      return (range) => {
        self.session.set('timeFilter', range);
      };
    },
    datesRange() {
      return this.session.get('timeFilter');
    },
    totalSearchResults() {
      return this.session.get('searchResultsCount');
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
    isEnableToReview() {
      return (reviewUser) => {
        const officer = Meteor.user();
        if (officer.isHeadCompliance()) {
          return true;
        } else {
          return officer.isCompliance() && reviewUser.isPending();
        }
      };
    },
    userSummaryOptions: function() {
      const self = this;
      return {
        onWatchChangeCb: () => {
          Meteor.call('complianceMainFilterCounters', ['watching'], self.getQueryOptions(), function(err, res) {
            if (res) {
              const currFiltersCounts = session.get('mainFilterCounts');
              for (let filterName in res) {
                if (filterName) {
                  currFiltersCounts[filterName] = res[filterName];
                }
              }
              session.set('mainFilterCounts', currFiltersCounts);
            }
          });
        }
      };
    }
  }
});
