import { i18nAlert } from '/imports/client/i18n-alert';
const I18N_ERROR_NAMESPACE = 'exportPaidInvoices';

TemplateController('bundleTicketActionFinalize', {
  state: {
    MIN_VALUE: 0.01,
    STEP: 0.000000001,
    btcUsd: 0,
    btcJpy: 0,
    jpyUsd: 0,
    paymentStrategy: 'YEN'
  },
  private: {
    hasRequiredFieldForYENStrategy() {
      return this.state.btcUsd >= this.state.MIN_VALUE &&
        this.state.btcJpy >= this.state.MIN_VALUE;
    },
    hasRequiredFieldForUSDStrategy() {
      return this.state.btcUsd >= this.state.MIN_VALUE &&
        this.state.jpyUsd >= this.state.MIN_VALUE;
    },
    hasRequiredFields() {
      return this.hasRequiredFieldForYENStrategy() || this.hasRequiredFieldForUSDStrategy();
    },
    onValidAmount() {
      if (this.hasRequiredFields()) {
        this.$(".export-paid-invoice").prop('disabled', false);
      }
    },
    initYENStrategy() {
      this.state.paymentStrategy = 'YEN';
      this.state.btcUsd = 0;
      this.state.btcJpy = 0;
    },
    initUSDStrategy() {
      this.state.paymentStrategy = 'USD';
      this.state.btcUsd = 0;
      this.state.jpyUsd = 0;
    },
    setPaymentStrategy(strategy) {
      if (strategy === 'YEN') {
        this.initYENStrategy();
      } else if (strategy === 'USD') {
        this.initUSDStrategy();
      }
    },
    sendAlertRequiredFieldsMissing() {
      bootbox.alert(i18n('exportPaidInvoices.requiredFieldsMessage'));
    }
  },
  helpers: {
    finalizedPaymentsExportSchema() {
      return new SimpleSchema({
        jpyUsd: {
          type: Number,
          label: i18n('paymentExports.jpyUsd'),
          decimal: true,
        },
        btcJpy: {
          type: Number,
          label: i18n('paymentExports.btcJpy'),
          decimal: true,
          optional: true,
        },
        btcUsd: {
          type: Number,
          label: i18n('paymentExports.btcUsd'),
          decimal: true,
          optional: true,
        }
      });
    },
    minValue() {
      return this.state.MIN_VALUE;
    },
    step() {
      return this.state.STEP;
    },
    onValidAmountBtcUsd() {
      return amount => {
        this.onValidAmount();
        this.state.btcUsd = amount;
      };
    },
    onValidAmountBtcJpy() {
      return amount => {
        this.onValidAmount();
        this.state.btcJpy = amount;
      };
    },
    onValidAmountJpyUsd() {
      return amount => {
        this.onValidAmount();
        this.state.jpyUsd = amount;
      };
    },
    onInvalidAmount() {
      return () => {
        this.$(".export-paid-invoice").prop('disabled', true);
      };
    },
    isYENStrategy() {
      return this.state.paymentStrategy === 'YEN';
    },
    isUSDStrategy() {
      return this.state.paymentStrategy === 'USD';
    },
    getActivePillClass(pillName) {
      return this.state.paymentStrategy === pillName ? ' active' : ' ';
    }
  },
  events: {
    'click .set-strategy-button'(event) {
      event.preventDefault();
      strategy = event.target.dataset.strategy;
      this.setPaymentStrategy(strategy);
      this.$(".export-paid-invoice").prop('disabled', true);
    },
    'submit form'(event) {
      event.preventDefault();
      const params = {
        _id: this.data.ticketItem._id,
        paymentStrategy: this.state.paymentStrategy
      };

      if (this.state.paymentStrategy === 'USD') {
        if (!this.hasRequiredFieldForUSDStrategy()) {
          this.sendAlertRequiredFieldsMissing();
          return false;
        }
        params.btcUsd = this.state.btcUsd;
        params.jpyUsd = this.state.jpyUsd;

      } else if (this.state.paymentStrategy === 'YEN') {
        if (!this.hasRequiredFieldForYENStrategy) {
          this.sendAlertRequiredFieldsMissing();
          return false;
        }
        params.btcUsd = this.state.btcUsd;
        params.btcJpy = this.state.btcJpy;
      }
      const bundleCounterCallback = this.data.options.onActionGetCounterByBundleStateCb;
      Meteor.call('finalizePaymentsBundle', params, function finalizePaymentsBundle(err) {
        if (err) {
          i18nAlert(err, I18N_ERROR_NAMESPACE);
        } else {
          bundleCounterCallback(['bundling', 'export']);
        }
      });
      return true;
    }
  }
});
