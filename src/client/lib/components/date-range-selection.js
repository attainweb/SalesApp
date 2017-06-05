TemplateController('dateRangeSelection', {

  props: new SimpleSchema({
    locale: {
      type: String,
      optional: true,
      defaultValue: moment.locale()
    },
    format: {
      type: String,
      optional: true
    },
    selectedRange: {
      type: Object
    },
    'selectedRange.startDate': {
      type: Date,
      optional: true
    },
    'selectedRange.endDate': {
      type: Date,
      optional: true
    },
    onSelectionChanged: {
      type: Function
    }
  }),

  state: {
    maxStartDate: null,
    minEndDate: null
  },

  onRendered() {
    this.autorun(() => {
      const endDate = this.props.selectedRange.endDate;
      this.state.maxStartDate = endDate || new Date();
      const startDate = this.props.selectedRange.startDate;
      if (startDate !== undefined) this.state.minEndDate = startDate;
    });
  },

  helpers: {
    startDateChangedHandler() {
      return (newDate) => {
        this.state.minEndDate = newDate;
        const newRange = _.merge(this.props.selectedRange, { startDate: newDate });
        this.props.onSelectionChanged(newRange);
      };
    },
    endDateChangedHandler() {
      return (newDate) => {
        this.state.maxStartDate = newDate;
        const newRange = _.merge(this.props.selectedRange, { endDate: newDate });
        this.props.onSelectionChanged(newRange);
      };
    },
    today() {
      return moment().toDate();
    },
    from() {
      return i18n("dateRange.from");
    },
    to() {
      return i18n("dateRange.to");
    }
  }
});
