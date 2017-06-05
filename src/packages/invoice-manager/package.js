Package.describe({
  name: 'sales:invoice-manager',
  version: '0.1.0',
  summary: 'Invoice manager api for sales app',
});

Package.onUse(function(api) {

  api.versionsFrom('1.2.1');

  api.use([
    'meteor-base',
    'ecmascript',
    'check'
  ]);

  api.addFiles([
    'source/namespace.js',
    'source/calculate_order_fulfillment_amount.js'
  ], 'server');

  api.export('InvoiceManager');

});

Package.onTest(function(api) {

  api.use([
    'ecmascript',
    'sales:invoice-manager',
    'practicalmeteor:munit@2.1.5'
  ]);

  api.addFiles([
    'tests/calculate_order_fulfillment_amount.spec.js'
  ], 'server');

});
