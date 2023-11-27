/**
 * Handles the global search bar functionality
 */
( function() {
  /**
   * Initialise the search bar
   */
  function initSearchBar() {

    var searchBar = $( '.main-nav__search' );
    var searchBox = $( '.search-box' );
    var searchSubmit = $( '.search-submit' );
    var desktopNav = $( '#desktop-nav' );
    var searchIcon = $( '.js-search-trigger .icon--search' );
    var closeIcon = $( '.js-search-trigger .icon--close' );
    var activeClass = 'search-bar--active';
    var leavingClass = 'animate--fade-out  animate--delay-2';
    var active = false;
    var removeTimeout;

    // Toggle the search when its trigger is clicked
    $( '.js-search-trigger' ).click( toggleSearch );

    // Close the search if the window is resized
    $( window ).resize( function() {
      if ( active ) {
        hideSearch();
      }
    } );

    // Submit the search on enter
    searchBox.keypress(function(e){
        if(e.which == 13){//Enter key pressed
            $('.search-submit').click();//Trigger search button click event
        }
    });

    /**
     * Toggle the search bar
     */
    function toggleSearch() {
      // Swap the icon
      $('.js-search-trigger .display').toggle();

      if ( !active ) {
        showSearch();
      } else {
        hideSearch();
      }
    }

    /**
     * Show the search bar
     */
    function showSearch() {
      searchBar.removeClass( leavingClass ).removeClass( 'hide' ).addClass( activeClass );
      searchBox.removeClass( 'animate--slide-out-right animate--delay-2' ).addClass( 'animate--slide-in-left  animate--delay-4' );
      searchSubmit.removeClass( 'animate--slide-out-right animate--delay-1' ).addClass( 'animate--slide-in-left animate--delay-3' );
      searchBar.find( '.animate--delay' ).removeClass( 'animate--slide-out-right' ).addClass( 'animate--slide-in-left' );
      searchBox.focus();
      searchIcon.addClass( 'hide' );
      closeIcon.removeClass( 'hide' );
      active = true;
      clearTimeout( removeTimeout );
    }

    /**
     * Hide the search bar
     */
    function hideSearch() {
      searchBar.removeClass( activeClass ).addClass( leavingClass );
      searchBox.removeClass( 'animate--slide-in-left animate--delay-4' ).addClass( 'animate--slide-out-right animate--delay-1' );
      searchSubmit.removeClass( 'animate--slide-in-left animate--delay-3' ).addClass( 'animate--slide-out-right animate--delay-2' );
      active = false;
      searchIcon.removeClass( 'hide' );
      closeIcon.addClass( 'hide' );
      removeTimeout = setTimeout( function() {
        searchBar.removeClass( leavingClass ).addClass( 'hide' );
      }, 600 );
    }
  }

  initSearchBar();
} )();
