TemplateController('pay', {
  helpers: {
    getTicket() {
      return InvoiceTickets.findOne();
    },
    getTemplateName(paymentOption) {
      return 'pay' + paymentOption;
    },
    headerFor(paymentOption) {
      return i18n(`pay${paymentOption}.header`);
    }
  }
});
