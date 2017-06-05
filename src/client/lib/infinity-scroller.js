/**
 * Simple class for setting up a debounced infinity scrolling list.
 *
 * Handles the scroll listening and UI logic for checking if the user reached
 * the end of the list. Callbacks like `onScrolled` and `onIndicatorVisible` can
 * be used for implementing the corresponding data loading logic for each screen.
 *
 * @example:
 * const infinityScroller = new InfinityScroller('#wrapper', '.load-more-results', 200);
 * infinityScroller.start({
 *  onScrolled(scollPosition) { … }
 *  onIndicatorVisible(scollPosition) { …}
 * });
 * infinityScroller.stop();
 */
class InfinityScroller {

  constructor(wrapperSelector, indicatorSelector, debounceTime) {
    this._wrapperSelector = wrapperSelector;
    this._indicatorSelector = indicatorSelector;
    this._debounceTime = debounceTime;
  }

  start(options = {}) {
    this._onScroll = _.debounce(() => {
      let wrapper = $(this._wrapperSelector);
      let indicator = $(this._indicatorSelector);
      if (!wrapper.length || !indicator.length) return;
      let isIndicatorVisible = indicator.offset().top < $(window).height();
      let scrollPosition = wrapper.scrollTop();
      if (_.isFunction(options.onScrolled)) options.onScrolled(scrollPosition);
      if (isIndicatorVisible && _.isFunction(options.onIndicatorVisible)) {
        options.onIndicatorVisible(scrollPosition);
      }
    }, this._debounceTime);
    $(this._wrapperSelector).scroll(this._onScroll);
  }

  stop() {
    $(this._wrapperSelector).off('scroll', this._onScroll);
  }

}

this.InfinityScroller = InfinityScroller;
