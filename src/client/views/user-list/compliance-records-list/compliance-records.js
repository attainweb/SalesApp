const session = new ReactiveDict('complianceRecords');

TemplateController('complianceRecords', {
  state: {
    scrollTarget: '#page-content-wrapper',
  },
  private: {
    INITIAL_RESULTS_LIMIT: 60,
    RESULTS_LIMIT_INCREMENT: 60,
  },
  onCreated() {
    this.session = session;
    this.session.setDefault('resultsLimit', this.INITIAL_RESULTS_LIMIT);
    this.session.setDefault('resultsCount', 0);
    this.session.setDefault('scrollPosition', 0);
    this.autorun(() => {
      const counts = ReactiveMethod.call('reviewRecordsResultsCount');
      if (counts) this.session.set('resultsCount', counts);
      this.sub = SubsManager.subscribe('reviewRecords', session.get('resultsLimit'));
    });
  },
  helpers: {
    complianceRecords() {
      return ReviewRecords.findWithLimit(this.session.get('resultsLimit'));
    },
    hasMoreToLoad() {
      return this.session.get('resultsLimit') < this.session.get('resultsCount');
    }
  },
  events: {
    // Increment the results limit to load more (aka: infinite scrolling)
    'loadingIndicatorBecameVisible'() {
      // Dont increase limit if the indicator is visible but nothing has been loaded yet.
      // Also make sure the limit is increased when the sub is ready by triggering it every 500ms with a timeout.
      if (!this.sub.ready()) {
        const self = this;
        setTimeout(function() {
          self.triggerEvent('loadingIndicatorBecameVisible');
        }, 500);
        return;
      }
      clearTimeout();

      const currentLimit = session.get('resultsLimit');
      session.set('resultsLimit', currentLimit + this.RESULTS_LIMIT_INCREMENT);
    }
  },
  onRendered() {
    this.session.set('resultsLimit', this.INITIAL_RESULTS_LIMIT);
    const scrollTarget = $(this.state.scrollTarget);
    scrollTarget.scrollTop(this.session.get('scrollPosition'));
    scrollTarget.on('scroll', () => {
      this.session.set('scrollPosition', scrollTarget.scrollTop());
    });
  }
});
