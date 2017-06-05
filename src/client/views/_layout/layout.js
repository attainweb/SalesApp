TemplateController('layout', {
  helpers: {
    hasNoSidebar() {
      const user = Meteor.user();
      if (user) {
        return user.isOfficer();
      }
      return false;
    },
    currentUser() {
      return Meteor.user();
    },
    wrapperClass() {
      const user = Meteor.user();
      if (user && user.isOfficer()) return 'full-width';
      return '';
    }
  },
  events: {
    'click #logout-button': function(event) {
      event.preventDefault();
      Meteor.logout();
      Router.go('/');
    }
  }
});
