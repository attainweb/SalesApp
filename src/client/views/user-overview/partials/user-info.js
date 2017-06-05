import { availableLanguages } from '/imports/lib/shared/i18n';
import { getCountryList, getTranslatedCountry } from '/imports/client/countries';

const userIdField = {
  type: String,
};

TemplateController('user_info', {

  state: {
    ipRegionInfo: undefined,
    enrollmentClientIP: '-',
    showEditEmail: false,
    showEditAddress: false,

    showEditFieldPersonalInformationSurname: false,
    showEditFieldPersonalInformationName: false,
    showEditFieldPersonalInformationPhone: false,
    showEditFieldPersonalInformationStatus: false,
    showEditFieldPersonalInformationIsUnderInvestigation: false,
    showEditFieldPersonalInformationBirthdate: false,
    showEditFieldPersonalInformationLanguage: false,
    showEditFieldPersonalInformationRegion: false,
    showEditFieldPersonalInformationResidenceCountry: false,

  },
  onCreated() {
    this.autorun(() => {
      this.state.enrollmentClientIP = Meteor.user().currentlyReviewing().personalInformation.enrollmentClientIP;
      if (this.state.enrollmentClientIP) {
        Meteor.http.call("GET", "https://freegeoip.net/json/" + this.state.enrollmentClientIP, function(error, response) {
          let ipRegionInfo = '';
          if (!error && response.data) {
            if (response.data.country_name && response.data.country_name.length > 0) {
              ipRegionInfo = ' (' + response.data.country_name;
              if (response.data.region_name && response.data.region_name.length > 0) {
                ipRegionInfo += ', ' + response.data.region_name;
              }
              if (response.data.city && response.data.city.length > 0) {
                ipRegionInfo += ', ' + response.data.city;
              }
              ipRegionInfo += ')';
            }
          }
          this.state.ipRegionInfo = ipRegionInfo;
        }.bind(this));
      }
    });
  },
  events: {
    'click .edit-email'(event) {
      this.state.showEditEmail = !this.state.showEditEmail;
      event.preventDefault();
    },
    'click .edit-address'(event) {
      this.state.showEditAddress = !this.state.showEditAddress;
      event.preventDefault();
    },

    'click .edit-phone'(event) {

      this.state.showEditFieldPersonalInformationPhone = !this.state.showEditFieldPersonalInformationPhone;
      event.preventDefault();
    },
    'click .edit-status'(event) {
      this.state.showEditFieldPersonalInformationStatus = !this.state.showEditFieldPersonalInformationStatus;
      event.preventDefault();
    },
    'click .edit-under-investigation'(event) {
      this.state.showEditFieldPersonalInformationIsUnderInvestigation = !this.state.showEditFieldPersonalInformationIsUnderInvestigation;
      event.preventDefault();
    },
    'click .edit-birthdate'(event) {
      this.state.showEditFieldPersonalInformationBirthdate = !this.state.showEditFieldPersonalInformationBirthdate;
      event.preventDefault();
    },
    'click .edit-name'(event) {
      this.state.showEditFieldPersonalInformationName = !this.state.showEditFieldPersonalInformationName;
      event.preventDefault();
    },
    'click .edit-surname'(event) {
      this.state.showEditFieldPersonalInformationSurname = !this.state.showEditFieldPersonalInformationSurname;
      event.preventDefault();
    },
    'click .edit-language'(event) {
      this.state.showEditFieldPersonalInformationLanguage = !this.state.showEditFieldPersonalInformationLanguage;
      event.preventDefault();
    },
    'click .edit-region'(event) {
      this.state.showEditFieldPersonalInformationLanguage = !this.state.showEditFieldPersonalInformationLanguage;
      event.preventDefault();
    },
    'click .edit-residence-country'(event) {
      this.state.showEditFieldPersonalInformationResidenceCountry = !this.state.showEditFieldPersonalInformationResidenceCountry;
      event.preventDefault();
    },

  },
  helpers: {
    hideShowEditEmail() {
      const self = this;
      // this needs to be rapped twice because there are two templates the function needs to be passed thru
      return function() {
        return function() {
          self.state.showEditEmail = false;
        };
      };
    },
    hideShowEditAddress() {
      const self = this;
      // this needs to be rapped twice because there are two templates the function needs to be passed thru
      return function() {
        return function() {
          self.state.showEditAddress = false;
        };
      };
    },
    showEditField(fieldname) {
      const fname = _.camelCase(fieldname).capitalize();
      return this.state['showEditField' + fname] || false;
    },
    hideEditField() {
      const self = this;
      return function() {
        return function(fieldname) {
          const fname = _.camelCase(fieldname).capitalize();
          // this needs to be rapped twice because there are two templates the function needs to be passed thru
          self.state['showEditField' + fname] = false;
        };
      };
    },
    allowEdit() {
      return Roles.userIsInRole(Meteor.userId(), ['headCompliance']);
    },
    getPersonalInformationNameSchema() {
      const fields = {
        'personalInformation.name': {
          type: String,
          label: function() { return i18n('enroll.name'); },
          max: 50
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationSurnameSchema() {
      const fields = {
        'personalInformation.surname': {
          type: String,
          label: function() { return i18n('enroll.surname'); },
          max: 50
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationPhoneSchema() {
      const fields = {
        'personalInformation.phone': {
          type: String,
          label: function() { return i18n('enroll.phone'); },
          max: 255
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationUnderInvestigationSchema() {
      const fields = {
        'personalInformation.isUnderInvestigation': {
          type: Boolean,
          label: function() { return i18n('userInfo.isUnderInvestigation'); },
          autoform: {
            options: [{
              label: function() { return i18n('compliance.isUnderInvestigation.true'); },
              value: true
            }, {
              label: function() { return i18n('compliance.isUnderInvestigation.false'); },
              value: false
            }],
          },
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationStatusSchema() {
      const fields = {
        'personalInformation.status': {
          type: String,
          max: 255,
          label: function() { return i18n('accountInfo.account.status'); },
          allowedValues: ['PENDING', 'APPROVED', 'REJECTED'],
          autoform: {
            options: [{
              label: function() { return i18n('compliance.statusTypes.PENDING'); },
              value: "PENDING"
            }, {
              label: function() { return i18n('compliance.statusTypes.APPROVED'); },
              value: "APPROVED"
            }, {
              label: function() { return i18n('compliance.statusTypes.REJECTED'); },
              value: "REJECTED"
            }],
          },
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationBirthdateSchema() {
      const fields = {
        'personalInformation.birthdate': {
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
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationLanguageSchema() {
      const fields = {
        'personalInformation.language': {
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
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationResidenceCountrySchema() {
      const fields = {
        'personalInformation.residenceCountry': {
          type: String,
          label: function() { return i18n('enroll.residenceSelection.residenceCountry'); },
          autoform: {
            options: function() { return getCountryList(); }
          },
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationPostaddressAddressSchema() {
      const fields = {
        'personalInformation.postaddress.address': {
          type: String,
          label: function() { return i18n('enroll.address'); },
          max: 255,
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationPostaddressZipSchema() {
      const fields = {
        'personalInformation.postaddress.zip': {
          type: String,
          label: function() { return i18n('enroll.zip'); },
          max: 255,
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationPostaddressCitySchema() {
      const fields = {
        'personalInformation.postaddress.city': {
          type: String,
          label: function() { return i18n('enroll.city'); },
          max: 255,
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },
    getPersonalInformationPostaddressStateSchema() {
      const fields = {
        'personalInformation.postaddress.state': {
          type: String,
          label: function() { return i18n('enroll.state'); },
          max: 255,
        },
      };
      fields.userId = userIdField;
      return new SimpleSchema([Schemas.withPassword, fields]);
    },

    accountTypeText() {
      let accountType = Meteor.user().currentlyReviewing().personalInformation.accountType;
      return i18n('userInfo.accountTypes.' + accountType);
    },

    isCompany() {
      let accountType = Meteor.user().currentlyReviewing().personalInformation.accountType;
      return accountType === 'company';
    },

    personalInformationStatus() {
      let status = Meteor.user().currentlyReviewing().personalInformation.status;
      return i18n('compliance.statusTypes.' + status);
    },

    isUnderInvestigation() {
      const isUnderInvestigation = Meteor.user().currentlyReviewing().personalInformation.isUnderInvestigation;
      return i18n('compliance.isUnderInvestigation.' + isUnderInvestigation);
    },

    role() {
      let role = Meteor.user().currentlyReviewing().primaryRole();
      return i18n('userInfo.roles.' + role);
    },

    distlevel() {
      return i18n('distLevelAlias.' + Meteor.user().currentlyReviewing().personalInformation.distlevel);
    },

    originator() {
      let originator = Meteor.user().currentlyReviewing().originator();
      return originator.fullName() + ' <' + originator.primaryEmail() + '>';
    },

    branchPartner() {
      let branchPartner = Meteor.user().currentlyReviewing().branchPartner();
      return branchPartner.fullName() + ' <' + branchPartner.primaryEmail() + '>';
    },

    notPartner() {
      return !Meteor.user().currentlyReviewing().isPartner();
    },

    complianceLevel() {
      return i18n('compliance.level.' + Meteor.user().currentlyReviewing().complianceLevel());
    },

    applyingForComplianceLevel() {
      return i18n('compliance.level.' + Meteor.user().currentlyReviewing().applyingForComplianceLevel());
    },
    apiInvalidZip(failed) {
      if (failed === undefined) return i18n('userInfo.apiInvalidZip.noCheckDone');
      return (failed === true) ? i18n('userInfo.apiInvalidZip.no') : i18n('userInfo.apiInvalidZip.yes');
    },
    getTranslatedResidenceCountry() {
      return getTranslatedCountry( Meteor.user().currentlyReviewing().personalInformation.residenceCountry );
    }

  },
});
