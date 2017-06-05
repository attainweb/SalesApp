import {i18nAlert} from '/imports/client/i18n-alert';

const I18N_ERROR_NAMESPACE = 'genref';

TemplateController('refCard', {
  state: {
    isExpanded: false
  },
  helpers: {
    notPartner() {
      return !(this.data.reftype === 'partner');
    },
    status() {
      if (this.data.isExpired())    return i18n('refInfo.status.expired');
      else if (!this.data.isActive) return i18n('refInfo.status.retired');
      else                          return i18n('refInfo.status.active');
    },
    isRetireable() {
      return this.data.isValid() && !(this.data.reftype === 'partner');
    },
    activeClass() {
      return this.data.isActive ? 'active' : '';
    },
    url() {
      return Meteor.absoluteUrl('enroll');
    },
    showRefType() {
      return i18n('refInfo.reftype.' + this.data.timetype);
    },
  },
  events: {
    'click .retire'() {
      Meteor.call('retireRef', this.data.refcode, function(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
        }
      });
    },
    'click .expand'(event, template) {
      template.state.isExpanded = template.state.isExpanded ? false : true;
    }
  }
});
