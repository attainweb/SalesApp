// Backend methods
import Logger from '/imports/server/lib/logger';

Meteor.Backend = (function backendAPI() {
  const backendURL = process.env.COMPANY_BACKEND_SERVER_IP;
  const backendToken = process.env.COMPANY_BACKEND_TOKEN;

// options: {url, method, headers, data(data), callback function}

  const _makeRequest = function(options) {
    // check arguments
    try {
      return Meteor.http[options.method](options.url, { data: options.data, headers: options.headers }, options.cb);
    } catch (err) {
      Logger.info('Http Error: ' + err);
      return false;
    }
  };

  const _defaultHeaders = function() {
    const headers = {
      'data-Type': 'application/json',
      'Authorization': 'Bearer ' + backendToken
    };
    return headers;
  };

  // [POST v1/invoiceWallets]
  // Distributor Named Invoice Wallet
  const createWallet = function(distributorId, callback) {

    const distributor = Meteor.users.findOne({_id: distributorId});
    if (!distributor) {
      callback(new Meteor.Error(500, 'Can\'t find user with id ' + distributorId));
    }

    const seed = SHA256(distributorId + distributor.emails[0].address);

    const requestOptions = {
      url: backendURL + 'invoiceWallets',
      method: 'post',
      headers: _defaultHeaders(),
      data: {seed: seed, walletName: distributorId, backupXpub: ""},
      cb: callback
    };

    _makeRequest(requestOptions);
  };

  // [PUT /v1/invoiceWallets/{id}/newAddress]
  // Get Invoice Address - Each order will request an invoice address from the buyer's distributor's wallet.
  const getInvoiceAddress = function(invoiceTicketId, callback) {
    const ticket = InvoiceTickets.findOne(invoiceTicketId);
    const distributor = ticket.buyer().distributor();
    const invoiceWalletId = distributor.personalInformation.invoiceWalletId;

    if (!distributor) {
      callback(new Meteor.Error(500, 'Can\'t find a distributor with id:' + distributor._id));
    }

    const requestOptions = {
      url: backendURL + 'invoiceWallets/' + invoiceWalletId + '/newAddress',
      method: 'put',
      headers: _defaultHeaders(),
      data: {},
      cb: callback
    };

    _makeRequest(requestOptions);
  };

  // [PUT /v1/holdingWallet/newAddress]
  // The holding wallet is a single multisig HD wallet. Every bundle or batch of orders to be sent to the exchange will ask for a new address from the holding wallet.
  // Invoice manager will push button which will call function
  // Ask Meyer about Batch Data Structure
  const getHoldingWalletAddress = function(callback) {

    const requestOptions = {
      url: backendURL + 'holdingWallet/newAddress',
      method: 'put',
      headers: _defaultHeaders(),
      data: {},
      cb: callback
    };

    _makeRequest(requestOptions);

  };

  // [GET /v1/price/rates/currencyCode]
  // gets the rate prices according the currency code (for example: USD, JPY) from some providers (bitstamp, bitpay, etc)
  // (!) if callback is undefined, The method is called synchronously
  const getsRatePrices = function(currencyCode, callback) {
    const requestOptions = {
      url: backendURL + 'price/rates/' + currencyCode,
      method: 'get',
      headers: _defaultHeaders(true),
      data: {},
      cv: callback
    };

    return _makeRequest(requestOptions);
  };

  // set the response client-Id header and signs the payload
  // this way the back-end knows it's the sales-app who is indeed responding
  // returns the respond.end() promise
  const signResponse = function(response, payload) {

    const clientId = process.env.COMPANY_BACKEND_CLIENT_ID;
    const signature = process.env.COMPANY_BACKEND_SIGNATURE;

    response.setHeader("X-Client-Id", clientId);

    const payloadStr = JSON.stringify(payload);
    const salt = sjcl.random.randomWords('10', '0');
    const encryptedPayloadStr =  sjcl.encrypt(signature, payloadStr, { iter: 10000, ks: 256, "salt": salt });

    return response.end(encryptedPayloadStr);
  };

  return {
    createWallet: createWallet,
    getInvoiceAddress: getInvoiceAddress,
    getHoldingWalletAddress: getHoldingWalletAddress,
    getsRatePrices: getsRatePrices,
    signResponse: signResponse
  };
})();
