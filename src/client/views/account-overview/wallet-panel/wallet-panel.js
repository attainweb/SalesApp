import { addWalletAddress } from '/imports/client/add-wallet-address';

TemplateController('walletPanel', {
  state: {
    notice: ''
  },
  helpers: {
    notice: function() {
      return this.state.notice;
    }
  },
  events: {
    'submit #wallet-form': function(e, t) {
      e.preventDefault();
      this.state.notice = '';
      addWalletAddress(t);
    }
  }
});
