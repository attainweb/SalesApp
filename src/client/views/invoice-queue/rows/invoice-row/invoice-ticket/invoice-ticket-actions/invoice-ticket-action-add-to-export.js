import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('invoice_ticket_action_add_to_export', {
  events: {
    'click button.export-ticket'() {
      const invoiceCounterCallback = this.data.options.onActionGetCounterByInvoiceStateCb;
      confirmModal(
        i18n('modals.addToExport'),
        () => {
          this.data.ticketItem.changeState('prepareTicket', undefined, (err) => {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          },
          () => {
            invoiceCounterCallback(['preBundle', 'currentBundle']);
          });
        });
    }
  }
});

