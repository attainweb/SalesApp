TemplateController('searchBar', {

  props: new SimpleSchema({
    categories: {
      type: [Object],
      blackbox: true,
      defaultValue: [],
      minCount: 0
    },
    selectedCategory: {
      type: Object,
      blackbox: true
    },
    value: {
      type: String,
      defaultValue: ''
    },
    onSearchSubmitted: {
      type: Function
    },
  }),

  private: {
    selectCategoryByIndex: function(index) {
      this.props.selectedCategory = this.props.categories[index];
    }
  },

  helpers: {
    hasCategories() {
      return this.props.searchCategories.length > 0;
    }
  },

  events: {
    'click .select-search-category'(event) {
      this.selectCategoryByIndex(event.target.dataset.category);
      const inputValue = this.$(".inputSearchValue");
      inputValue.val('');
      inputValue.focus();
    },

    'keyup .input-search-value'(event) {
      if (event.keyCode === 13) { // ENTER key
        const value = event.target.value;
        this.props.onSearchSubmitted(this.props.selectedCategory, value);
      }
    }
  }

});
