import CommissionsSchema from '/imports/lib/schemas/commissions';

const Commissions = new Mongo.Collection("commissions");
Commissions.attachSchema(CommissionsSchema);

Commissions.createFromInvoiceTicket = function(invoiceTicket) {
  if (!invoiceTicket) throw new Error(`Invalid invoice ticket ${invoiceTicketId} given.`);
  const commissions = invoiceTicket.commissions;
  if (!commissions) return;

  _.each(commissions, function commissionsPredicate(commission) {
    let originator = null;
    let ticketBuyer = invoiceTicket.buyer();

    if (ticketBuyer.personalInformation.originatorId === commission.distributorId) {
      originator = ticketBuyer.emails[0].address.split("@", 1).toString();
    } else {
      originator = "Downline";
    }

    Commissions.insert({
      distributorId: commission.distributorId,
      ticketId: invoiceTicket._id,
      invoiceNumber: invoiceTicket.invoiceNumber,
      buyerId: invoiceTicket.buyerId,
      originator: originator,
      payoutAmount: commission.payoutAmount,
      payoutTransactionId: invoiceTicket.payoutTransactionId,
      paidAt: new Date(),
      createdAt: invoiceTicket.satoshisReceivedAt
    });
  });
};

export default Commissions;
