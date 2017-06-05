import { waitForWorkerIsReady } from '/test/end-to-end/tests/_support/jobs';

module.exports = function() {
  this.Then(/^the ticket state should be changed canceled$/, function() {
    waitForWorkerIsReady('sendCancelInvoiceWorker');
    const savedInvoice = server.execute(invoiceId => {
      return InvoiceTickets.findOne({ _id: invoiceId });
    }, this.testTicket._id);
    expect(savedInvoice.state).to.equal(`invoiceCanceled`);
    const officerId = this.user._id;
    expect(savedInvoice.officerThatRequestPreCancel).to.equal(officerId);
    expect(savedInvoice.canceledAt).to.not.be.undefined;
  });
};
