import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'policyPanel';

const RiskSchema = new SimpleSchema({
  acceptRisk: {
    type: Boolean,
    label: function() { return i18n('policyPanel.riskPolicyCheckboxLabel'); },
    autoform: {
      label: false
    },
  },
});

const TocSchema = new SimpleSchema({
  acceptToc: {
    type: Boolean,
    label: function() { return i18n('policyPanel.codeCheckboxLabel'); },
    autoform: {
      label: false
    },
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        this.unset();
      }
    },
  },
});


const PrivacySchema = new SimpleSchema({
  acceptPrivacy: {
    type: Boolean,
    label: function() { return i18n('policyPanel.privacyCheckboxLabel'); },
    autoform: {
      label: false
    },
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        this.unset();
      }
    },
  },
});

TemplateController('policyApproval', {
  helpers: {
    needToAgreeTo(name) {
      return Meteor.user().mustAgreeToPolicy(name);
    },

    distlevel() {
      return Meteor.user().personalInformation.distlevel;
    },

    role() {
      return Meteor.user().primaryRole();
    },

    userResidenceCountry() {
      return Meteor.user().personalInformation.residenceCountry;
    },
    riskSchema() { return RiskSchema; },
    tocSchema() { return TocSchema; },
    privacySchema() { return PrivacySchema; }
  },
});

AutoForm.hooks({
  tocForm: {
    onSubmit: function onSubmit() {
      Meteor.call('agreeToPolicy', 'TOC', function(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
          this.done(err);
          return false;
        }
        return true;
      });
      this.done();
      return false;
    },
  },
  riskForm: {
    onSubmit: function onSubmit() {
      Meteor.call('agreeToPolicy', 'RISK', function(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
          this.done(err);
          return false;
        }
        return true;
      });
      this.done();
      return false;
    },
  },
  privacyForm: {
    onSubmit: function onSubmit() {
      Meteor.call('agreeToPolicy', 'PRIVACY', function(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
          this.done(err);
          return false;
        }
        return true;
      });
      this.done();
      return false;
    },
  },

});
