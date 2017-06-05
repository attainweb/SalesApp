TemplateController('commissionItem', {
  helpers: {
    originator() {
      if (this.data.originator === "Downline") {
        return i18n('commissions.downline');
      } else {
        return this.data.originator;
      }
    },
    btcServiceUrl: function() {
      if (Meteor.settings.public.development === true) {
        return 'https://www.blocktrail.com/tBTC/tx/';
      } else {
        return 'https://blockchain.info/tx/';
      }
    },
  }
});
