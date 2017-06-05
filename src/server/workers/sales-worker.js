'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import {
  sendWaitingForSaleToStartEmail,
  sendET101TicketEnqueuedEmail,
  sendWaitingForProductWhilePendingComplianceEmail,
  sendET201ProductReservedButPending
} from '/imports/server/email-actions';
import { updateInvoiceTicket } from '/imports/server/invoice-ticket-state-machine';
import { setInvoiceTicketFields } from '/imports/server/invoice-ticket-update-manager.js';
import { invoicedStates, paidStates } from '/imports/server/invoice-ticket-state-machine';
import SalesPredictor from '/imports/lib/sales-predictor.js';
import Logger from '/imports/server/lib/logger';

const isSalesStarted = () => { return Meteor.settings.public.salesStarted; };
const tranche = Meteor.settings.public.salesLimits.currentTranche;
const trancheSettings = Meteor.settings.public.salesLimits.tranches[tranche];
const curTaa = trancheSettings.totalAmountAvailable || 0;
const curOct = trancheSettings.overCapacityTolerance || 0;
const dollarsPerProduct = Meteor.settings.dollarsPerProduct;

const funcAp = function() {
  const res = InvoiceTickets.aggregate([
    { $match: { tranche: tranche, state: { $in: paidStates } } },
    { $group: { _id: "$tranche", sum: { $sum: "$productAmount" } }}
  ]);

  if (res.length > 0) {
    return Math.round(res[0].sum * dollarsPerProduct);
  } else {
    return 0;
  }
};

const funcAi = function() {
  const res = InvoiceTickets.aggregate([
    { $match: { tranche: tranche, state: { $in: invoicedStates } } },
    { $group: { _id: "$tranche", sum: { $sum: "$centsRequested" } }}
  ]);

  if (res.length > 0) {
    return Math.round(res[0].sum / 100);
  } else {
    return 0;
  }
};

const funcAip = function() {
  return funcAp() + funcAi();
};

const sendWaitingWhenNeeded = function(ticket) {
  if (ticket.state === 'btcAddressAssigned') {
    sendWaitingForSaleToStartEmail({ ticketId: ticket._id });
    updateInvoiceTicket('waitForSaleToStart', ticket);
  }
};

/**
 * ET101: During All Product Reserved period, as an approved buyer reordering or
 * an approved buyer needing compliance reordering or a pending user enrolling,
 * I should receive an enqueued email ET101 informing me that all Product is
 * currently reserved but Product will be allocated to me if Product is freed.
 * given that `salesStarted && !sp.salesGoalReached() && !allowSale` and
 * the `enqueuedEmailSentAt` have not been set for that ticket
**/
const sendET101EnqueuedEmailWhenNeeded = function(salesStarted, salesGoalReached, allowSale, ticket) {
  if (salesStarted && !salesGoalReached && !allowSale && _.isUndefined(ticket.enqueuedEmailSentAt)) {
    Logger.info(`ET101 is going to be sent => salesStarted: ${salesStarted}, salesGoalReached ${salesGoalReached}, allowSale ${allowSale}, ticket: ${ticket._id}`);
    const sent = sendET101TicketEnqueuedEmail({ ticketId: ticket._id });
    Logger.info(`ET101 send status: ${sent}`);
    if (sent) {
      Logger.info(`ET101 is going to be marked as sent for ticket: ${ticket._id}`);
      setInvoiceTicketFields(ticket._id, {
        $set: {
          enqueuedEmailSentAt: new Date()
        }
      });
      Logger.info(`ET101 marked as sent for ticket: ${ticket._id}`);
    } else {
      Logger.error(`ET101 not sent => ticket: ${ticket._id}`);
    }
  } else {
    Logger.info(`ET101 not sent => salesStarted: ${salesStarted}, salesGoalReached ${salesGoalReached}, allowSale ${allowSale}, ticket: ${ticket._id}`);
  }
};

/**
 * EU102: During All Product Reserved period, as a newly enrolled user or
 * as an approved buyer needing compliance, I should receive a
 * compliance email EU102 letting me know that I am in compliance.
 **/
const sendEU102WaitingForProductWhilePendingComplianceWhenNeeded = function(salesStarted, salesGoalReached, allowSale, ticket) {
  if (salesStarted && !salesGoalReached && !allowSale && _.isUndefined(ticket.waitingForProductWhilePendingComplianceEmailSentAt)) {
    Logger.info(`EU102 is going to be sent => salesStarted: ${salesStarted}, salesGoalReached ${salesGoalReached}, allowSale ${allowSale}, ticket: ${ticket._id}`);
    const sent = sendWaitingForProductWhilePendingComplianceEmail(ticket);
    Logger.info(`EU102 send status: ${sent}`);
    if (sent) {
      Logger.info(`EU102 is going to be marked as sent for ticket: ${ticket._id}`);
      setInvoiceTicketFields(ticket._id, {
        $set: {
          waitingForProductWhilePendingComplianceEmailSentAt: new Date()
        }
      });
      Logger.info(`EU102 marked as sent for ticket: ${ticket._id}`);
    } else {
      Logger.error(`EU102 not sent => ticket: ${ticket._id}`);
    }
  } else {
    Logger.info(`EU102 not sent => salesStarted: ${salesStarted}, salesGoalReached ${salesGoalReached}, allowSale ${allowSale}, ticket: ${ticket._id}`);
  }
};

Jobs.registerWorker({
  jobName: 'salesWorker',
  callInterval: (120 * 1000),
  cursor: function getBtcAddressAssignedTickets() {
    return InvoiceTickets.find(
      {
        state: {$in: ['btcAddressAssigned', 'waitingForSaleToStart'] }
      },
      {
        $orderby: {state: 1, createdAt: 1} // btc.. before waiting... | then older tickets first
      }
    );
  },
  task(ticket) {
    const amount = Math.round( ticket.centsRequested / 100);
    const salesStarted = isSalesStarted();
    if (!salesStarted || !ticket.buyer().isAllowedToReserveProduct()) {
      Logger.info("salesWorker", ticket._id, ticket.state, ticket.paymentOption, salesStarted, funcAip(), funcAp(), tranche, curTaa, curOct, dollarsPerProduct, "|", amount);

      // the sale has not been started
      sendWaitingWhenNeeded(ticket);
    } else {
      // the sale has started see if we need to put this ticket in the funnel
      let sp = new SalesPredictor({
        totalAmountAvailable: curTaa,
        overCapacityTolerance: curOct,
        amountInvoicedOrPaid: funcAip.bind(this),
        amountPaid: funcAp.bind(this),
      });

      Logger.info("salesWorker", ticket._id, ticket.state, ticket.paymentOption, salesStarted,
        funcAip(), funcAp(), tranche, curTaa, curOct, dollarsPerProduct,
        "|", amount, sp.salesGoalReached(), "|", sp.allowSale(amount));
      const salesGoalReached = sp.salesGoalReached();
      if (salesGoalReached) {
        // we don't have anything to do till there is a free ticket
        sendWaitingWhenNeeded(ticket);
      } else {
        const allowSale = sp.allowSale(amount);
        if (allowSale) {
          Logger.info("salesWorker", "allowSale", ticket._id, 'startSale' + ticket.paymentOption);
          updateInvoiceTicket('startSale' + ticket.paymentOption, ticket, { 'tranche': tranche });
          const user = Meteor.users.findOne({ _id: ticket.buyerId });
          if (user.isPending()) {
            sendET201ProductReservedButPending({ticketId: ticket._id});
          }
        } else {
          // Even if salesStarted, salesGoalReached and allowSale must be true, false, false
          // I prefer for the sake of readability and to make the ET101 rule to be checked
          // in a single place and potentially be moved without any problem to send the
          // parameters again
          Logger.info(`salesWorker buyer STATUS: ${ticket.buyer().personalInformation.status}`);
          sendET101EnqueuedEmailWhenNeeded(salesStarted, salesGoalReached, allowSale, ticket);
          if (ticket.buyer().isPending()) {
            sendEU102WaitingForProductWhilePendingComplianceWhenNeeded(salesStarted, salesGoalReached, allowSale, ticket);
          }
        }
      }
    }
  }
});
