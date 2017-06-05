TemplateController("currency_amount_input", {
  props: new SimpleSchema({
    currencyIcon: {
      type: String,
      optional: true,
      defaultValue: null
    },

    label: {
      type: String,
      optional: true,
      defaultValue: null
    },

    textIcon: {
      type: String,
      optional: true,
      defaultValue: null
    },

    min: {
      type: Number,
      decimal: true,
      optional: true,
      defaultValue: null

    },

    step: {
      type: Number,
      decimal: true,
      optional: true,
      defaultValue: null
    },

    onValidData: {
      type: Function
    },

    onInvalidData: {
      type: Function
    }
  }),

  onCreated() {
    this.onValueChanged = _.debounce(this._onValueChanged, 100);
  },

  private: {
    _onValueChanged(value) {
      const parsed = parseFloat(value);

      if (!isNaN(parsed) && parsed > 0) {
        this.props.onValidData(parsed);
      } else {
        this.props.onInvalidData(parsed);
      }
    }
  },

  helpers: {
    showAddon() {
      return this.props.currencyIcon !== null || this.props.textIcon !== null;
    }
  },

  events: {
    'keyup .form-control, mouseup .form-control'(event) {
      this.onValueChanged(event.target.value);
    }
  }

});
