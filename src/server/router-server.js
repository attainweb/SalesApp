import API from './lib/_api-definition.js';
import Logger from '/imports/server/lib/logger';

const tokenAuthenticate = function(request, response) {
  const authToken = request.headers['authorization'];
  if (!authToken || authToken !== Meteor.settings.SALES_APP_AUTH_API_TOKEN) {
    Logger.error('Token Authorization error');
    response.statusCode = 401;
    response.end('Token Authorization error');
    return undefined;
  }
  return authToken;
};

Router.map(function map() {

  this.route('exportPaidInvoiceFile', {
    'path': '/invoice-management/paymentExport/:id',
    'where': 'server',
    'action': API.exportPaidInvoiceFile,
  });

  this.route('holdingWalletReceivedBtc', {
    'path': '/api/holdingWalletReceivedBtc',
    'where': 'server',
    'action': API.holdingWalletReceivedBtc
  });

  this.route('invoiceAddressReceivedBtc', {
    'path': '/api/invoiceAddressReceivedBtc',
    'where': 'server',
    'action': API.invoiceAddressReceivedBtc
  });

  this.route('commissionsMovedToWallet', {
    'path': '/api/commissionsMovedToWallet',
    'where': 'server',
    'action': API.commissionsMovedToWallet
  });

  this.route('commissionsPaid', {
    'path': '/api/commissionsPaid',
    'where': 'server',
    'action': API.commissionsPaid
  });

  this.route('setInvoiceTicketPiiHash', {
    'path': '/api/setInvoiceTicketPiiHash',
    'where': 'server',
    'action': function() {
      const verifiedToken = tokenAuthenticate(this.request, this.response);
      if (verifiedToken) {
        API.setInvoiceTicketPiiHash.bind(this)();
      }
    }
  });

  this.route('setTicketVended', {
    'path': '/api/setTicketVended',
    'where': 'server',
    'action': function() {
      const verifiedToken = tokenAuthenticate(this.request, this.response);
      if (verifiedToken) {
        API.setInvoiceTicketAsVended.bind(this)();
      }
    }
  });
});
