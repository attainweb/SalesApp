import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('invoice_ticket_action_force_reserve', {
  events: {
    'click .force-reserve'() {
      const invoiceCounterCallback = this.data.options.onActionGetCounterByInvoiceStateCb;
      confirmModal(
        i18n('modals.forceReserve'),
        () => {
          this.data.ticketItem.changeState(`startSale${this.data.ticketItem.paymentOption}`, {
            tranche: Meteor.settings.public.salesLimits.currentTranche,
          },
          (err) => {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          },
          () => {
            invoiceCounterCallback(['forceReserve', 'salePending', 'btcOrders', 'unpaidBankInvoices']);
          });
        });
    }
  }
});
