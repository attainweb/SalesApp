import { i18nAlert } from '/imports/client/i18n-alert';
import { enrollmentSettingsForCountry } from '/imports/lib/settings.js';
import {
  residenceSelectionSchema, getContactInformationSchemaByCountry, agreementsSchema, documentsSchema, showUploadWarning
} from '/imports/lib/schemas/enrollment';

const emailWhiteList = ["google.com", "google.co.jp", "yahoo.com", "yahoo.co.jp"];
const I18N_ERROR_NAMESPACE = 'enroll';
const refIsDistributor = function(refType) {
  return refType === 'distributor'
    || refType === 'partner';
};

Session.setDefault('isZipCorrect', true);

const setShowAgreedToDocumentsInEnglishWarning = function(residenceCountry) {
  if (residenceCountry === 'VN') { // residenceCountry === vietnam
    Session.set('showAgreedToDocumentsInEnglishWarning', true);
  } else {
    Session.set('showAgreedToDocumentsInEnglishWarning', false);
  }
};

const getAddressType = (type, results) => {
  let output = false;
  results.forEach(function(v) {
    v.address_components.forEach(function(addrComp) {
      if (addrComp.types.indexOf(type) > -1) {
        output = addrComp.long_name;
      }
    });
  });
  return output;
};

const getZipResults = (jsonResult) => {
  const requiredFields = ['postal_code'];

  if (jsonResult.data.status === "ZERO_RESULTS") {
    return false;
  }

  const resultArray = jsonResult.data.results;
  const output = {};
  let hasFieldNotFound = false;

  requiredFields.forEach(function(value) {
    const result = getAddressType(value, resultArray);
    if (result === false) {
      hasFieldNotFound = true;
      return;
    } else {
      output[value] = result;
    }
  });
  if (hasFieldNotFound) return false;

  return output;

};

const enrollUser = function(tmpl, data, wizard) {
  const wd = _.extend(wizard.mergedData(), data);

  // set user fields
  const userFields = {
    email: wd.email,
    personalInformation: {
      name: wd.firstname,
      surname: wd.surname,
      accountType: wd.accountType,
      phone: wd.phone,
      birthdate: wd.birthdate,
      language: wd.language,
      residenceCountry: wd.residenceCountry,
      postaddress: {
        zip: wd.zip,
        apiInvalidZip: wd.apiInvalidZip,
        state: wd.state,
        city: wd.city,
        address: wd.address
      },
    },
  };

  if (wd.accountType === 'company') {
    userFields.personalInformation.companyName = wd.companyName;
    userFields.personalInformation.registrationDate = wd.registrationDate;
  }
  const salesStarted = Meteor.settings.public.salesStarted;
  const enrollUserOptions = {
    refcode: tmpl.refcode,
    emailVerificationCode: wd.emailVerificationCode,
    userFields: userFields,
    paymentOption: wd.paymentMethod,
    usdRequested: wd.productAmount,
    acceptRisk: wd.acceptRisk,
    acceptToc: wd.acceptToc,
    acceptPrivacy: wd.acceptPolicy,
  };
  Meteor.call('enrollUser', enrollUserOptions, function(err) {
    if (err) {
      i18nAlert(err, I18N_ERROR_NAMESPACE);
      console.error('[enrollUser] err', err);
      return;
    }

    if (refIsDistributor(tmpl.curRef().reftype)) Router.go('/enroll/thank-you-distributor');
    else if (salesStarted)      Router.go('/enroll/thank-you-invoice');
    else                        Router.go('/enroll/thank-you');

    wizard.clearData();
  });
};

const changeSendEmailVerificationCodeState = function() {
  const curEmail = $('input[name="email"]').val();
  $("#sendEmailVerificationCode").prop('disabled', !curEmail);
};

const renderCompanyField = function() {
  const $companyGroup = $('[name="companyName"]').parents('.company-group');
  const accountType = Session.get('accountType');
  (accountType === 'company') ? $companyGroup.show() : $companyGroup.hide();
};

const hiddenIfDistributor = function(refType) {
  return refIsDistributor(refType) ? 'hidden' : '';
};

TemplateController('enrollWizard', {
  helpers: {
    refIsValid() {
      return Session.get('srefvalid');
    },
    nextButton: function() { return function() {return i18n('enroll.next');}; },
    backButton: function() { return function() {return i18n('enroll.back');}; },
    confirmButton: function() { return function() {return i18n('enroll.confirm');}; },
    steps: function() {
      const tmpl = this.data;
      return [
        {
          id: 'residence-selection',
          index: 1,
          title: function() {return i18n('enroll.stepResidenceSelection');},
          schema: residenceSelectionSchema,
          template: 'enrollWizardResidenceSelection',
          onSubmit: function(data, wizard) {
            Session.set('residenceCountry', data.residenceCountry);
            wizard.next(data);
          }
        },
        {
          id: 'contact-information',
          index: 2,
          title: function() {return i18n('enroll.stepContactInformation');},
          schema: () => {
            tmpl.contactInformationSchema = getContactInformationSchemaByCountry(Session.get('residenceCountry'));
            return tmpl.contactInformationSchema;
          },
          template: 'enrollWizardContactInformation',
          onSubmit(data, wizard) {
            const self = this;
            if (!Session.get('isZipCorrect') && data.apiInvalidZip !== true) {
              tmpl.contactInformationSchema.namedContext("contact-information-form").addInvalidKeys([{name: "apiInvalidZip", type: "required"}]);
              self.done('error in Zip');
            } else {
              Meteor.call('checkEmailVerificationCode', data.email, data.emailVerificationCode, function(err) {
                if (!err) {
                  tmpl.contactInformationSchema.clean(data);
                  wizard.next(data);
                } else {
                  i18nAlert(err, I18N_ERROR_NAMESPACE);
                  self.done(err);
                }
              });
            }
          }
        },
        {
          id: 'agreements',
          index: 3,
          title: function() {return i18n('enroll.stepAssignments');},
          schema: agreementsSchema,
          template: 'enrollWizardAgreements',
        },
        {
          id: 'documents',
          index: 4,
          title: function() {return i18n('enroll.stepDocuments');},
          schema: documentsSchema,
          template: 'enrollWizardDocuments',
          onSubmit: function(data, wizard) {
            enrollUser(tmpl, data, wizard);
            this.done();
          }
        }
      ];
    },
    wizardloading: function() {
      return Session.get('__wizard_loading');
    }
  },
  events: {
    'change select[name="accountType"]': function(e) {
      const accountType = $(e.target).val();
      Session.set('accountType', accountType);
      renderCompanyField();
    },
    'blur input[datadateformat]'(e) {
      const date = e.currentTarget.value;
      const format = e.currentTarget.attributes.datadateformat.value;
      const verified = moment(date, format, true).isValid();
      if (!verified) {
        e.currentTarget.value = '';
      }
    }
  }
});

TemplateController('StepsTemplate', {
  helpers: {
    enrollStepLabel: function(index) {
      return i18n('enroll.step.' + index);
    },
    stepClass: function(id) {
      const activeStep = this.data.wizard.activeStep();
      const step  = this.data.wizard.getStep(id);
      if (activeStep && activeStep.index === step.index) {
        return 'active';
      }
      if (activeStep && activeStep.index > step.index) {
        return 'complete';
      }
      return 'disabled';
    }
  }
});

TemplateController('enrollWizardResidenceSelection', {
  helpers: {
    selectedLang() {
      return i18n.getLanguage();
    },
    selectedCountry() {
      if (this.data.step.data() && this.data.step.data().residenceCountry) {
        return this.data.step.data().residenceCountry;
      } else {
        return navigator.language.slice(-2);
      }
    }
  },
  events: {
    'change select[name="language"]': function(e) {
      const lang = $(e.target).val();
      if (lang !== i18n.getLanguage()) {
        i18n.setLanguage(lang);
      }
    },
    'change select[name="residenceCountry"]'(event) {
      const residenceCountry = $(event.target).val();
      setShowAgreedToDocumentsInEnglishWarning(residenceCountry);
    }
  },
  onCreated() {
    if (this.data.step.data() && this.data.step.data().residenceCountry) {
      setShowAgreedToDocumentsInEnglishWarning(this.data.step.data().residenceCountry);
    }
  }
});

TemplateController('enrollWizardContactInformation', {
  state: {
    resetEmailButtonShow: false,
    verifyButtonState: false,
    confirmButtonState: false,
  },

  helpers: {
    resetEmailButtonShow: function() {
      return this.state.resetEmailButtonShow;
    },
    verifyButtonState: function() {
      return this.state.verifyButtonState;
    },
    confirmButtonState: function() {
      return this.state.confirmButtonState;
    },
    hiddenIfDistributor: function() {
      return hiddenIfDistributor(this.data.curRef().reftype);
    },
    selectedResidenceCountry: function() {
      return Session.get('residenceCountry');
    },
    distlevel: function() {
      return this.data.curRef().distlevel;
    },
    role: function() { return this.data.curRef().reftype; },
    showPaymentOptions: function() {
      const residenceCountry = this.data.wizard.getStep('residence-selection').data().residenceCountry;
      const settings = enrollmentSettingsForCountry(residenceCountry);
      if (settings && settings.paymentOptions.length > 1) {
        return true;
      } else {
        return false;
      }
    }
  },
  events: {
    'click #confirmEmailVerificationCode'(event, template) {
      const email = $('input[name="email"]').val().toLowerCase();
      const refcode = $('input[name="emailVerificationCode"]').val();
      let self = this;
      Meteor.call('checkEmailVerificationCode', email, refcode, function(err) {
        if (!err) {
          self.state.confirmButtonState = false;
          self.state.resetEmailButtonShow = true;
          $("#confirmEmailVerificationCode").prop('disabled', true);
          $("#sendEmailVerificationCode").prop('disabled', true);
          $('input[name="emailVerificationCode"]').prop('readonly', true);
        } else {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
        }
      });
    },
    'click #sendEmailVerificationCode': function(event, template) {
      const email = $('input[name="email"]').val().toLowerCase();
      const refcode = template.data.refcode;
      const language = template.data.wizard.mergedData().language;
      let self = this;
      Meteor.call('sendEmailVerificationCode', refcode, email, language, function(err) {
        if (!err) {
          const sendCodeButtonId = "#sendEmailVerificationCode";
          // Mark button as sent as a visual guide for the user
          self.state.verifyButtonState = false;
          self.state.confirmButtonState = true;
          $('input[name="emailVerificationCode"]').prop('readonly', false);
          $("#confirmEmailVerificationCode").prop('disabled', false);
          $(sendCodeButtonId).html(i18n('enroll.reSendEmailVerificationCode'));
          bootbox.alert(i18n('enroll.emailVerificationCodeSent', email));
        } else {
          i18nAlert({error: 'send-email-verification-code-failed'}, I18N_ERROR_NAMESPACE);
        }
      });
    },
    'click #reset-email': function() {
      $('input[name="email"]').prop('readonly', false);
      $('input[name="email"]').val('');
      $('input[name="emailVerificationCode"]').val('');

      const sendCodeButtonId = "#sendEmailVerificationCode";
      $(sendCodeButtonId).prop('disabled', false);
      $(sendCodeButtonId).html(i18n('enroll.sendEmailVerificationCode'));
      $("#confirmEmailVerificationCode").prop('disabled', true);
      this.state.resetEmailButtonShow = false;
      this.state.verifyButtonState = true;
    },
    'keyup input[name=email]': function() {
      // Enable send verification code if email was provided
      changeSendEmailVerificationCodeState();

      const curVal = $('input[name="email"]').val().toLowerCase();

      const foundInList = _.some(emailWhiteList, function(domain) {
        if ( _.endsWith(curVal, domain) ) {
          return true;
        }
        return false;
      });

      let warning = $('.email-form').find('.warning-block');
      if (!foundInList) {
        if (_.isEmpty(warning)) {
          $('.email-form').append('<span class="warning-block"></span>');
          warning = $('.email-form').find('.warning-block');
        }
        warning.text( i18n('enroll.notInWhiltelist') );

      } else {

        if (!_.isEmpty(warning)) {
          warning.remove();
        }
      }

    },
    'change input[name=apiInvalidZip]'() {
      // for some reason autoform disables this button
      $('button[type=submit]').prop('disabled', false);
    },
    'blur input[name=zip]'(e) {
      $('input[name=apiInvalidZip]').prop('checked', false);
      const zip = $(e.target).val();
      const country = Session.get('residenceCountry');
      HTTP.call("GET", "https://maps.googleapis.com/maps/api/geocode/json?language=" + i18n.getLanguage() + "&components=country:" + country + "|postal_code:" + zip, (error, result) => {
        const address = getZipResults(result);
        if (address === false) {
          $('input[name=apiInvalidZip]').parent().show();
          Session.set('isZipCorrect', false);
        } else {
          Session.set('isZipCorrect', true);
          $('button[type=submit]').prop('disabled', false);
          if (address.postal_code !== zip) $(e.target).val(address.postal_code);

          $('input[name=apiInvalidZip]').parent().hide();
        }
      });
    }
  },
  onRendered: function() {
    this.state.verifyButtonState = true;
    $("#confirmEmailVerificationCode").prop('disabled', true);
    $('input[name="emailVerificationCode"]').prop('readonly', true);
    if (Session.get('accountType') !== 'company') {
      Meteor.setTimeout(function() {
        $('[name="accountType"]').val('personal');
      }, 0);
    }

    const zipCheckParent = $('input[name=apiInvalidZip]').parent();
    if (Session.get('isZipCorrect')) zipCheckParent.hide(); else zipCheckParent.show();

    renderCompanyField();
  }
});

TemplateController('enrollWizardAgreements', {
  helpers: {
    selectedResidenceCountry: function() {
      return Session.get('residenceCountry');
    },
    role: function() {
      return this.data.curRef().reftype;
    },
    distlevel: function() {
      return this.data.curRef().distlevel;
    },
    hiddenIfDistributor: function() {
      return hiddenIfDistributor(this.data.curRef().reftype);
    }
  }
});

TemplateController('enrollWizardDocuments', {
  helpers: {
    uploadWarningMessageKey: () => i18n(`enroll.documentUpload.uploadWarning.${Session.get('residenceCountry')}`),
    showUploadWarning: () => showUploadWarning(Session.get('residenceCountry'))
  }
});
