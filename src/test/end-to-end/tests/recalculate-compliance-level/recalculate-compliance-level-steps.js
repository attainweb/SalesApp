import { getUserFromDB, updateUserField } from '/test/end-to-end/tests/_support/accounts';

module.exports = function() {

  this.Given(/^my (.*) is set to (.*)$/, function(value, modifier) {
    updateUserField(this.user._id, 'personalInformation.' + value, modifier);
  });

  this.When(/^my invoice changes state through (.*)$/, function(stateTransition) {
    server.execute((buyerId, transition)=> {
      const ticket = InvoiceTickets.findOne({buyerId: buyerId});
      let {updateInvoiceTicket} = require('/imports/server/invoice-ticket-state-machine');
      updateInvoiceTicket(transition, ticket, undefined);
    }, this.user._id, stateTransition);
  });

  this.Then(/^my new required compliance tier is (.*)$/, function(applyingForComplianceLevel) {
    const storedUser = getUserFromDB(this.user._id, { 'personalInformation.applyingForComplianceLevel': 1 } );
    expect(storedUser.personalInformation.applyingForComplianceLevel).to.equal(parseInt(applyingForComplianceLevel, 10));
  });

  this.Then(/^I still have compliance level (.*)$/, function(complianceLevel) {
    const storedUser = getUserFromDB(this.user._id, { 'personalInformation.complianceLevel': 1 } );
    expect(storedUser.personalInformation.complianceLevel).to.equal(parseInt(complianceLevel, 10));
  });

  this.Then(/^my status should be (.*)$/, function(status) {
    const storedUser = getUserFromDB(this.user._id, { 'personalInformation.status': 1 } );
    expect(storedUser.personalInformation.status).to.equal(status);
  });

};
