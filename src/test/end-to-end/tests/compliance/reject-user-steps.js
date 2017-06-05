module.exports = function() {
  this.When(/^I reject the user (.*) with edit method$/, function(reviewUserKey) {
    const user = this.accounts.getUserByKey(reviewUserKey);
    this.accounts.stubLoggedInMeteorUser(this.user);
    server.execute((revieweeId, reviewerPassword) => {
      data = {
        userId: revieweeId,
        personalInformation: {
          status: 'REJECTED'
        }
      };
      return Meteor.call('editField', 'personalInformation.status', data, reviewerPassword );
    }, user._id, this.user.password);
    this.accounts.restoreLoggedInMeteorUserStub();
  });

  this.Then(/^(.*) tickets should be cancelled$/, function(reviewUserKey) {
    const user = this.accounts.getUserByKey(reviewUserKey);
    const officer = this.user;
    client.waitUntil(() => {
      const isCanceled = server.execute((userId, officerId) => {
        const ticketsCanceled = InvoiceTickets.find({state: 'invoicePreCanceled', buyerId: userId});
        ticketsCanceled.forEach((ticket) => {
          expect(ticket.officerThatRequestPreCancel).to.equal(officerId);
        });
        const totalTicketsCanceled = ticketsCanceled.count();
        const totalTickets = InvoiceTickets.findByUser(userId).count();
        return totalTickets === totalTicketsCanceled;
      }, user._id, officer._id);

      return isCanceled;
    }, 5000, 'waiting for tickets to be canceled', 500);
    server.execute(function(userId) {
      InvoiceTickets.findByUser(userId).forEach(function(invoice) {
        expect(invoice.state).to.equal('invoicePreCanceled');
      });
    }, user._id);
  });

  this.Then(/^(.*) tickets should not be cancelled$/, function(reviewUserKey) {
    const user = this.accounts.getUserByKey(reviewUserKey);
    server.execute(function(userId) {
      InvoiceTickets.findByUser(userId).forEach(function(invoice) {
        expect(invoice.state).to.not.equal('invoicePreCanceled');
        expect(invoice.state).to.not.equal('invoiceCanceled');
      });
    }, user._id);
  });

  this.Then(/^I see the notes assigned to the notApprovedBuyer$/, function() {
    const webChecksSelector = '.user-webCheck td';
    client.waitForText(webChecksSelector);
    let webCheckTexts = client.getText(webChecksSelector);

    const callsSelector = '.user-call td';
    client.waitForText(callsSelector);
    let callsTexts = client.getText(callsSelector);

    const customerServiceNotesSelector = '.user-customerServiceNote td';
    client.waitForText(webChecksSelector);
    let customerServiceNotesTexts = client.getText(customerServiceNotesSelector);
    // Always make it an array (if there is just one it's normally a string)
    if (!Array.isArray(webCheckTexts)) webCheckTexts = [webCheckTexts];
    if (!Array.isArray(callsTexts)) callsTexts = [callsTexts];
    if (!Array.isArray(customerServiceNotesTexts)) customerServiceNotesTexts = [customerServiceNotesTexts];
    this.notes.forEach((note, index) => {
      expect(webCheckTexts[index]).to.include(`comment: ${note.webCheck}`);
      expect(callsTexts[index]).to.include(`comment: ${note.call}`);
      expect(customerServiceNotesTexts[index]).to.include(`comment: ${note.customerServiceNote}`);
    });
  });
};
