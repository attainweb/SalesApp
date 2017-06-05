TemplateController('investigatorTabs', {
  props: new SimpleSchema({
    selected: {
      type: String
    },
    onTabChanged: {
      type: Function
    },
    counts: {
      type: Object,
      blackbox: true
    }
  }),
  helpers: {
    isSelected: function() {
      return (tab) => this.props.selected === tab;
    },
    onTabSelected: function() {
      return (tabClicked) => this.props.onTabChanged(tabClicked);
    },
    getCountValue() {
      return (tab) => this.props.counts[tab];
    }
  }
});
