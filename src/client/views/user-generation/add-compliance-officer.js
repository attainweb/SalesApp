import {i18nAlert} from '/imports/client/i18n-alert';

const I18N_ERROR_NAMESPACE = 'addComplianceOfficer';
const flash = new ReactiveVar();
const btnWaiting = new ReactiveVar();
TemplateController('addComplianceOfficer', {

  helpers: {
    flash: function() {
      return flash.get();
    },
    notifAttrs: function() {
      return flash.get() ? '' : {style: 'visibility: hidden;'};
    },
    btnWaiting: function() {
      return btnWaiting.get();
    }
  },
  events: {
    'submit #add-compliance-officer-form': function(event, template) {
      event.preventDefault();
      btnWaiting.set(true);

      const email = template.find('#admin-email').value;
      const name = template.find('#admin-name').value;
      const password = template.find('#admin-password').value;

      console.log("create user. email " + email + " name: " + name);

      const user = {
        email: email,
        password: password,
        personalInformation: {
          name: name,
          role: 'compliance',
        },
      };

      // Post the user to the server for creation
      setTimeout(function() {
        Meteor.call('addComplianceAdmin', user, function(err) {
          btnWaiting.set(false);
          if (err) {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          } else {
            flash.set('messages.adminAdded');
            console.log('addComplianceAdmin success');
            template.find('#admin-email').value = '';
            template.find('#admin-name').value = '';
            template.find('#admin-password').value = '';
          }
        });
      }, 500);
    }
  }
});
