import Logger from '/imports/server/lib/logger';
import Commissions from '/imports/lib/collections/commissions';
import { Jobs } from '/lib/collections/jobs.js';
import {invoicedStates, paidStates} from '/imports/server/invoice-ticket-state-machine';
import {secureInvoicesOptionsByRole} from '/server/lib/invoice-tickets-publish-fields';
import {secureUserOptionsByRole} from '/server/lib/user-publish-fields';
import {secureJobsOptionsByRole} from '/server/lib/jobs-publish-fields';
import {secureCommissionsOptions} from '/server/lib/commissions-publish-fields';

const dollarsPerProduct = Meteor.settings.dollarsPerProduct;


const publishSum = function(sub, coursor, pubName, field2Sum, mapperFunc = function(value) {
  return value;
}) {
  let handle = null;

  let curTotal = 0;
  let curCount = 0;
  let added = false;

  updateSum = function(sumName, newVal, newCount) {
    if (!added) {
      added = true;
      sub.added('sums', sumName, {sum: newVal, count: newCount});
    } else {
      sub.changed('sums', sumName, {sum: newVal, count: newCount});
    }
  };
  handle = coursor.observe({
    added: function(doc) {
      // Logger.info('added', curTotal, doc[field2Sum]);
      if (doc[field2Sum]) {
        curTotal += mapperFunc(doc[field2Sum]);
      }
      curCount += 1;
      updateSum(pubName, curTotal, curCount);
    },
    changed: function(newDocument, oldDocument) {
      let usdDiff = 0;
      if (newDocument[field2Sum] && oldDocument[field2Sum]) {
        usdDiff = newDocument[field2Sum] - oldDocument[field2Sum];
      }
      // Logger.info('changed', curTotal, usdDiff);
      curTotal += mapperFunc(usdDiff);
      updateSum(pubName, curTotal, curCount);
    },
    removed: function(doc) {
      // Logger.info('removed', curTotal, doc[field2Sum]);
      if (doc[field2Sum]) {
        curTotal -= mapperFunc(doc[field2Sum]);
      }
      curCount -= 1;
      updateSum(pubName, curTotal, curCount);
    },
  });
  sub.ready();
  // make sure we clean everything up (note `_publishCursor`
  //   does this for us with the comment observers)
  sub.onStop(function() {
    handle.stop();
  });
};

/**
 * Allows to apply a transformation on the published collection, allowing to add calculated fields
 * Taken from: http://stackoverflow.com/questions/18093560/meteor-collection-transform-is-it-done-on-the-server-or-on-the-client-or-it-de
 * @param [String] publicationName
 * @param [function] cursorGetter
 * @param [function] transform
 * Drawback: if you save the published document you will save the added changes as well.
 */
Meteor.publishWithTransform = function(publicationName, cursorGetter, transform) {
  transform = transform || function(o) { return o; };

  if (Meteor.server.publish_handlers.hasOwnProperty(publicationName)) return null;

  Meteor.publish(publicationName, function() {
    const cursor = cursorGetter.apply(this, arguments);
    if (cursor !== undefined) {
      const collectionName = cursor._cursorDescription.collectionName;

      const self = this;

      const observer = cursor.observe({
        added: function(document) {
          self.added(collectionName, document._id, transform(document));
        },
        changed: function(newDocument) {
          self.changed(collectionName, newDocument._id, transform(newDocument));
        },
        removed: function(oldDocument) {
          self.removed(collectionName, oldDocument._id);
        }
      });

      self.onStop(function() {
        observer.stop();
      });

      self.ready();
    }
  });
};

Meteor.publish('reviewRecords', function() {
  if (Roles.userIsInRole(this.userId, Meteor.users.getComplianceRoles())) {
    return ReviewRecords.find({});
  }
  return undefined;
});

Meteor.publishComposite('reviewRecordsByReviweeId', function(revieweeId) {
  return {
    find: function() {
      if (Roles.userIsInRole(this.userId, ['compliance', 'chiefcompliance', 'admin'])) {
        return ReviewRecords.findByReviweeId(revieweeId);
      }
      return undefined;
    },
    children: [{
      find: function(reviewRecord) {
        const role = Meteor.users.getFirstRole(this.userId);
        return Meteor.users.find({_id: reviewRecord.complianceId}, secureUserOptionsByRole({}, role));
      }
    }]
  };
});

Meteor.publish('invoicesByRevieweeId', function(revieweeId) {
  if (!Roles.userIsInRole(this.userId, Meteor.users.getComplianceRoles())) return undefined;
  const role = Meteor.users.getFirstRole(this.userId);
  const opts = secureInvoicesOptionsByRole({}, role);
  return InvoiceTickets.findByUser(revieweeId, opts);
});

Meteor.publish('paidInvoicesTotal', function() {
  if (Roles.userIsInRole(this.userId, Meteor.users.getInvoiceManagerValidRoles())) {
    const role = Meteor.users.getFirstRole(this.userId);
    const cursor = InvoiceTickets.find({
      state: {
        $in: ['ticketPrepared']
      }
    }, secureInvoicesOptionsByRole({}, role));
    publishSum(this, cursor, 'paidInvoicesTotal', 'yenReceived');
  }
});

Meteor.publishComposite('invoiceTicketsWithBuyers', function(state, query) {
  if (Roles.userIsInRole(this.userId, Meteor.users.getInvoiceManagerValidRoles())) {
    const role = Meteor.users.getFirstRole(this.userId);
    const userId = this.userId;
    return {
      find: function() {
        const opts = secureInvoicesOptionsByRole({}, role);
        const tickets = InvoiceTickets.findByStateAndQuery(state, query, opts);
        const firstTicket = tickets.fetch()[0];
        return tickets;
      },
      children: [
        {
          find: function getBuyer(ticket) {
            return Meteor.users.find({_id: ticket.buyerId}, secureUserOptionsByRole({}, role));
          },
        },
      ],
    };
  }
  return null;
});

// review
Meteor.publishComposite('paymentExports', function(state, query) {
  if (Roles.userIsInRole(this.userId, Meteor.users.getInvoiceManagerValidRoles())) {
    return {
      find: function() {
        const role = Meteor.users.getFirstRole(this.userId);
        const opts = secureInvoicesOptionsByRole({}, role);
        return PaymentExports.findByStateAndQuery(state, query, opts);
      }
    };
  }
  return null;
});

Meteor.publish('enrollPaymentTicket', function(ticketId) {
  check(ticketId, String);
  return InvoiceTickets.find({
    _id: ticketId,
    state: {$in: ['invoiceSentBtc', 'invoiceSentBank']}
  }, secureInvoicesOptionsByRole({}, 'unauthorized'));
});

Meteor.publish('currentUser', function() {
  const role = Meteor.users.getFirstRole(this.userId);
  return Meteor.users.find({_id: this.userId}, secureUserOptionsByRole({}, role));
});

Meteor.publish('linkrefs', function() {
  if (!!this.userId) {
    return Refs.find({
      reftype: {$in: ['buyer', 'distributor', 'partner']},
      originatorId: this.userId,
    });
  }
  return this.ready();
});

Meteor.publish('enrollRef', function(refcode) {
  check(refcode, String);
  return Refs.find({refcode: refcode});
});

Meteor.publishComposite('pendingReview', function(options) {
  if (Roles.userIsInRole(this.userId, Meteor.users.getComplianceRoles())) {
    const role = Meteor.users.getFirstRole(this.userId);
    const secureFields = secureUserOptionsByRole({}, role);
    // The options param is checked in findByPendingForReview!
    return {
      find: function() {
        return Meteor.users.findByPendingForReview(options, this.userId, secureFields);
      },
      children: [
        {
          find: function getReviewer(user) {
            return Meteor.users.find({reviewing: user._id}, secureFields);
          }
        }
      ]
    };

  }
  return undefined;
});

Meteor.publish('onePendingReview', function(searchValue) {
  if (Roles.userIsInRole(this.userId, ['customerService', 'investigator'])) {
    const role = Meteor.users.getFirstRole(this.userId);
    return Meteor.users.findOnePendingForReviewByExactSearch(searchValue, secureUserOptionsByRole({}, role));
  }
  return undefined;
});

const getUpline = function(user) {
  if (user.isPartner()) {
    return undefined;
  }
  // Only these fields are needed for the upline functionality in the users with same birthdate publication,
  // because they are only used to get the branchPartner, so there's no need to get the secureUserOptionsByRole object.
  const options = {
    fields: {
      "emails": 1,
      "roles": 1,
      "personalInformation.name": 1,
      "personalInformation.surname": 1,
      "personalInformation.originatorId": 1,
      "personalInformation.distlevel": 1,
    }
  };
  return Meteor.users.find({_id: user.originatorId()}, options);
};

Meteor.publishComposite('currentlyReviewing', function() {
  if (Roles.userIsInRole(this.userId, Meteor.users.getComplianceRoles().concat(['customerService', 'investigator']))) {
    const role = Meteor.users.getFirstRole(this.userId);
    const loggedInUserId = this.userId;
    return {
      find: function() { // buyer
        const buyerId = Meteor.users.findOne(this.userId).reviewing;
        return Meteor.users.find({_id: buyerId}, secureUserOptionsByRole({}, role));
      },
      children: [
        {
          find: function getTickets(user) {
            if (!user.isBuyer) return null;
            return InvoiceTickets.find({buyerId: user._id}, secureInvoicesOptionsByRole({}, role));
          }
        }, {
          find: function getFiles(user) {
            if (!user.isBuyer) return null;
            Logger.info("currentlyReviewing getFiles",
              "UserId", user._id,
              "Number of files", Files.find({userId: user._id}).count());
            return Files.find({userId: user._id});
          },
        }, {
          find: function getIddocs(user) {
            if (!user.isBuyer) return null;
            return Iddocs.find({userId: user._id});
          },
        }, {
          find: function getWithSameBirthdate(user) {
            if (!Roles.userIsInRole(loggedInUserId, 'compliance')) return null;
            const reviewableRoles = Meteor.users.getClientRoles();
            if (!Roles.userIsInRole(user._id, reviewableRoles)) return null;

            // The query is limited to 100 to avoid performance issues in test environment. We assume there won't be that many cases in production.
            const queryOptions = secureUserOptionsByRole({limit: 100}, role);
            return Meteor.users.find({
              "personalInformation.birthdate": user.personalInformation.birthdate,
              _id: {$ne: user._id},
              roles: { $in: reviewableRoles }
            }, queryOptions);
          },
          children: [{
            // This section is needed in the getWithSameBirthdate query because the screen shows
            // the originator and the branch partner, so these fields must be published.
            // This is only used in the Same Birthdate feature.
            find: getUpline, children: [{ // Tier 3
              find: getUpline, children: [{ // Tier 2
                find: getUpline, children: [{ // Tier 1
                  find: getUpline // Partner
                }]
              }]
            }]
          }]
        }, {
          // This section will return the originator and the branch parent of the 'currentlyReviewing'
          // publication. Only the user under review is affected.
          find: getUpline, children: [{ // Tier 3
            find: getUpline, children: [{ // Tier 2
              find: getUpline, children: [{ // Tier 1
                find: getUpline // Partner
              }]
            }]
          }]
        },
      ],
    };
  }
  return undefined;
});

Meteor.publishComposite('buyers', function(limit) {
  check(limit, Match.Integer);
  if (Roles.userIsInRole(this.userId, ['distributor', 'admin'])) {
    // Only return data for distributors & admins
    const user = Meteor.users.findOne(this.userId);
    const role = Meteor.users.getFirstRole(this.userId);
    if (!user) return this.ready();

    const buyersFieldsWhiteList = {
      emails: 1,
      "personalInformation.name": 1,
      "personalInformation.surname": 1,
      "personalInformation.status": 1,
      "personalInformation.originatorId": 1,
      roles: 1
    };

    // Aggregate the users buyers & tickets
    return {
      find: function() {
        return user.buyers(limit, { fields:  buyersFieldsWhiteList });
      },
      children: [
        {
          find: function getInvoiceTickets(buyer) {
            return InvoiceTickets.find({buyerId: buyer._id}, secureInvoicesOptionsByRole({}, role));
          },
        }
      ]
    };
  }
  return null;
});

Meteor.publish('investigatorUnderInvestigation', function() {
  if (Roles.userIsInRole(this.userId, ['investigator'])) {
    const role = Meteor.users.getFirstRole(this.userId);
    const selector = { roles: ['distributor'], 'personalInformation.isUnderInvestigation': true };
    return Meteor.users.find(selector, secureUserOptionsByRole({}, role));
  }
  return undefined;
});

Meteor.publish('commissions', function(limit) {
  check(limit, Match.Integer);
  if (Roles.userIsInRole(this.userId, ['distributor', 'admin'])) {
    // Only return data for distributors & admins
    const user = Meteor.users.findOne(this.userId);
    const options = secureCommissionsOptions({limit: limit});
    return Commissions.find({distributorId: user._id}, options);
  } else {
    // Do not publish anything
    this.ready();
    return null;
  }
});

const convertToCents = function(product) {
  return product * dollarsPerProduct;
};

Meteor.publish('salesTotals', function() {
  if (Roles.userIsInRole(this.userId, ['admin', 'sysop'])) {
    const tranche = Meteor.settings.public.salesLimits.currentTranche;
    const role = Meteor.users.getFirstRole(this.userId);
    let cursorAp = InvoiceTickets.find({
      state: {$in: paidStates},
      tranche: tranche
    }, secureInvoicesOptionsByRole({}, role));
    let cursorAi = InvoiceTickets.find({
      state: {$in: invoicedStates},
      tranche: tranche
    }, secureInvoicesOptionsByRole({}, role));
    publishSum(this, cursorAi, 'aiTotalCents', 'centsRequested');
    publishSum(this, cursorAp, 'apTotalCents', 'productAmount', convertToCents);
  }
});

Meteor.publish('jobs', function() {
  if (Roles.userIsInRole(this.userId, ['sysop'])) {
    return Jobs.find({}, secureJobsOptionsByRole({}, 'sysop'));
  }
  return null;
});

Meteor.publishWithTransform("invoicesByBuyerId",
  function() {
    if (!Roles.userIsInRole(this.userId, ['buyer'])) return undefined;
    const role = Meteor.users.getFirstRole(this.userId);
    const opts = secureInvoicesOptionsByRole({}, role);
    // changelog, productPasscode and productPasscodeHash are added to the record to make the transformation,
    // Then in the callback they are removed, so in the end they do not make it to the client.
    opts.fields.changelog = 1;
    opts.fields.productPasscode = 1;
    opts.fields.productPasscodeHash = 1;
    return InvoiceTickets.findByUser(this.userId, opts);
  }, function(doc) {
    doc.productPasscodeGenerations = doc.changelog ? _.filter(doc.changelog, (it) => { return it.field === 'productPasscodeHash'; }).length : 0;
    doc.canRegeneratePRODUCTPasscode = (_.has(doc, 'productPasscode') || _.has(doc, 'productPasscodeHash'));
    // Here both fields are removed from the record before it is published.
    return _.omit(doc, ['changelog', 'productPasscode', 'productPasscodeHash']);
  }
);
