import { i18nAlert } from '/imports/client/i18n-alert';

const I18N_ERROR_NAMESPACE = 'addCustomerService';

TemplateController('addCustomerServiceOfficer', {
  state: {
    flash: '',
    btnWaiting: false,
  },

  helpers: {
    flash: function() {
      return this.state.flash;
    },
    notifAttrs: function() {
      return this.state.flash ? '' : { style: 'visibility: hidden;' };
    },
    btnWaiting: function() {
      return this.state.btnWaiting;
    },
  },

  events: {
    'submit #add-customer-service-officer-form'(event) {
      event.preventDefault();

      this.state.btnWaiting = true;

      const email = this.find('#customer-service-officer-email').value;
      const name = this.find('#customer-service-officer-name').value;
      const password = this.find('#customer-service-officer-password').value;

      const user = {
        email: email,
        password: password,
        personalInformation: {
          name: name,
          role: 'customerService',
        },
      };

      // Post the user to the server for creation
      setTimeout(function(template) {
        Meteor.call('addCustomerServiceOfficer', user, function(err) {
          template.state.btnWaiting = false;
          if (err) {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          } else {
            template.state.flash = 'messages.customerServiceOfficerAdded';
            template.find('#customer-service-officer-email').value = '';
            template.find('#customer-service-officer-name').value = '';
            template.find('#customer-service-officer-password').value = '';
          }
        });
      }, 500, this);
    }
  },
});
