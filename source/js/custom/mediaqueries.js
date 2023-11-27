( function() {

  /**
   * Finds the current css breakpoint
   * @return String
   */
  window.checkBreakpoint = function() {
    var mediaQueryElement = document.querySelector( '.js-mediaquery' );
    var zindex = window.getComputedStyle( mediaQueryElement ).getPropertyValue( 'z-index' );

    switch( zindex ) {
      case "0":
        return "small";
      case "1":
        return "medium";
      case "2":
        return "large";
      default:
        return "default";
    }
  };

} )();
