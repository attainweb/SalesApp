'use strict';
import Logger from '/imports/server/lib/logger';
import { finishReviewing } from '/imports/server/users/compliance.js';

const getUsdRequestedTotalByGroupId = function getUsdRequestedTotalByGroupId(buyer, groupId = {}) {
  const result = InvoiceTickets.aggregate([
    {
      $match: {
        buyerId: buyer._id,
        state: {
          $in: [
            "ticketFinalized",
            "saleStartedBank",
            "invoiceSentBank",
            "invoiceSentBtc",
            "invalidTicketApproved",
            "invalidFundsReceived",
            "satoshisReceived",
            "productPasscodeAssigned",
            "complianceApprovedBtc",
            "complianceApprovedBank",
            "fundsReceived",
            "fundsReceivedConfirmed",
            "fundsReceivedConfirmedSent",
            "ticketPrepared",
            "ticketBundled",
            "receiptSent",
            "started",
            "btcAddressAssigned",
            "waitingForSaleToStart",
            "saleStartedBtc"
          ]
        }
      }
    },
    {
      $group: {
        _id: groupId,
        totalCentsRequested: {
          $sum: "$centsRequested"
        }
      }
    },
    {
      $project: {
        totalUsdRequested: {$divide: ["$totalCentsRequested", 100]}
      }
    },
    {
      $sort: {
        "totalUsdRequested": -1
      }
    },
    {
      $limit: 1
    }
  ]);

  return (result && result[0] && result[0].totalUsdRequested) || 0;
};

const getPurchaseTotal = function(buyer) {
  const usdRequestedTotal = getUsdRequestedTotalByGroupId(buyer);
  Logger.info("[Info - getMaxPurchaseTotal ]", `For Buyer[${buyer._id}]`, `The Max purchase total is: ${usdRequestedTotal}`);
  return usdRequestedTotal;
};

const getMaxPurchaseTotalForAMonth = function(buyer) {
  const groupId = {
    month: {
      $month: "$createdAt"
    },
    year: {
      $year: "$createdAt"
    }
  };
  const usdRequestedTotal = getUsdRequestedTotalByGroupId(buyer, groupId);
  Logger.info("[Info - getMaxPurchaseTotalForAMonth ]", `For Buyer[${buyer._id}]`, `The Max purchase total for a month is: ${usdRequestedTotal}`);
  return usdRequestedTotal;
};

const getMaxPurchaseTotalForADay = function(buyer) {
  const groupId = {
    month: {
      $month: "$createdAt"
    },
    day: {
      $dayOfMonth: "$createdAt"
    },
    year: {
      $year: "$createdAt"
    }
  };
  const usdRequestedTotal = getUsdRequestedTotalByGroupId(buyer, groupId);
  Logger.info("[Info - getMaxPurchaseTotalForADay ]", `For Buyer[${buyer._id}]`, `The Max purchase total for a day is: ${usdRequestedTotal}`);
  return usdRequestedTotal;
};

const getPurchaseTotals = function(buyer) {
  return {
    daily: getMaxPurchaseTotalForADay(buyer),
    monthly: getMaxPurchaseTotalForAMonth(buyer),
    total: getPurchaseTotal(buyer),
  };
};

// Personal (values in usdRequested)
// 1: < 4,800 daily   / < 24,000 monthly  / < 800,000 total
// 2: unlimited daily / < 80,000 monthly  / < 800,000 total
// 3: unlimited daily / unlimited monthly / < 800,000 total
// 4: < (800,000 + 500,000) total
// repeat 10 times more... tier N: < ((max for tier N-1) + 500,000) total || ie. 5: < ((max for tier 4) + 500,000) total
// tier 4 + 10: unlimited total

// Business
// 1: < 4,800 daily   / < 24,000 monthly
// 2: unlimited daily / < 80,000 monthly
// 3: unlimited daily / unlimited monthly / < 500,000 total
// Repeat 10 times more... tier N: < ((max for tier N-1) + 500,000) total || ie. 4: > ((max for tier 3) + 500,000) total
// tier 3 + 10: unlimited total

const maxComplianceLevel = 14;

const accountTypePeriodLimitLevelMap = {
  personal: {
    daily:   [[4800,    2]],
    monthly: [[24000,   2], [80000, 3]],
    total:   [[800000,  4],
              [1300000, 5],
              [1800000, 6],
              [2300000, 7],
              [2800000, 8],
              [3300000, 9],
              [3800000, 10],
              [4300000, 11],
              [4800000, 12],
              [5300000, 13],
              [5800000, 14]],
  },

  company: {
    daily:   [[4800,    2]],
    monthly: [[24000,   2], [80000, 3]],
    total:   [[500000,  4],
              [1000000, 5],
              [1500000, 6],
              [2000000, 7],
              [2500000, 8],
              [3000000, 9],
              [3500000, 10],
              [4000000, 11],
              [4500000, 12],
              [5000000, 13]],
  },
};

export const getRequiredLevel = function(accountType, purchaseTotals) {
  const periods = ['total', 'monthly', 'daily'];
  const periodLimitLevelMapByAccountType = accountTypePeriodLimitLevelMap[accountType];

  let periodRequiredLevels = [];
  let requiredLevels = periods.map(function(period) {
    if (_.isObject(periodLimitLevelMapByAccountType)) {
      const purchaseTotal = purchaseTotals[period];
      const limitLevels   = periodLimitLevelMapByAccountType[period];

      periodRequiredLevels = limitLevels.map(function(limitLevel) {
        const limit = limitLevel[0];
        const level = limitLevel[1];
        return purchaseTotal >= limit ? level : false;
      });
    } else {
      return maxComplianceLevel;
    }
    return lodash.compact(periodRequiredLevels);
  });

  requiredLevels = lodash.flatten(requiredLevels);
  requiredLevels.push(1); // default to 1;
  const requiredLevel = lodash.max(requiredLevels);
  return requiredLevel;
};

export const requiredComplianceLevel = function(buyer) {
  return getRequiredLevel(buyer.accountType(), getPurchaseTotals(buyer));
};

export const isCompliant = function(buyer) {
  let currentLevel = buyer.complianceLevel();
  if (_.isUndefined(currentLevel)) currentLevel = 0;
  return currentLevel >= requiredComplianceLevel(buyer);
};

const removeReviewer = function(buyerId) {
  const officer = Meteor.users.findOne({reviewing: buyerId});
  if (officer) {
    const numberOfUpdatedOfficers = officer && finishReviewing(officer._id);
    Logger.info('[recalculateBuyerComplianceLevel] - removeReviewer ', `officer[${officer._id}]`,
    `number of updated officer: ${numberOfUpdatedOfficers}`);
  }
};

export const recalculateBuyerComplianceLevel = (buyerId) => {
  Logger.info('[recalculateBuyerComplianceLevel] - starting', `buyer[${buyerId}]`);
  const buyer = Meteor.users.findOne(buyerId);

  if (!buyer) {
    Logger.info('[recalculateBuyerComplianceLevel] - error', `buyer[${buyerId}] not found!`);
    return undefined;
  }

  const requiredLevel = requiredComplianceLevel(buyer);
  const currentComplianceLevel = buyer.complianceLevel();

  Logger.info('[recalculateBuyerComplianceLevel] - compliance level', `buyer[${buyerId}]`,
  `old compliance level[${currentComplianceLevel}] VS. new compliance level[${requiredLevel}]`);
  if (buyer.isApproved()) {
    if (currentComplianceLevel < requiredLevel) {
      buyer.updateFields({
        'personalInformation.applyingForComplianceLevel': requiredLevel,
        'personalInformation.status': 'PENDING',
      });
      Logger.info('[recalculateBuyerComplianceLevel] - update status: Back to PENDING', `buyer[${buyerId}]`);
    }
  } else if (buyer.isPending()) {
    if (currentComplianceLevel < requiredLevel ) {
      buyer.updateFields({
        'personalInformation.applyingForComplianceLevel': requiredLevel,
      });
      Logger.info('[recalculateBuyerComplianceLevel] - update status: Still PENDING, but with new compliance level', `buyer[${buyerId}]`);
    } else {
      buyer.updateFields({
        'personalInformation.applyingForComplianceLevel': currentComplianceLevel,
      });
      Logger.info('[recalculateBuyerComplianceLevel] - update status: Still PENDING with the last approved compliance level', `buyer[${buyerId}]`);
    }
  }
  Logger.info('[recalculateBuyerComplianceLevel] - ok! ', `buyer[${buyerId}]`);
  return buyerId;
};
