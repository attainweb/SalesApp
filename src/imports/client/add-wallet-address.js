import { i18nAlert } from '/imports/client/i18n-alert';

export const addWalletAddress = function(t, callBackFunction) {
  const I18N_ERROR_NAMESPACE = 'walletPanel';
  const address = t.find('#wallet-input').value;
  Meteor.call('addWalletAddressToCurrentUser', address, function(err) {
    if (err) {
      i18nAlert(err, I18N_ERROR_NAMESPACE);
    } else {
      bootbox.alert(i18n(I18N_ERROR_NAMESPACE + '.successMessage'));
      if (_.isFunction(callBackFunction)) {
        callBackFunction();
      }
    }
  });
};
