TemplateController('viewlinks', {
  helpers: {
    colClass: function() {
      if (Meteor.user().personalInformation.distlevel === 3) {
        return 'col-sm-12';
      } else {
        return 'col-sm-6';
      }
    },
    panelClass: function() {
      if (Meteor.user().personalInformation.distlevel === 3) {
        return 'narrowed-7';
      }
      return '';
    }
  }
});