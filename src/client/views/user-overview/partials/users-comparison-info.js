import {getTranslatedCountry } from '/imports/client/countries';

TemplateController('usersComparisonInfo', {

  state: {
    ipRegionInfo: undefined,
    enrollmentClientIP: '-'
  },
  onCreated() {
    this.autorun(() => {
      this.state.enrollmentClientIP = this.data.personalInformation.enrollmentClientIP;
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
  helpers: {
    enrollmentIp() {
      return this.state.enrollmentClientIP;
    },
    accountTypeText() {
      let accountType = this.data.personalInformation.accountType;
      return i18n('userInfo.accountTypes.' + accountType);
    },

    isCompany() {
      let accountType = this.data.personalInformation.accountType;
      return accountType === 'company';
    },

    personalInformationStatus() {
      let status = this.data.personalInformation.status;
      return i18n('compliance.statusTypes.' + status);
    },

    role() {
      let role = this.data.primaryRole();
      return i18n('userInfo.roles.' + role);
    },

    distlevel() {
      return i18n('distLevelAlias.' + this.data.personalInformation.distlevel);
    },

    originator() {
      let originator = this.data.originator();
      if (typeof originator === 'undefined') return '-';
      return originator.fullName() + ' <' + originator.primaryEmail() + '>';
    },

    branchPartner() {
      const branchPartner = this.data.branchPartner();
      if (branchPartner === false) return '-';
      return branchPartner.fullName() + ' <' + branchPartner.primaryEmail() + '>';
    },

    notPartner() {
      return !this.data.isPartner();
    },

    complianceLevel() {
      return i18n('compliance.level.' + this.data.complianceLevel());
    },

    applyingForComplianceLevel() {
      return i18n('compliance.level.' + this.data.applyingForComplianceLevel());
    },
    apiInvalidZip(failed) {
      if (failed === undefined) return i18n('userInfo.apiInvalidZip.noCheckDone');
      return (failed === true) ? i18n('userInfo.apiInvalidZip.no') : i18n('userInfo.apiInvalidZip.yes');
    },
    getTranslatedResidenceCountry() {
      return getTranslatedCountry( this.data.personalInformation.residenceCountry );
    }

  },
});
