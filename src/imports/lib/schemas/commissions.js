export default new SimpleSchema({
  distributorId: {
    type: String
  },
  ticketId: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  buyerId: {
    type: String,
  },
  originator: {
    type: String
  },
  payoutAmount: {
    type: Number
  },
  payoutTransactionId: {
    type: String,
    optional: true
  },
  paidAt: {
    type: Date,
    optional: true
  },
  createdAt: {
    type: Date,
    optional: true
  }
});
