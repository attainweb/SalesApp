TemplateController('datetime_picker', {

  props: new SimpleSchema({
    allowInputToggle: {
      type: Boolean,
      optional: true
    },
    dateValue: {
      type: Date,
      optional: true
    },
    format: {
      type: String,
      optional: true
    },
    locale: {
      type: String,
      optional: true,
      defaultValue: moment.locale()
    },
    minDate: {
      type: Date,
      optional: true
    },
    maxDate: {
      type: Date,
      optional: true
    },
    onDateChanged: {
      type: Function
    },
    placeholder: {
      type: String,
      optional: true
    },
    showTodayButton: {
      type: Boolean,
      optional: true
    },
    useCurrent: {
      type: Boolean,
      optional: true
    },
  }),

  state: {
    datetimepicker: null
  },

  onRendered() {
    const datetime = this.$('.datetimepicker').datetimepicker({
      icons: {
        time: 'fa fa-time',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash',
        close: 'fa fa-remove'
      }
    });
    this.state.datetimepicker = datetime;

    const datetimedata = datetime.data('DateTimePicker');
    this.autorun(() => {
      if (this.props.hasOwnProperty('locale')) {
        datetimedata.locale(this.props.locale);
      }
      if (this.props.hasOwnProperty('showTodayButton')) {
        datetimedata.showTodayButton(this.props.showTodayButton);
      }
      if (this.props.hasOwnProperty('allowInputToggle')) {
        datetimedata.allowInputToggle(this.props.allowInputToggle);
      }
      if (this.props.hasOwnProperty('useCurrent')) {
        datetimedata.useCurrent(this.props.useCurrent);
      }
      if (this.props.hasOwnProperty('format')) {
        datetimedata.format(this.props.format);
      }
      if (this.props.hasOwnProperty('dateValue') && this.props.dateValue) {
        datetimedata.date(moment(this.props.dateValue));
      }
      if (this.props.hasOwnProperty('maxDate') && this.props.maxDate) {
        datetimedata.maxDate(moment(this.props.maxDate));
      }
      if (this.props.hasOwnProperty('minDate') && this.props.minDate) {
        datetimedata.minDate(moment(this.props.minDate));
      }
    });
  },

  onDestroyed() {
    this.state.datetimepicker.data('DateTimePicker').destroy();
  },

  events: {
    'dp.change'(event) {
      const getDateOrUndefined = (dateValue) => {
        if (dateValue && dateValue !== null && dateValue !== undefined) {
          return dateValue.toDate();
        }
        return null;
      };
      this.props.onDateChanged(getDateOrUndefined(event.date), getDateOrUndefined(event.oldDate));
      event.preventDefault();
    }
  }
});
