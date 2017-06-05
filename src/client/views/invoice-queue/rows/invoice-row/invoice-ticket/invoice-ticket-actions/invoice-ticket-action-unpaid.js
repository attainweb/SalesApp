import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('invoice_ticket_action_unpaid', {
  state: {
    yenReceived: 0,
    isModalOpen: false,
    bank: "",
  },

  helpers: {
    onValidAmount() {
      return amount => {
        this.state.yenReceived = amount;
      };
    },
    onInvalidAmount() {
      return () => {
        this.state.yenReceived = 0;
      };
    },
    getSelectedBank: function() {
      return bank => {
        this.state.bank = bank;
      };
    },
    isEnabled: function() {
      return !(this.state.yenReceived > 0 && this.state.bank !== "");
    }
  },

  events: {
    'click button.funds-received'() {
      const invoiceCounterCallback = this.data.options.onActionGetCounterByInvoiceStateCb;
      confirmModal(
        '<p>' + i18n('modals.confirmPayment') + '</p>' +
        '<p>' + i18n('modals.invoiceNumber',  this.data.ticketItem.invoiceNumber) + '</p>' +
        '<p>' + i18n('modals.requested',  Helpers.formatCurrency('USD', this.data.ticketItem.usdRequested())) + '</p>' +
        '<p>' + i18n('modals.received',  Helpers.formatCurrency('YEN', this.state.yenReceived)) + '</p>' +
        '<p>' + i18n('modals.bank', this.state.bank) + '</p>',
        () => {
          this.data.ticketItem.changeState('receiveFunds', {
            yenReceived: this.state.yenReceived,
            bank: this.state.bank
          }, (err) => {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          },
          () => {
            invoiceCounterCallback([ 'unpaidBankInvoices', 'confirmBankAmount', 'sentToBankChecker']);
          });
        });
    }
  }
});
