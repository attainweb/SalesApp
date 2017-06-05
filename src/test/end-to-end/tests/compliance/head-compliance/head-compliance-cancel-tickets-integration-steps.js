module.exports = function() {

  this.When(/^I try to cancel (.*) tickets$/, function(userKey) {
    const buyer = this.accounts.getUserByKey(userKey);
    server.execute((buyerId, transition)=> {
      const tickets = InvoiceTickets.find({buyerId: buyerId});
      let {updateInvoiceTicket} = require('/imports/server/invoice-ticket-state-machine');
      tickets.forEach(function(ticket) {
        try {
          updateInvoiceTicket(transition, ticket, undefined);
        } catch (err) {
          // This is ok to fail because when state transition is not defined for some states,
          // it will throw an unhandled error from the State Machine plugin and it won't change ticket state
        }
      });
    }, buyer._id, 'preCancelInvoice');
  });
};
