import { i18nAlert } from '/imports/client/i18n-alert';

export const refundTicket = function(t, ticketId, callBackFunction) {
  const I18N_ERROR_NAMESPACE = 'refundInvalidFunds';
  const transactionId = t.find('#refundTransactionId').value;
  const reason = t.find('#refundReason').value;
  Meteor.call('refundInvalidFunds', ticketId, transactionId, reason, function(err) {
    if (err) {
      i18nAlert(err, I18N_ERROR_NAMESPACE);
    } else {
      bootbox.alert(i18n(I18N_ERROR_NAMESPACE + '.successMessage'), () => {
        if (_.isFunction(callBackFunction)) {
          callBackFunction();
        }
      });
    }
  });
};
