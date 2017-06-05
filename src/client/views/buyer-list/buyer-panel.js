TemplateController('buyerPanel', {
  private: {
    showAsCancelled(ticketState) {
      return _.contains(['invoicePreCanceled', 'invoiceCanceled', 'invalidFundsRefunded', 'invoiceExpired'], ticketState);
    }
  },
  helpers: {
    showStatus() {
      switch (this.data.buyer.getStatus()) {
        case 'APPROVED':
          return i18n('personalInformation.status.approved');
        case 'PENDING':
          return i18n('personalInformation.status.pending');
        case 'REJECTED':
          return i18n('personalInformation.status.rejected');
        default:
          return i18n('personalInformation.status.invalid');
      }
    },
    stateLable(ticket) {
      if (ticket.isPaid()) {
        return i18n('buyers.paid');
      }
      if (this.showAsCancelled(ticket.state)) {
        return i18n('buyers.cancelled');
      }
      return i18n('buyers.unpaid');
    },
    stateClass(ticket) {
      if (ticket.isPaid()) {
        return 'paid';
      }
      if (this.showAsCancelled(ticket.state)) {
        return 'cancelled';
      }
      return 'unpaid';
    }
  }
});
