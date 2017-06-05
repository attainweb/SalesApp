import { waitForWorkerIsReady } from '/test/end-to-end/tests/_support/jobs';

module.exports = function() {
  this.Then(/^My ticket state should be (.+)$/, function(expectedTicketState) {
    waitForWorkerIsReady('salesWorker');
    const invoiceTickets = server.execute(function() {
      return InvoiceTickets.find({}).fetch();
    });
    expect(invoiceTickets.length).to.equals(1);
    expect(invoiceTickets[0].state).to.equal(expectedTicketState);
  });

  this.Given(/^I have (.+) as residence country$/, function(residenceCountry) {
    expect(this.user.personalInformation.residenceCountry).to.equal(residenceCountry);
  });
};
