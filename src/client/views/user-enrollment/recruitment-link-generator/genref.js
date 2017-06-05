import {i18nAlert} from '/imports/client/i18n-alert';

const I18N_ERROR_NAMESPACE = 'genref';

TemplateController('genref', {
  state: {
    refcode: undefined,
    isGenerated: false,
    isGenlinkLoading: false
  },
  private: {
    getRadioValue(theRadioGroup) {
      const elements = document.getElementsByName(theRadioGroup);
      for (let i = 0, l = elements.length; i < l; i++) {
        if (elements[i].checked) {
          return elements[i].value;
        }
      }
      return [];
    },
    onGenRef(err, res) {
      this.state.isGenlinkLoading = false;
      if (err) {
        i18nAlert(err, I18N_ERROR_NAMESPACE);
        return;
      }
      this.state.refcode = res;
      this.state.isGenerated = true;
      $('#namelink').val('');
      $('#link-notes').val('');
    }
  },
  helpers: {
    genlinkBtnClass: function() {
      return this.state.isGenlinkLoading ? 'disabled' : '';
    },
    isGenerated: function() {
      return this.state.isGenerated;
    },
    enrollData: function() {
      return {refcode: this.state.refcode};
    }
  },
  events: {
    'click #genlink-btn': function(event, template) {
      template.state.isGenlinkLoading = true;
    },
    'click .partner #genlink-btn': function(event, template) {
      const name = $('#namelink').val();
      const notes = $('#link-notes').val();
      Meteor.call('genPartnerRef', {
        name: name,
        notes: notes,
      }, template.onGenRef.bind(template));
    },
    'click .distributor #genlink-btn': function(event, template) {
      const tier = this.getRadioValue('tier');
      const timetype = this.getRadioValue('timetype');
      const name = $('#namelink').val();
      const notes = $('#link-notes').val();
      Meteor.call('genDistributorRef', {
        distlevel: Number(tier),
        timetype: timetype,
        name: name,
        notes: notes,
      }, template.onGenRef.bind(template));
    },
    'click .buyer #genlink-btn': function(event, template) {
      const timetype = this.getRadioValue('timetype');
      const name = $('#namelink').val();
      const notes = $('#link-notes').val();

      Meteor.call('genBuyerRef', {
        timetype: timetype,
        name: name,
        notes: notes,
      }, template.onGenRef.bind(template));
    }
  }
});

TemplateController('tier_selector', {
  onRendered() {
    $('.tiers').children('input').first().prop('checked', true);
  }
});
