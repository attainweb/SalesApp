import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('invoice_ticket_action_paid', {
  events: {
    'click .mark-unpaid'() {
      const invoiceCounterCallback = this.data.options.onActionGetCounterByInvoiceStateCb;
      confirmModal(
        i18n('modals.sendBack'),
        () => {
          this.data.ticketItem.changeState('cancelFundsReceived', {
            yenReceived: null,
            bank: null,
          },
          (err) => {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          },
          () => {
            invoiceCounterCallback(['confirmBankAmount', 'sentToBankChecker', 'unpaidBankInvoices']);
          });
        },
        i18n('modals.buttons.confirmReject')
      );
    },
    'click .confirm-payment'() {
      const invoiceCounterCallback = this.data.options.onActionGetCounterByInvoiceStateCb;
      confirmModal(
        i18n('modals.confirmPayment'),
        () => {
          this.data.ticketItem.changeState('confirmFundsReceived', undefined,
          (err) => {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          },
          () => {
            invoiceCounterCallback(['confirmBankAmount', 'sentToBankChecker', 'preBundle' ]);
          });
        });
    }
  }
});
