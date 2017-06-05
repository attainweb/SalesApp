import {addWalletAddress} from '/imports/client/add-wallet-address';

const applyModal = function() {
  $('#update-wallet-address').modal('hide');
};

TemplateController('updateWalletAddress', {
  state: {
    notice: ''
  },
  helpers: {
    notice: function() {
      return this.state.notice;
    }
  },
  events: {
    'click .confirm-change': function(e, t) {
      e.preventDefault();
      this.state.notice = '';
      addWalletAddress(t, applyModal);
    }
  }
});
