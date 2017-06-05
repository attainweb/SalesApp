'use strict';

export const TimeFilterChecker = {};

/* To do: this "pre-check" method could be removed and
   directly check values in 'addTimeFilterIfChecked' using "if (Match.test(...))" instead.
   in order to keep the code more simple
*/

TimeFilterChecker.checkTimeFilter = (query) => {
  check(query.timeFilter, Object);
  const timeFilterPattern = {
    startDate: Match.Maybe(Date),
    endDate: Match.Maybe(Date)
  };
  check(query.timeFilter, timeFilterPattern);
};

TimeFilterChecker.addTimeFilterIfChecked = (selector, query) => {
  if (query.timeFilter) {
    let startDate = query.timeFilter.startDate;
    let endDate = query.timeFilter.endDate;
    if (startDate && endDate) {
      const dateSelector = {};
      startDate = moment(startDate);
      endDate = moment(endDate);
      if (startDate.isValid()) dateSelector.$gte = startDate.toDate();
      if (endDate.isValid()) dateSelector.$lt = endDate.add(1, 'days').toDate();
      selector.createdAt = dateSelector;
    }
  }
  return selector;
};

export const SearchFilterChecker = {};

/* To do: this "pre-check" method could be removed and
   directly use only the existed check in 'addSearchFilterIfChecked' instead.
   in order to keep the code more simple
*/

SearchFilterChecker.checkSearchFilter = (query) => {
  check(query.searchFilter, Object);
  const searchFilterPattern = {
    category: Match.Maybe(String),
    value: Match.Maybe(String)
  };
  check(query.searchFilter, searchFilterPattern);
};

SearchFilterChecker.addSearchFilterIfChecked = (selector, query) => {
  if (Match.test(query.searchFilter, { value: String, category: String })) {
    let regfilter = new RegExp('^' + query.searchFilter.value);
    selector[query.searchFilter.category] = regfilter;
  }
  return selector;
};

export const SortAndLimitChecker = {};

SortAndLimitChecker.addSortAndLimitIfChecked = (query) => {
  const options = {};
  if (Match.test(query.sortField, { by: String, order: Number } )) {
    options.sort = {};
    const field = query.sortField.by;
    const order = query.sortField.order;
    options.sort[field] = order;
  }
  if (Match.test(query.limit, Number)) options.limit = query.limit;
  return options;
};

