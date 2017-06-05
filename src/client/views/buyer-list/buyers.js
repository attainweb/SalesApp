
// ======= INFINITY SCROLL CONFIG ======= //

const INITIAL_RESULTS_LIMIT = 20;
const RESULTS_LIMIT_INCREMENT = 20;
const SCROLL_DEBOUNCE = 200;
const SCROLL_TARGET = '#page-content-wrapper';
const LOAD_INDICATOR = '.load-more-results';
const TOTALS_POLL_INTERVAL = 1000 * 60; // poll every 60 seconds

// ======= STATE MANAGEMENT ======= //

const areAllOpen = new ReactiveVar(false);
const resultsLimit = new ReactiveVar(INITIAL_RESULTS_LIMIT);
const totalResults = new ReactiveVar(0);
const totalBuyersPoll = new RecurringMethodCall('buyers-count', TOTALS_POLL_INTERVAL);
const infinityScroller = new InfinityScroller(SCROLL_TARGET, LOAD_INDICATOR, SCROLL_DEBOUNCE);

// ======= LIFECYCLE ======== //

TemplateController('buyers', {
  helpers: {
    showAddBuyerButton() {
      // console.log("showAddBuyerButton", Roles.userIsInRole(Meteor.userId(), 'distributor'));
      if (Roles.userIsInRole(Meteor.userId(), 'distributor')) {
        return true;
      }
      return false;
    },
    buyersCount() {
      return totalResults.get();
    },
    areAllOpen() {
      return areAllOpen.get();
    },
    hasMoreToLoad: function() {
      return resultsLimit.get() < totalResults.get();
    }
  },
  events: {
    // Toggle all buyers panels
    'click .toggle-all'() {
      let panels = $('.buyers-list .panel-collapse');
      if (areAllOpen.get()) {
        // All panels are open -> close all
        panels.collapse('hide');
      } else {
        // At least one panel is closed -> open all
        panels.collapse('show');
      }
      // Toggle state
      areAllOpen.set(!areAllOpen.get());
    },
    // Ensure that we track if all panels are open
    'shown.bs.collapse .collapse, hidden.bs.collapse .collapse'() {
      let panels = $('.buyers-list .panel-collapse');
      let totalPanels = panels.length;
      let openPanels = panels.filter('.in').length;
      areAllOpen.set(totalPanels === openPanels);
    },
    // Enroll new one-time buyer
    'click .add-buyer'() {
      Meteor.call('genBuyerRef', {
        timetype: 'onetime',
        name: '',
        notes: '',
      }, function(error, refcode) {
        window.open(`/enroll/${refcode}`);
      });
    }
  },
  onCreated() {
    this.autorun(() => {
      SubsManager.subscribe('buyers', resultsLimit.get());
    });
  },
  onRendered() {
    totalBuyersPoll.start(function(error, count) { totalResults.set(count); });
    infinityScroller.start({
      onIndicatorVisible() {
        // indicator is visible -> load more results!
        resultsLimit.set(resultsLimit.get() + RESULTS_LIMIT_INCREMENT);
      }
    });
  },
  onDestroyed() {
    totalBuyersPoll.stop();
    infinityScroller.stop();
  }
});
