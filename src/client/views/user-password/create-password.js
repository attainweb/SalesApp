import {i18nAlert} from '/imports/client/i18n-alert';
import {checkPassword} from '/imports/lib/shared/check-password';

const btnWaiting = new ReactiveVar();

const I18N_ERROR_NAMESPACE = 'createPassword';

TemplateController('createPassword', {
  helpers: {
    btnWaiting: function() {
      return btnWaiting.get();
    },
    unknownref: function() {
      return !Session.get('srefvalid');
    },
    refcode: function() {
      return this.data.refcode;
    },
    actionIs: function(action) {
      return this.data.action === action;
    }
  },
  events: {
    'submit form': function(event, template) {
      event.preventDefault();
      btnWaiting.set(true);
      const form = event.target;

      const password = template.find('#password').value;
      const passwordConfirm = template.find('#password2').value;
      const refcode = template.data.refcode;

      const checkedPassword = checkPassword(password);
      if (checkedPassword === null) {
        bootbox.alert(i18n('alerts.passwordcheck'));
        btnWaiting.set(false);
        return;
      }
      if (password !== passwordConfirm) {
        bootbox.alert(i18n('alerts.passwordrepeat'));
        btnWaiting.set(false);
        return;
      }

      const goToLogin = function(error) {
        btnWaiting.set(false);
        if (error) {
          i18nAlert(error, I18N_ERROR_NAMESPACE);
        } else {
          Router.go('login');
        }
      };

      setTimeout(function() {
        if ($(form).hasClass('create')) {
          Meteor.call('signupUser', {
            refcode: refcode,
            password: password,
          }, goToLogin);
        } else {
          Meteor.call('updatePassword', {
            refcode: refcode,
            password: password,
          }, goToLogin);
        }
      }, 500);
    }
  }
});
