const residenceCountry = new ReactiveVar;
const tocPoliciesAvailable = new ReactiveVar;
const riskPoliciesAvailable = new ReactiveVar;
const emailConfirmed = new ReactiveVar;

Schemas = typeof Schemas !== 'undefined' ? Schemas : {};

Schemas.reorder = new SimpleSchema({
  email: {
    type: String,
    label: function() { return i18n('enroll.email'); },
    max: 255,
    min: 6,
    regEx: SimpleSchema.RegEx.Email
  },
  productAmount: {
    type: Number,
    label: function() { return i18n('enroll.units'); },
    min: function() {
      const region = Meteor.settings.public.regionalMappings[residenceCountry.get()];
      const defaultPaymentMinimum = Meteor.settings.public.regionalSettings.regionOther.enrollment.paymentMinimum;
      if (region) {
        const enrollment = "enrollment";
        const enrollmentSettings = Meteor.settings.public.regionalSettings[region][enrollment];
        return enrollmentSettings.paymentMinimum;
      }
      return defaultPaymentMinimum;
    },
    custom: function() {
      if (this.field('reftype').value === 'buyer' && !(this.value)) return 'required';
      return undefined;
    },
  },
  paymentMethod: {
    type: String,
    label: function() { return i18n('enroll.paymentMethod'); },
    allowedValues: ['Bank', 'Btc'],
    autoform: {
      options: [{
        label: function() { return i18n('enroll.paymentMethodBank'); },
        value: 'Bank'
      }, {
        label: function() { return i18n('enroll.paymentMethodBtc'); },
        value: 'Btc'
      }]
    },
  },
  acceptRisk: {
    type: Boolean,
    label: function() { return i18n('enroll.riskPolicyCheckboxLabel'); },
    autoform: {
      label: false
    },
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        this.unset();
      }
    },
  },
  acceptToc: {
    type: Boolean,
    label: function() { return i18n('enroll.codeCheckboxLabel'); },
    autoform: {
      label: false
    },
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        this.unset();
      }
    }
  },
});

const policiesAvailable = function() {
  return tocPoliciesAvailable.get() && riskPoliciesAvailable.get();
};

const isLoggedUserABuyer = function() {
  return Meteor.user() && Meteor.user().isBuyer();
};

const showPaymentMethods = function() {
  const region = Meteor.settings.public.regionalMappings[residenceCountry.get()];
  if (region) {
    const enrollment = "enrollment";
    const enrollmentSettings = Meteor.settings.public.regionalSettings[region][enrollment];
    return enrollmentSettings ? enrollmentSettings.paymentOptions.length > 1 : false;
  }
  return false;
};

TemplateController('reorder', {
  helpers: {
    unknownBuyer: function() {
      return !isLoggedUserABuyer();
    },
    reorderSchema: function() {
      return Schemas.reorder;
    },
    submitBtnContent: function() {
      return i18n('reorder.button');
    },
    emailConfirmed: function() {
      return emailConfirmed.get() || isLoggedUserABuyer();
    },
    formError: function() {
      return Template.instance().formError.get();
    },
    formErrorVar: function() {
      return Template.instance().formError;
    },
    prefillEmail: function() {
      if (Meteor.user() && Meteor.user().emails[0]) {
        return Meteor.user().emails[0].address;
      }
      return '';
    },
    selectedResidenceCountry: function() {
      return residenceCountry.get();
    },
    policiesAvailable: function() {
      return policiesAvailable();
    },
    tocPoliciesByRegionOptions: function() {
      return {
        onPoliciesReadyCb: function() {
          tocPoliciesAvailable.set(true);
        }
      };
    },
    riskPoliciesByRegionOptions: function() {
      return {
        onPoliciesReadyCb: function() {
          riskPoliciesAvailable.set(true);
        }
      };
    },
    policiesError: function() {
      return Template.instance().policiesError.get() && !policiesAvailable();
    },
    policyErrorDesc: function() {
      return [{ error: 'policiesError' }];
    },
    showPaymentMethods: function() {
      return showPaymentMethods();
    }
  },
  events: {
    'click .confirmEmailBtn': function(e, template) {
      const inputEmail = $('input[name="email"]').val();
      emailConfirmed.set(false);
      tocPoliciesAvailable.set(false);
      riskPoliciesAvailable.set(false);
      template.policiesError.set(false);
      Meteor.call('getUserCountryByEmail', inputEmail, function(err, res) {
        let myResidenceCountry = 'default';
        if (res && !err) {
          myResidenceCountry = res;
        }
        if (inputEmail.length > 0) {
          $('input[name="email"]').attr('readonly', true);
          emailConfirmed.set(true);
          template.policiesError.set(true);
        }
        residenceCountry.set(myResidenceCountry);
      });
    },
    'click .reset': function(events, template) {
      emailConfirmed.set(false);
      tocPoliciesAvailable.set(false);
      riskPoliciesAvailable.set(false);
      template.policiesError.set(false);
      residenceCountry.set('default');
      $('#reorderForm').trigger('reset');
      $('input[name="email"]').attr('readonly', false);
    }
  },
  onCreated() {
    this.formError = new ReactiveVar();
    this.paymentOptions = new ReactiveVar();
    this.policiesError = new ReactiveVar();
    this.policiesError.set(false);
    this.paymentOptions.set(false);
    if (isLoggedUserABuyer()) {
      emailConfirmed.set(true);
      tocPoliciesAvailable.set(false);
      riskPoliciesAvailable.set(false);
      this.policiesError.set(true);
      residenceCountry.set(Meteor.user().personalInformation.residenceCountry);
    }
  },
  onDestroyed() {
    emailConfirmed.set(undefined);
    residenceCountry.set(undefined);
    tocPoliciesAvailable.set(undefined);
    riskPoliciesAvailable.set(undefined);
  }
});

AutoForm.hooks({
  reorderForm: {
    beginSubmit: function() {
      this.formAttributes.formErrorVar.set("");
      const submitButton = this.template.find("button[type=submit]") || this.template.find("input[type=submit]");
      if (submitButton) {
        submitButton.disabled = true;
      }
    },
    onSuccess: function() {
      if (isLoggedUserABuyer()) {
        bootbox.alert(i18n('messages.reorderThankYou'));
      } else {
        Router.go('/reorder/thank-you');
      }
    },
    onError: function(formType, error) {
      if (formType === "method") this.formAttributes.formErrorVar.set(error.reason);
    },
  }
});
