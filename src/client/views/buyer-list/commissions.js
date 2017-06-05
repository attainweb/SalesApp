// Use reactive-dict to survive page navigation and hot code pushes.
const session = new ReactiveDict('commissions');

TemplateController('commissions', {

  private: {
    INITIAL_RESULTS_LIMIT: 20,
    RESULTS_LIMIT_INCREMENT: 20,
  },

  onCreated() {
    session.setDefault('resultsLimit', this.INITIAL_RESULTS_LIMIT);
    session.setDefault('commissionsTotal', 0);
    session.setDefault('resultsCount', 0);
    this.autorun(() => {
      this.sub = SubsManager.subscribe('commissions', session.get('resultsLimit'));
    });
    Meteor.call('commissions-counters', (error, counters) => {
      session.set('resultsCount', counters.results);
      session.set('commissionsTotal', counters.total);
    });
  },

  events: {
    // Increment the results limit to load more (aka: infinite scrolling)
    'loadingIndicatorBecameVisible'() {
      // Dont increase limit if the indicator is visible but nothing has been loaded yet.
      if (!this.sub.ready()) return;
      const currentLimit = session.get('resultsLimit');
      session.set('resultsLimit', currentLimit + this.RESULTS_LIMIT_INCREMENT);
    }
  },

  helpers: {

    total: function() {
      return session.get('commissionsTotal');
    },

    hasMoreToLoad() {
      return session.get('resultsLimit') < session.get('resultsCount');
    }

  }

});
