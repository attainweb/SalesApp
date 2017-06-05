'use strict';

TemplateController('accountInfoPanel', {
  helpers: {
    getUserRole: function() {
      return Meteor.user().roles[0];
    },
    getUserResidenceCountry: function() {
      return Meteor.user().personalInformation.residenceCountry;
    },
    getUserDistLevel: function() {
      return Meteor.user().personalInformation.distlevel;
    },
    canEditEmail: function() {
      return Meteor.user().isBuyer();
    },
    showStatus() {
      const userStatus = this.data.personalInformation.status;
      switch (userStatus) {
        case 'APPROVED':
          return i18n('personalInformation.status.approved');
        case 'PENDING':
          return i18n('personalInformation.status.pending');
        case 'REJECTED':
          return i18n('personalInformation.status.rejected');
        default:
          return i18n('personalInformation.status.invalid');
      }
    },
  },
  events: {
    'click .tabs a'(event) {
      event.preventDefault();
      $(event.currentTarget).tab('show');
    },
  }
});
