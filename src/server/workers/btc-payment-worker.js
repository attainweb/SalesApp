'use strict';

import { Jobs } from '/lib/collections/jobs.js';
import Logger from '/imports/server/lib/logger';
import { updateBtcPaymentData} from '/imports/server/invoice-tickets/update-btc-payment-data.js';

/* post: (retro compatible with top context: misc_methods)
    if all right, return: {"USD": {"last": price}}
    else return {}
*/
const getBtcPriceFromBackend = function() {
  const currencyCode = "USD";
  let btcPrice = {};
  try {
    const result = Meteor.Backend.getsRatePrices(currencyCode);
    const backendProvidersPriceResult = result && result.data;
    if (backendProvidersPriceResult) {
      btcPrice = getUpdatedBtcPrice(Meteor.settings.btcPriceCriteria.providersRanking,
        Meteor.settings.btcPriceCriteria.outdatedMaxToleranceInMinutes,
        backendProvidersPriceResult);
    } else {
      Logger.error('[Error]: btc price: cannot get providers from backend ', backendProvidersPriceResult);
      btcPrice = {};
    }
  } catch (exeption) {
    Logger.error('[Error]: btc price: ', exeption);
    btcPrice = {};
  }
  return btcPrice;
};

// post: return example: {"USD": {"last": 466.34}}
const getBtcPrice = function(providerPrice) {
  const retroCompatibleFormat = 'last';
  let price = {};
  if (providerPrice) {
    price = {
      [providerPrice.currencyCode]: {
        [retroCompatibleFormat]: providerPrice.price
      }
    };
  }
  return price;
};

const getUpdatedBtcPrice = function(providersRanking, maxToleranceInMinutes, backendProvidersPriceResult) {
  let providerPriceUpToDate = null;
  // iterate from highest to lowest rankings
  providersRanking.forEach(provider => {
    if (!providerPriceUpToDate) {
      providerPriceUpToDate = getProviderPriceUpToDate(backendProvidersPriceResult, provider, maxToleranceInMinutes);
    }
  });
  return getBtcPrice(providerPriceUpToDate);
};

const priceIsUpToDate = function(outdatedMaxTolerance, lastUpdate) {
  const now = moment(new Date()).utc();
  const lasUpdateDate = moment.utc(lastUpdate);
  const difference = now.diff(lasUpdateDate, 'minutes');
  return difference <= outdatedMaxTolerance ? true : false;
};

const getProviderPriceUpToDate = function(providers, rankingProvider, maxToleranceInMinutes) {
  const provider = providers.find((providerIt) => {
    return providerIt.providerId === rankingProvider && priceIsUpToDate(maxToleranceInMinutes, providerIt.lastUpdate);
  });
  return provider;
};

Jobs.registerWorker({
  jobName: 'btcPaymentWorker',
  cursor() {
    return InvoiceTickets.find({
      state: 'invoiceSentBtc',
      $or: [{
        satoshisExpectedAt: {
          $lt: new Date()
        }
      }, {
        satoshisExpectedAt: {
          $exists: false
        }
      }],
    });
  },
  prepare() {
    return getBtcPriceFromBackend();
  },
  task(ticket, job, data) {
    updateBtcPaymentData({
      ticketId: ticket._id
    }, data);
  },
});
