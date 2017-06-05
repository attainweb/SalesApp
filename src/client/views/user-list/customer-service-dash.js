// Use reactive-dict to survive page navigation and hot code pushes.
const customerServiceDashContainer = new ReactiveDict('customer-service-search');

TemplateController('customerServiceDash', {
  onCreated() {
    this.container = customerServiceDashContainer;
    this.container.setDefault('searchValue', "");

    this.autorun(() => {
      SubsManager.subscribe('onePendingReview', this.container.get('searchValue'));
    });
  },
  events: {
    'keypress .form-control': function(event) {
      if (event.which === 13) {
        event.target.blur();
      }
    },
    'blur .form-control': function(event) {
      this.container.set('searchValue', event.target.value);
    },
  },
  helpers: {
    no_search_results() {
      return Meteor.users.findOnePendingForReviewByExactSearch(this.container.get('searchValue')).count() === 0;
    },
    search_results() {
      return Meteor.users.findOnePendingForReviewByExactSearch(this.container.get('searchValue'));
    },
    isEnableToReview() {
      return () => {
        const officer = Meteor.user();
        // the customer service doesn't care about the reviewUser state.
        return officer.isCustomerService() || officer.isInvestigator();
      };
    }
  },

});
