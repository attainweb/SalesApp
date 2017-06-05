import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('invoiceTicketActionCancel', {
  'private': {

  },
  events: {
    'click button.cancel-ticket'() {
      confirmModal(
        i18n('modals.cancelTicket'),
        ()=> {
          this.data.invoice.changeState('preCancelInvoice', undefined,
            (err)=>{
              i18nAlert(err, I18N_ERROR_NAMESPACE);
            });
        });
    }
  }
});
