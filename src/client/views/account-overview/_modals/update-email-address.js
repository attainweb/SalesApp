'use strict';

import { i18nAlert } from '/imports/client/i18n-alert';

const applyModal = function() {
  $('#update-email-address').modal('hide');
};

TemplateController('updateEmailAddress', {
  state: {
    notice: ''
  },
  helpers: {
    notice: function() {
      return this.state.notice;
    }
  },
  events: {
    'click .confirm-change': function(e, t) {
      const I18N_ERROR_NAMESPACE = 'modals.accountInfo.changeEmail';
      const address = t.find('#email-input').value;
      Meteor.call('changeEmailAddressToCurrentUser', address, function(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
        } else {
          bootbox.alert(i18n(I18N_ERROR_NAMESPACE + '.successMessage'));
          $('#update-email-address').modal('hide');
        }
      });
    }
  }
});
