import { expect } from 'meteor/practicalmeteor:chai';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { HTTP } from 'meteor/http';
import faker from 'faker';
import { insertAutoincrements } from '/test/integration/server/helpers.app-tests';
import Commissions from '/imports/lib/collections/commissions';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';

describe('commissionsPaid', function() {

  // Set default timeout for this suite to 5 seconds to avoid fails on CI
  this.timeout(5000);
  console.log('commissionsPaid');
  beforeEach(function() {
    resetDatabase();
    insertAutoincrements();
  });

  it('denormalizes the paid commissions', function(done) {
    console.log('denormalizes the paid commissions');
    // Setup test data
    const distributor1 = Factory.create('user', {
      roles: ['distributor'],
      "personalInformation.distlevel": 1
    });
    const distributor2 = Factory.create('user', {
      roles: ['distributor'],
      "personalInformation.distlevel": 0,
      "personalInformation.originatorId": distributor1._id
    });
    const buyer = Factory.create('user', {
      roles: ['buyer'],
      emails: [{ address: "test-buyer@bla.com", verified: true }],
      'personalInformation.originatorId': distributor2._id
    });
    const invoiceTicket = Factory.create('invoiceTicket', {
      buyerId: buyer._id,
      fundsReceived: true,
      state: 'satoshisReceived'
    });
    const payoutTransactionId = faker.random.uuid();
    const commissions = API.calculateCommissions(invoiceTicket._id, invoiceTicket.satoshisReceived);

    InvoiceTickets.update({"_id": invoiceTicket._id}, {$set: {commissions: commissions}});
    // Simulate api call from the backend app that commissions have been paid

    const data = {
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: payoutTransactionId
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsPaid`, { data }, (httpError) => {
      if (httpError) done(httpError);
      try {
        const results = Commissions.find().fetch();
        // It should create exactly one commission
        expect(results.length).to.equal(2);
        // With the following properties
        expect(results).to.deep.equal([{
          _id: results[0]._id,
          distributorId: distributor2._id,
          ticketId: invoiceTicket._id,
          invoiceNumber: invoiceTicket.invoiceNumber,
          buyerId: buyer._id,
          originator: 'test-buyer',
          payoutAmount: commissions[0].payoutAmount,
          payoutTransactionId: payoutTransactionId,
          paidAt: results[0].paidAt,
          createdAt: invoiceTicket.satoshisReceivedAt,
        },
        {
          _id: results[1]._id,
          distributorId: distributor1._id,
          ticketId: invoiceTicket._id,
          invoiceNumber: invoiceTicket.invoiceNumber,
          buyerId: buyer._id,
          originator: 'Downline',
          payoutAmount: commissions[1].payoutAmount,
          payoutTransactionId: payoutTransactionId,
          paidAt: results[1].paidAt,
          createdAt: invoiceTicket.satoshisReceivedAt,
        }]);
        console.log('No errors found');

        done();
      } catch (error) {
        console.log('Errors found', error);
        done(error);
      }
    });
  });

  it('returns 400 for an invalid body', function(done) {
    const data = {};
    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsPaid`, { data }, (httpError) => {
      expect(httpError.response.statusCode).to.equal(400);
      expect(Commissions.find().count()).to.equal(0);
      done();

    });
  });

  it('returns 400 for a invalid bitcoin address', function(done) {
    const data = {
      invoiceAddress: faker.random.number({min: 1, max: 100000}),
      transactionId: faker.random.uuid()
    };
    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsPaid`, { data }, (httpError) => {
      expect(httpError.response.statusCode).to.equal(400);
      expect(Commissions.find().count()).to.equal(0);
      done();
    });
  });

  it('returns 400 for a nonexistent ticket', function(done) {
    const data = {
      invoiceAddress: faker.finance.bitcoinAddress(),
      transactionId: faker.random.uuid()
    };
    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsPaid`, { data }, (httpError) => {
      expect(httpError.response.statusCode).to.equal(400);
      expect(Commissions.find().count()).to.equal(0);
      done();
    });
  });

  it('returns 500 if commissions have already been paid', function(done) {
    // Setup test data

    let distributor = Factory.create('user',
      { roles: ['distributor'],
        "personalInformation.distlevel": 0,
      });
    let buyer1 = Factory.create('user', {roles: ['buyer'], "personalInformation.originatorId": distributor._id });
    let invoiceTicket = Factory.create('invoiceTicket',
     { buyerId: buyer1._id,
       state: 'ticketFinalized' });
    let commissions = API.calculateCommissions(invoiceTicket._id, invoiceTicket.satoshisReceived);
    let commission = Factory.create('commission', {
      distributorId: distributor._id,
      ticketId: invoiceTicket._id,
      buyerId: buyer1._id,
      payoutTransactionId: faker.random.uuid()
    });

    updateInvoiceTicket('receiveSatoshis', invoiceTicket, {
      commissions: commissions,
      fundsReceived: true
    });

    // Simulate api call from the backend app that commissions have been paid

    const data = {
      invoiceAddress: invoiceTicket.btcAddress,
      transactionId: commission.payoutTransactionId
    };

    HTTP.post(`${Meteor.absoluteUrl()}/api/commissionsPaid`, { data }, (httpError) => {
      expect(httpError.response.statusCode).to.equal(500);
      expect(Commissions.find().count()).to.equal(1);
      done();
    });
  });
});
