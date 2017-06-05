import { confirmModal } from '/imports/client/confirm-modal';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'refundInvalidFunds';

TemplateController('invoice_ticket_action_invalid_funds_received', {
  helpers: {
    getTicketId() {
      return this.data.ticketItem._id;
    }
  },
  events: {
    'click .approve-invalid-ticket'() {
      const invoiceCounterCallback = this.data.options.onActionGetCounterByInvoiceStateCb;
      confirmModal(
        i18n('modals.approveInvalidFundsModal'),
        () => {
          this.data.ticketItem.changeState("approveInvalidTicket",
          undefined,
          (err) => {
            i18nAlert(err, I18N_ERROR_NAMESPACE);
          },
          () => {
            invoiceCounterCallback(['invalidFundsReceived']);
          });
        });
    }
  }
});
