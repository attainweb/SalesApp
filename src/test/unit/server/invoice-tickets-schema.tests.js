'use strict';

import { expect } from 'meteor/practicalmeteor:chai';
import '/lib/collections/_base-schema.js';
import '/lib/collections/invoice-tickets.js';

describe('Invoice Tickets Schema Validations', function() {

  it('ticket with piiHash is valid', function() {
    const obj = { productVendingInvitation: { piiHash: 'n8fh3hfeHGfrv89hfuihv8HUIb43h' }};
    const isValid = Schemas.InvoiceTicket.namedContext("piiHash_validation").validateOne(obj, "productVendingInvitation");
    expect(isValid).isTrue;
  });

  it('piiHash gets removed after Schemma clean', function() {
    const obj = { buyerId: '1',  productVendingInvitation: { piiHash: 'n8fh3hfeHGfrv89hfuihv8HUIb43h'} };
    const validated = Schemas.InvoiceTicket.clean(obj);
    expect(validated.buyerId).equals('1');
    expect(validated.productVendingInvitation).to.be.undefined;
  });

});
