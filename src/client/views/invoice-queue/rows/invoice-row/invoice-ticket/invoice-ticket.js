TemplateController('invoice_ticket', {
  helpers: {
    complianceStatus() {
      let status = null;
      if (this.data.ticket.buyer) {
        const buyer = this.data.ticket.buyer();
        if (buyer) {
          status = buyer.getStatus();
        }
      }
      return status;
    }
  }
});
