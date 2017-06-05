TemplateController('downloadExportPaidInvoiceFile', {
  props: new SimpleSchema({
    exportTicketId: {
      type: String
    }
  }),
  helpers: {
    exportPath() {
      return '/invoice-management/paymentExport/' + this.props.exportTicketId;
    }
  }
});
