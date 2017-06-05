import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('invoice_ticket_action_update_comment', {

  state: {
    edit: false
  },

  helpers: {
    showTicketComment() {
      return this.data.ticketItem.comment;
    },
    hasNoCommnet() {
      const comment = this.data.ticketItem.comment;
      if (comment === undefined || comment === '' ) return true;
      return false;
    }
  },

  events: {
    'click button.edit_comment'() {
      event.preventDefault();
      this.state.edit = true;
      return false;
    },

    'click button.save_comment'(event) {
      event.preventDefault();
      const comment = this.find('.comment');
      this.data.ticketItem.updateComment(comment.value, (err) => {
        i18nAlert(err, I18N_ERROR_NAMESPACE);
      });
      this.state.edit = false;
      return false;
    },

    'click button.cancel_comment'(event) {
      event.preventDefault();
      this.state.edit = false;
      return false;
    }
  }
});
