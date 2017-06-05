const preCancellableStates = [
  'started',
  'btcAddressAssigned',
  'waitingForSaleToStart',
  'saleStartedBtc',
  'saleStartedBank',
  'complianceApprovedBtc',
  'complianceApprovedBank',
  'invoiceSentBtc',
  'invoiceSentBank'
];

TemplateController('invoiceTicketsComplianceRows', {
  helpers: {
    getInvoice() {
      return {
        ticket: this.data.invoice
      };
    },
    hasContent() {
      const isHco = Roles.userIsInRole( Meteor.userId(), 'headCompliance');
      if (!isHco) return false;
      return (_.indexOf(preCancellableStates, this.data.invoice.state) >= 0);
    },
    invoice() {
      return this.data.invoice;
    },
  }
});
