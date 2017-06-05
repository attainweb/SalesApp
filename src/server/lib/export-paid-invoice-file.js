import Logger from '/imports/server/lib/logger';
import API from './_api-definition.js';

const exportPaidInvoiceFile = function() {
  Logger.info("[API.exportPaidInvoiceFile] - starting", this.request.headers);
  let fileData = '';
  let invoiceTicketFields = ['_id', 'invoiceNumber', 'btcAddress', 'yenReceived', 'satoshisExpected'];
  let paymentExportFields = ['jpyUsd', 'btcJpy', 'btcUsd', 'batchFulfillmentAmount', 'holdingWalletAddress'];

  try {
    check(this.params.id, String);
  } catch (exception) {
    errorMessage = 'received data is malformed, paymentsExport id: ' + this.params.id;
    Logger.error("[API.exportPaidInvoiceFile] - error:", errorMessage);
    throw new Meteor.Error(400, errorMessage);
  }
  const paymentExportId = this.params.id;
  Logger.info('[API.exportPaidInvoiceFile]: Requested payment export id:', paymentExportId);

  paymentExport = PaymentExports.findOne({'_id': paymentExportId});
  if (!paymentExport) {
    message = 'Requested paymentsExport not found';
    Logger.info('[API.exportPaidInvoiceFile]:', message);
    throw new Meteor.Error(400, message);
  } else if (!paymentExport.finalized) {
    message = 'Requested paymentsExport is not finalized';
    Logger.info('[API.exportPaidInvoiceFile]:', message);
    throw new Meteor.Error(401, message);
  }
  Logger.info('[API.exportPaidInvoiceFile]: Requested paymentsExport found! ', paymentExport);

  if (!paymentExport.btcJpy) lodash.pull(paymentExportFields, 'btcJpy');
  if (!paymentExport.btcUsd) lodash.pull(paymentExportFields, 'btcUsd');

  tickets = InvoiceTickets.find({ '_id': {'$in': paymentExport.invoiceTicketIds}}).fetch();
  if ( _.size(tickets) !== _.size(paymentExport.invoiceTicketIds)) {
    message = 'Count of tickets[' +  _.size(tickets) + '] and invoiceTicketIds[' + _.size(paymentExport.invoiceTicketIds) + '] does not match!';
    Logger.info('[API.exportPaidInvoiceFile]:', message);
    throw new Meteor.Error(400, message);
  }
  Logger.info('[API.exportPaidInvoiceFile]: tickets and invoiceTicketIds sizes match correctly!');

  const headers = {
    'Content-type': 'text/csv',
    'Content-Disposition': 'attachment; filename=' + paymentExportId + '.csv',
  };

  // Write header row
  _.each(invoiceTicketFields, function each(field) {
    fileData += field + ';';
  });
  _.each(paymentExportFields, function each(field) {
    fileData += field + ';';
  });
  fileData += '\n';
  Logger.info("[API.exportPaidInvoiceFile] - write header row ok!");

  // Write data rows
  _.each(tickets, function eachTicket(ticket) {
    _.each(invoiceTicketFields, function eachItField(field) {
      fileData += ticket[field] + ';';
    });
    _.each(paymentExportFields, function eachPeField(field) {
      fileData += paymentExport[field] + ';';
    });
    fileData += '\n';
  });
  Logger.info("[API.exportPaidInvoiceFile] - write data row ok!");

  this.response.writeHead(200, headers);

  Logger.info("[API.exportPaidInvoiceFile] - successfully!");
  return this.response.end(fileData);
};

API.exportPaidInvoiceFile = exportPaidInvoiceFile;
