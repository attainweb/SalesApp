import { availableLanguages } from '/imports/lib/shared/i18n';
import { getCountryList } from '/imports/client/countries';
import { enrollmentSettingsForCountry } from '/imports/lib/settings.js';
import { Tracker } from 'meteor/tracker';

const emailBlackList =  [
  "docomo.ne.jp",
  "mopera.net",
  "dwmail.jp",
  "softbank.ne.jp",
  "i.softbank.jp",
  "disney.ne.jp",
  "d.vodafone.ne.jp",
  "h.vodafone.ne.jp",
  "t.vodafone.ne.jp",
  "c.vodafone.ne.jp",
  "r.vodafone.ne.jp",
  "k.vodafone.ne.jp",
  "n.vodafone.ne.jp",
  "s.vodafone.ne.jp",
  "q.vodafone.ne.jp",
  "jp-d.ne.jp",
  "jp-h.ne.jp",
  "jp-t.ne.jp",
  "jp-c.ne.jp",
  "jp-r.ne.jp",
  "jp-k.ne.jp",
  "jp-n.ne.jp",
  "jp-s.ne.jp",
  "jp-q.ne.jp",
  "ezweb.ne.jp",
  "biz.ezweb.ne.jp",
  "ido.ne.jp",
  "ezweb.ne.jp",
  "ezweb.ne.jp",
  "sky.tkk.ne.jp",
  "sky.tkc.ne.jp",
  "sky.tu -ka.ne.jp",
  "ymobile.ne.jp",
  "ymobile1.ne.jp",
  "y-mobile.ne.jp",
  "pdx.ne.jp",
  "willcom.com",
  "wcm.ne.jp",
  "emnet.ne.jp",
  "emobile.ne.jp",
  "emobile-s.ne.jp",
];

// FIXME: Remove the Meteor.startup here as soon as the bug in simple-schema-i18n
// is fixed: https://github.com/gwendall/meteor-simple-schema-i18n/pull/50
Meteor.startup(function() {
  Tracker.autorun(function() {
    SimpleSchema.messages({
      emailMismatch: i18n('enroll.emailMismatch'),
      domainBlacklisted: i18n('enroll.domainBlacklisted'),
    });
  });
});

export const emailEditSchema = new SimpleSchema({
  userId: {
    type: String,
  },
  email: {
    type: String,
    label: function() { return i18n('enroll.email'); },
    max: 255,
    min: 6,
    regEx: SimpleSchema.RegEx.Email,
    custom: function() {
      const origEmail = this.value.toLowerCase();
      const foundInList = _.some(emailBlackList, function(domain) {
        return _.endsWith(origEmail, domain);
      });
      if (foundInList) return "domainBlacklisted";
      return undefined;
    }
  },
  emailCheck: {
    type: String,
    label: function() { return i18n('enroll.emailCheck'); },
    max: 255,
    min: 6,
    regEx: SimpleSchema.RegEx.Email,
    custom: function() {
      if (this.value !== this.field('email').value) return "emailMismatch";
      return undefined;
    },
  },
});

export const getContactInformationSchemaByCountry = function(countryCode) {
  const simpleSchemaOptions = {
    accountType: {
      type: String,
      label: function() { return i18n('enroll.accountType'); },
      allowedValues: ['personal', 'company'],
      defaultValue: 'personal',
      autoform: {
        options: [{
          label: function() { return i18n('enroll.accountTypePersonal'); },
          value: 'personal'
        }, {
          label: function() { return i18n('enroll.accountTypeCompany'); },
          value: 'company'
        }]
      }
    },
    firstname: {
      type: String,
      label: function() { return i18n('enroll.name'); },
      max: 50
    },
    surname: {
      type: String,
      label: function() { return i18n('enroll.surname'); },
      max: 50
    },
    companyName: {
      type: String,
      label: function() { return i18n('enroll.companyName'); },
      optional: true,
      custom: function() {
        if (this.field('accountType').value === 'company' && !(this.value)) return 'required';
        return undefined;
      },
      max: 50
    },
    registrationDate: {
      type: Date,
      label: function() { return i18n('enroll.registrationDate'); },
      optional: true,
      custom: function() {
        if (this.field('accountType').value === 'company' && !(this.value)) {
          return 'required';
        }
        return undefined;
      },
      autoform: {
        type: 'bootstrap-datepicker',
        datePickerOptions: {
          format: 'yyyy-mm-dd',
          language: 'jp-JA',
        },
      }
    },
    email: {
      type: String,
      label: function() { return i18n('enroll.email'); },
      max: 255,
      min: 6,
      regEx: SimpleSchema.RegEx.Email,
      custom: function() {
        const origEmail = this.value.toLowerCase();
        const foundInList = _.some(emailBlackList, function(domain) {
          return _.endsWith(origEmail, domain);
        });
        if (foundInList) return "domainBlacklisted";
        return undefined;
      }
    },
    emailVerificationCode: {
      type: String,
      label: function() { return i18n('enroll.emailVerificationCode'); },
      max: 20,
      min: 1
    },
    phone: {
      type: String,
      label: function() { return i18n('enroll.phone'); },
      max: 255,
    },
    birthdate: {
      type: Date,
      label: function() { return i18n('enroll.birthdate'); },
      autoform: {
        type: 'bootstrap-datepicker',
        datePickerOptions: {
          format: 'yyyy-mm-dd',
          language: 'jp-JA',
          forceParse: false,
        }
      }
    },
    zip: {
      type: String,
      label: function() { return i18n('enroll.zip'); },
      max: 255,
    },
    apiInvalidZip: {
      type: Boolean,
      optional: true,
      label: function() { return i18n('enroll.zipApiFail'); },
      autoform: {
        label: false
      },
      autoValue: function() {
        if (this.isSet && this.value !== true) {
          this.unset();
        }
      }
    },
    state: {
      type: String,
      label: function() { return i18n('enroll.state'); },
      max: 255
    },
    city: {
      type: String,
      label: function() { return i18n('enroll.city'); },
      max: 255,
    },
    address: {
      type: String,
      label: function() { return i18n('enroll.address'); },
      max: 255,
    },
    reftype: {
      type: String,
      max: 255,
      autoform: {
        type: "hidden",
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
      optional: true,
      custom: function() {
        if (this.field('reftype').value === 'buyer' && !(this.value)) return 'required';
        return undefined;
      },
    },
    productAmount: {
      type: Number,
      label: function() { return i18n('enroll.units'); },
      optional: true,
      min: function() {
        const settings = enrollmentSettingsForCountry(Session.get('residenceCountry'));
        return settings ? settings.paymentMinimum : 1000;
      },
      custom: function() {
        if (this.field('reftype').value === 'buyer' && !(this.value)) return 'required';
        return undefined;
      },
    },
    acceptPolicy: {
      type: Boolean,
      label: function() { return i18n('enroll.privacyCheckboxLabel'); },
      autoform: {
        label: false
      },
      autoValue: function() {
        if (this.isSet && this.value !== true) {
          this.unset();
        }
      }
    }
  };
  if (countryCode === 'KR') {
    simpleSchemaOptions.state.autoValue = function() { return 'KR'; };
    simpleSchemaOptions.state.autoform = {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    };
  }
  return new SimpleSchema(simpleSchemaOptions);
};

export const residenceSelectionSchema = new SimpleSchema({
  residenceCountry: {
    type: String,
    label: function() { return i18n('enroll.residenceSelection.residenceCountry'); },
    autoform: {
      options: function() { return getCountryList(); }
    },
    optional: false,
  },
  language: {
    type: String,
    label: function() { return i18n('enroll.residenceSelection.language'); },
    allowedValues: availableLanguages,
    autoform: {
      options: _.map( availableLanguages, function( lang ) {
        return {
          label: function() { return NoI18nMessages.languages[lang]; },
          value: lang
        };
      }),
    },
    optional: false,
  },
  agreedToDocumentsInEnglish: {
    type: Boolean,
    label: function() {
      return 'Chúng tôi đồng ý với việc cung cấp hợp đồng chỉ bằng tiếng Anh (' + i18n('enroll.residenceSelection.agreedToDocumentsInEnglish') + ')';
    },
    autoform: {
      label: false,
      type() {
        return Session.get('showAgreedToDocumentsInEnglishWarning') ? '' : 'hidden';
      }
    },
    optional() {
      // if the warning is present the field is mandatory
      return !Session.get('showAgreedToDocumentsInEnglishWarning');
    },
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        this.unset();
      }
    }
  }
});

export const agreementsSchema = new SimpleSchema({
  reftype: {
    type: String,
    max: 255,
    autoform: {
      type: "hidden",
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
    optional: true,
    custom: function() {
      if (this.field('reftype').value === 'buyer' && !(this.value)) return 'required';
      return undefined;
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

export const showUploadWarning = function(country) {
  return _.includes(['JP'], country);
};

export const documentsSchema = new SimpleSchema({
  uploadWarning: {
    type: Boolean,
    label: function() {
      return i18n(`enroll.documentUpload.uploadWarningCheckbox.${Session.get('residenceCountry')}`);
    },
    autoform: {
      label: false,
      type: function() {
        return showUploadWarning(Session.get('residenceCountry')) ? '' : 'hidden';
      }
    },
    optional: () => !showUploadWarning(Session.get('residenceCountry')),
    autoValue: function() {
      if (this.isSet && this.value !== true) {
        this.unset();
      }
    }
  },
});
