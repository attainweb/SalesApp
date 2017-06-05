TemplateController('policiesByRegion', {
  props: new SimpleSchema({
    userRole: {
      type: String,
    },
    distlevel: {
      type: String,
      optional: true,
    },
    policyName: {
      type: String,
    },
    residenceCountry: {
      type: String,
      optional: true,
    },
    options: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }),

  helpers: {
    policiesByResidenceCountry() {
      let policies = [];
      try {
        const regionByResidenceCountry = lodash.get(Meteor.settings.public.regionalMappings, this.props.residenceCountry);
        if (regionByResidenceCountry && regionByResidenceCountry !== 'default') {
          const policy = lodash.get(Meteor.settings.public.regionalSettings, `${regionByResidenceCountry}.policies.${this.props.policyName}`);
          if (policy !== ' default') {
            let userRole = this.props.userRole;
            if (userRole === "partner") {
              userRole = 'distributor';
            }

            switch (this.props.policyName) {
              case 'TOC':
                distlevel = this.props.distlevel;
                if (distlevel) {
                  policies = policy[userRole][distlevel];
                } else {
                  policies = policy[userRole];
                }
                if (!policies) {
                  policies = policy.default;
                }
                break;
              case 'RISK':
              case 'PRIVACY':
              default:
                policies = policy[userRole] ? policy[userRole] : policy.default;
            }
          }
        }
      } catch (err) {
        console.log(err);
        policies = [];
      }
      if (policies.length > 0 && this.props.options && this.props.options.onPoliciesReadyCb) {
        this.props.options.onPoliciesReadyCb(policies);
      }
      return policies;
    },
    getUrl(fileName) {
      return Meteor.absoluteUrl(fileName);
    },
    policyName() {
      const i18nPolicyName = `policies.${this.props.policyName}`;
      return i18n(i18nPolicyName);
    },
    policyLang(lang) {
      const i18nPolicyName = `languages.${lang}`;
      return i18n(i18nPolicyName);
    }
  },

});
