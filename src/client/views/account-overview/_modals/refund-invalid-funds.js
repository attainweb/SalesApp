import {refundTicket} from '/imports/client/refund-ticket';

const applyModal = function() {
  $('#refund-invalid-funds').modal('hide');
  $('.modal-backdrop.fade.in').remove();
};

TemplateController('refundInvalidFunds', {
  props: new SimpleSchema({
    ticketId: { type: String },
  }),
  events: {
    'click .confirm-refund': function(e, t) {
      e.preventDefault();
      refundTicket(t, this.props.ticketId, applyModal);
    }
  }
});
