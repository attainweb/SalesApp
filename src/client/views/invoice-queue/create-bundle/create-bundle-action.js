import { invoiceManagerSubsManager } from '/client/views/invoice-queue/invoice-queue';
import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('createBundleAction', {
  onCreated() {
    this.autorun(() => {
      invoiceManagerSubsManager.subscribe('paidInvoicesTotal');
    });
  },
  helpers: {
    orders() {
      return Sums.getCount('paidInvoicesTotal');
    },
    amount() {
      return Helpers.formatCurrency('YEN', Sums.getSum('paidInvoicesTotal'));
    }
  },
  events: {
    'click .create-payments-bundle-button'() {
      const bundleCounterCallback = this.data.actionCallback.onActionGetCounterByBundleStateCb;
      const invoiceCounterCallback = this.data.actionCallback.onActionGetCounterByInvoiceStateCb;
      Meteor.call('createPaymentsBundle', function createPaymentsBundle(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
          console.error('[Error] createPaymentsBundle:', err);
        } else {
          bundleCounterCallback(['bundling']);
          invoiceCounterCallback(['currentBundle']);
        }
      });
    }
  }
});
