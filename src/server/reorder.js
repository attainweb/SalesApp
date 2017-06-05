import Logger from '/imports/server/lib/logger';
import { agreeToPolicyServer } from '/imports/server/accounts';
import { createInvoiceTicket } from '/imports/server/invoice-tickets/create-invoice-ticket';
import { isCompliant } from '/imports/server/users/compliance-level';

Meteor.methods({
  reorderProduct: function(doc) {
    Logger.info("Meteor.methods", "[reorderProduct] - starting", doc);
    check(doc.email, String);
    check(doc.productAmount, Match.Where(function(amount) {
      check(amount, Number);
      return amount > 0;
    }));
    check(doc.paymentMethod, String);

    // check if email exists
    const user = Meteor.users.findOne({ 'emails.address': doc.email });
    Logger.info("[enrollUser] - checking if sale is over");
    if (Meteor.settings.public.salesOver) {
      Logger.info("[enrollUser] - sale is over");
      throw new Meteor.Error(404, i18n("reorder.errors.salesOver"));
    }

    if (!user) {
      Meteor.sleep(2500);
      throw new Meteor.Error(404, "reorder.errors.emailNotFound");
    }

    if (!user.isBuyer()) {
      throw new Meteor.Error(403, "reorder.errors.youAreNotAllowedToOrder");
    }
    const canReorder = isCompliant(user) && user.isApproved();
    if (!canReorder) {
      throw new Meteor.Error(403, "reorder.errors.waitingForApproval");
    }

    Logger.info('[reorderProduct]', 'aggree to policies - starting');
    agreeToPolicyServer(user._id, 'TOC');
    Logger.info('[agreeToPolicyServer] - ok!', 'acceptToc');
    agreeToPolicyServer(user._id, 'RISK');
    Logger.info('[agreeToPolicyServer] - ok!', 'acceptRisk');
    Logger.info('[reorderProduct]', 'aggree to policies - ok!');
    createInvoiceTicket({ buyerId: user._id, paymentOption: doc.paymentMethod, usdRequested: doc.productAmount });
    Logger.info("[reorderProduct] - finished createInvoiceTicket method");
    Logger.info('[reorderProduct] - ok!');
  },
});
