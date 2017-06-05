TemplateController('multiple_choice_selection', {

  props: new SimpleSchema({
    selection: {
      type: Object,
      blackbox: true
    },
    template: {
      type: String
    },
    onSelectionChanged: {
      type: Function
    }
  }),

  helpers: {
    api() {
      const self = this;
      return {
        selection: this.props.selection,
        isSelected() {
          return (value) => self.props.selection[value];
        },
        onItemToggled() {
          return (value) => {
            let selection = self.props.selection;
            selection[value] = !selection[value];
            self.props.onSelectionChanged(selection);
          };
        }
      };
    }
  }
});
