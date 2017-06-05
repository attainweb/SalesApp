const session = new ReactiveDict('investigator-results');
import { SubsManager } from 'meteor/meteorhacks:subs-manager';

const UnderInvestigationSubs = new SubsManager({
  cacheLimit: 10
});

TemplateController('investigatorDash', {
  private: {
    INITIAL_RESULTS_LIMIT: 30,
    RESULTS_LIMIT_INCREMENT: 20,
    MAIN_FILTER_DEFAULT: {
      investigator: 'all',
    },

    allowedSearchFields: new SimpleSchema({
      externalInfo: {
        type: new SimpleSchema({
          refcode: {
            label: function() { return i18n('investigator.filters.refcode'); },
            type: String,
            optional: true
          }
        })
      },
      personalInformation: {
        type: new SimpleSchema({
          name: {
            label: function() { return i18n('investigator.filters.name'); },
            type: String,
            optional: true
          },
          surname: {
            label: function() { return i18n('investigator.filters.surname'); },
            type: String,
            optional: true
          },
          companyName: {
            label: function() { return i18n('investigator.filters.companyName'); },
            type: String,
            optional: true
          },
          registrationDate: {
            label: function() { return i18n('investigator.filters.registrationDate'); },
            type: Date,
            optional: true
          },
          phone: {
            label: function() { return i18n('investigator.filters.phone'); },
            type: String,
            optional: true
          },
          birthdate: {
            label: function() { return i18n('investigator.filters.birthdate'); },
            type: Date,
            optional: true
          }
        })
      },
      fuzzySearchEmails: {
        type: new SimpleSchema({
          normalized: {
            label: function() { return i18n('investigator.filters.email'); },
            type: String,
            regEx: SimpleSchema.RegEx.Email,
            optional: true
          }
        })
      }
    }),

    getCursor(mainFilter, limit) {
      if (mainFilter === 'underInvestigation') {
        return Meteor.users.find({ 'personalInformation.isUnderInvestigation': true}, { limit: limit});
      } else {
        return RankedUsers.find({}, { limit: limit, sort: {number: -1} });
      }
    },
    getCursorCount(mainFilter) {
      if (mainFilter === 'underInvestigation') {
        return Meteor.users.find({ 'personalInformation.isUnderInvestigation': true}).count();
      } else {
        return RankedUsers.find({}).count();
      }

    },
    getQueryOptions() {
      const query = this.session.get('searchQuery');
      const searchquery = {};
      // flatten object
      Object.keys(query).forEach((mainkey) => {
        _.each(query[mainkey], (value, key) => {
          if (value instanceof Object && !(value instanceof Date) ) {
            _.each(value, (valuel1, keyl1) => {
              searchquery[`${mainkey}.${key}.${keyl1}`] = valuel1;
            });
          } else {
            searchquery[`${mainkey}.${key}`] = value;
          }
        });
      });

      const search = {'search': searchquery };
      const opts = search;
      // forced options
      opts.search.roles = ['distributor'];
      return opts;
    },
  },
  state: {
    searchValues: {},
    scrollTarget: '#page-content-wrapper',
    searchQuery: {},
  },
  helpers: {
    searchQueryDoc(){
      return session.get('searchQuery') || {};
    },
    mainFilter() {
      return this.session.get('mainFilter');
    },
    isUnderInvestigation() {
      return this.session.get('mainFilter') === 'underInvestigation';
    },
    onMainFilterChanged() {
      return (value) => {
        this.session.set('mainFilter', value);
        this.session.set('resultsLimit', this.INITIAL_RESULTS_LIMIT);
      };
    },
    mainFilterCounts() {
      return {'underInvestigation': this.getCursorCount('underInvestigation'), 'all': this.getCursorCount('all') };
    },
    queryReady() {
      return this.session.get('queryReady');
    },
    totalSearchResults() {
      return this.getCursorCount(this.session.get('mainFilter'));
    },
    usersRecords() {
      return this.getCursor(this.session.get('mainFilter'), this.session.get('resultsLimit'));
    },
    foundUsers() {
      const count = this.getCursorCount(this.session.get('mainFilter'));
      return  count > 0;
    },
    isEnableToReview() {
      return () => {
        const officer = Meteor.user();
        // the customer service doesn't care about the reviewUser state.
        return officer.isInvestigator();
      };
    },
    allowedSearchFields() {
      return this.allowedSearchFields;
    },
    hasMoreToLoad() {
      const totalRecords = this.getCursorCount(this.session.get('mainFilter'));
      return this.session.get('resultsLimit') < totalRecords;
    },
    searchfields() {
      const schemaObj = this.allowedSearchFields.schema();
      const schemaSearchArray = [];
      for (let name in schemaObj) {
        let obj = schemaObj[name];
        obj.name = name;
        if (obj.type.name !== "Object") schemaSearchArray.push(obj);
      }
      return schemaSearchArray;
    }
  },
  events: {
    'click button.search-users'() {

      if ( this.session.get("allowSearch") ) {
        this.session.set("allowSearch", false);
        this.session.set("queryReady", false);
        Meteor.call( "investigatorQuery", this.getQueryOptions(), ( error, data ) => {
          RankedUsers.remove({});
          if ( error ) {
          } else {       
            data.forEach(function(rUser) {
              RankedUsers.insert(rUser);
            });
          }
          this.session.set("queryReady", true);
        });
      }
    },
    loadingIndicatorBecameVisible() {
      // Avoid increasing the limit when the indicator is visible but nothing
      // has been loaded yet.
      if (!this.sub.ready()) return;
      const currentLimit = this.session.get('resultsLimit');
      this.session.set('resultsLimit', currentLimit + this.RESULTS_LIMIT_INCREMENT);
    }
  },
  onCreated() {
    this.session = session;
    this.session.setDefault('resultsLimit', this.INITIAL_RESULTS_LIMIT);
    this.session.setDefault('scrollPosition', 0);
    this.session.setDefault('mainFilter', this.MAIN_FILTER_DEFAULT[Meteor.user().primaryRole()]);
    this.session.setDefault('searchHash', "");
    this.session.setDefault('searchQuery', {});
    this.session.setDefault('queryReady', true);
  },
  onRendered() {
    const scrollTarget = $(this.state.scrollTarget);
    scrollTarget.scrollTop(this.session.get('scrollPosition'));
    scrollTarget.on('scroll', () => {
      this.session.set('scrollPosition', scrollTarget.scrollTop());
    });
    this.sub = UnderInvestigationSubs.subscribe('investigatorUnderInvestigation');
    this.session.set("allowSearch", true);
  }

});

AutoForm.hooks({
  'investigator-search': {
    formToDoc: function(doc) {
      const hash = CryptoJS.MD5(JSON.stringify(doc)).toString();
      if (hash !== session.get('searchHash')) {
        session.set('searchHash', hash);
        session.set('searchQuery', doc);
        session.set("allowSearch", true);
      }
      return doc;
    }
  }
});

