TemplateController('mobileNav', {
  helpers: {
    isuser: function() {
      return Meteor.user() && !Meteor.loggingIn();
    },
    currentUser: function() {
      return Meteor.user();
    },
    navClasses: function() {
      const user = Meteor.user();
      if (!user) {
        return '';
      } else {
        if (user.isCompliance()) {
          return 'is-compliance';
        } else if (user.isCustomerService() || user.isInvestigator()) {
          return 'is-customer-service';
        } else if (user.isInvoiceManagerRole()) {
          return 'is-invoice-manager-role';
        } else {
          return '';
        }
      }
    }
  },
  events: {
    'click #logout-button': function(event) {
      event.preventDefault();
      Meteor.logout();
    },
    'click a': function() {
      $('#mobile').collapse('hide');
    }
  }
});
