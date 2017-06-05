import Logger from '/imports/server/lib/logger';
import { buyerHasRequiredComplianceLevel, buyerApplyForRequiredComplianceLevel } from '/imports/server/users/buyer-required-compliance-level';

export const createInvoiceTicket = (options) => {
  Logger.info('[createInvoiceTicket] options: ', options);
  const buyerId = options.buyerId;
  const buyer = Meteor.users.findOne({ _id: buyerId });
  let centsRequested = options.centsRequested;
  if (!centsRequested) {
    Logger.info('[createInvoiceTicket]', 'calculating centRequested');
    const usdRequested = options.usdRequested || buyer.personalInformation.purchaseUnits || 1000;
    centsRequested = usdRequested * 100;
    Logger.info('[createInvoiceTicket]', 'centRequested', centsRequested);
  }
  let newOptions = lodash.omit(options, ['centsRequested', 'usdRequested']);
  let ticket = {
    buyerId: buyerId,
    centsRequested: centsRequested,
  };
  ticket = lodash.extend({}, ticket, newOptions);
  const res = InvoiceTickets.insert(ticket);
  Logger.info('[createInvoiceTicket]', 'invoice ticket created successfully', ticket);
  const buyerTicket = InvoiceTickets.findOne(res);

  // If in compliance but not the required level, apply for the required level
  if (!buyerHasRequiredComplianceLevel(buyerId)) {
    Logger.info('[createInvoiceTicket]', 'applying for new compliance level');
    buyerApplyForRequiredComplianceLevel(buyerId);
  }

  return buyerTicket;
};
