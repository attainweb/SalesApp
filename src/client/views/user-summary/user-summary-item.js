import { getTranslatedCountry } from '/imports/client/countries';
const I18N_ERROR_NAMESPACE = 'userSummary';

TemplateController('userSummaryItem', {
  // props: Schemas.User, // Causes a bug as the Schema strips off _id

  'private': {
    getUser() {
      return Template.currentData().user;
    }
  },

  helpers: {
    containsUser(watchedBy) {
      return _.contains(watchedBy, Meteor.userId());
    },
    progress() {
      return this.getUser().personalInformation.hasBeenReviewed
           ? 'success'
           : 'danger';
    },
    accountType() {
      return i18n('userInfo.accountTypes.' + this.getUser().accountType());
    },
    complianceLevel() {
      return i18n('compliance.level.' + this.getUser().complianceLevel());
    },
    applyingForComplianceLevel() {
      return i18n('compliance.level.' + this.getUser().applyingForComplianceLevel());
    },
    hasWalletAddress() {
      return this.getUser().personalInformation.walletAddress
           ? 'success'
           : 'danger';
    },
    getTranslatedCountry() {
      const userResidenceCountry = this.getUser().personalInformation.residenceCountry;
      return getTranslatedCountry(userResidenceCountry);
    },
    getTranslatedAccountType() {
      const userAccountType = this.getUser().personalInformation.accountType;
      return i18n(I18N_ERROR_NAMESPACE + '.accountType' + _.capitalize(userAccountType));
    },
    showNumber() {
      return Meteor.user().isInvestigator() && !this.getUser().personalInformation.isUnderInvestigation;
    },
    getPrimaryEmail() {
      return this.getUser().emails[0] && this.getUser().emails[0].address;
    },
    showIndicators() {
      // Investigator always search by distributors
      return Meteor.user().isInvestigator() || this.getUser().isDistributor();
    },
    showLevel() {
      // Investigator always search by distributors
      return !Meteor.user().isInvestigator();
    },
    showReviewer() {
      // This is just too complex for CCS, as it would need a Meteor call to get the user reviewer
      return !Meteor.user().isInvestigator();
    },
    localizedRoleName() {
      let role = this.getUser().roles[0];
      if (this.getUser().personalInformation.distlevel === 0) {
        role = 'partner';
      }
      const localizedRoleName = i18n(`roles.${role}`);
      return localizedRoleName;
    },
    userNumber() {
      return (this.getUser().number / 100) >> 0;
    }
  }
});
