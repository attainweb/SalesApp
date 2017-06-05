'use strict';

import { expect } from 'meteor/practicalmeteor:chai';
import { secureInvoicesOptionsByRole } from '/server/lib/invoice-tickets-publish-fields';
import { secureUserOptionsByRole } from '/server/lib/user-publish-fields';

describe('Invoice Ticket secureOptionsByRole', function() {

  it('Not allowed field in options gets removed', function() {
    const options = { fields: { buyerId: 1, productPasscode: 1, piiHash: 1 } };
    const securedOptions = secureInvoicesOptionsByRole(options);
    const expected = { fields: { buyerId: 1 } };
    expect(securedOptions).to.deep.equal(expected);
  });

  it('allow field in options are not overridden', function() {
    const options = { fields: { buyerId: 1, buyerApprovedAt: 1 } };
    const securedOptions = secureInvoicesOptionsByRole(options);
    expect(options).to.deep.equal(securedOptions);
  });

  it('empty options returns default', function() {
    const securedOptions = secureInvoicesOptionsByRole();
    expect(securedOptions.fields.buyerId).to.equal(1);
  });

  it('undefined options and role returns default', function() {
    const securedOptions = secureInvoicesOptionsByRole(undefined, undefined);
    expect(securedOptions.fields.buyerId).to.equal(1);
  });

  it('null options and role returns default', function() {
    const securedOptions = secureInvoicesOptionsByRole(null, null);
    expect(securedOptions.fields.buyerId).to.equal(1);
  });

  it('extra options are preserved', function() {
    const options = { limit: 10, sort: { createdAt: 1 } };
    const securedOptions = secureInvoicesOptionsByRole(options);
    expect(securedOptions.limit).to.equal(10);
    expect(securedOptions.sort.createdAt).to.equal(1);
    expect(securedOptions.fields.buyerId).to.equal(1);
  });
});

describe('User secureOptionsByRole', function() {

  it('Not allowed field in options gets removed for public role', function() {
    const options = { fields: { emails: 1, notes: 1 } };
    const securedOptions = secureUserOptionsByRole(options);
    const expected = { fields: { emails: 1 } };
    expect(securedOptions).to.deep.equal(expected);
  });

  it('Note field in options gets is removed to buyer', function() {
    const options = { fields: { emails: 1, notes: 1 } };
    const securedOptions = secureUserOptionsByRole(options, 'buyer');
    const expected = { fields: { emails: 1 } };
    expect(securedOptions).to.deep.equal(expected);
  });

  it('Note field in options gets is removed to distributor', function() {
    const options = { fields: { emails: 1, notes: 1 } };
    const securedOptions = secureUserOptionsByRole(options, 'distributor');
    const expected = { fields: { emails: 1 } };
    expect(securedOptions).to.deep.equal(expected);
  });

  it('Note field in options gets is not removed for compliance', function() {
    const options = { fields: { emails: 1, notes: 1 } };
    const securedOptions = secureUserOptionsByRole(options, 'compliance');
    expect(securedOptions).to.deep.equal(options);
  });

  it('Note field in options gets is not removed for chiefcompliance', function() {
    const options = { fields: { emails: 1, comment: 1 } };
    const securedOptions = secureUserOptionsByRole(options, 'chiefcompliance');
    expect(securedOptions).to.deep.equal(options);
  });

  it('Note field in options gets is not removed for headCompliance', function() {
    const options = { fields: { emails: 1, notes: 1 } };
    const securedOptions = secureUserOptionsByRole(options, 'headCompliance');
    expect(securedOptions).to.deep.equal(options);
  });

  it('Note field in options gets is not removed for customerService', function() {
    const options = { fields: { emails: 1, notes: 1 } };
    const securedOptions = secureUserOptionsByRole(options, 'customerService');
    expect(securedOptions).to.deep.equal(options);
  });

});
