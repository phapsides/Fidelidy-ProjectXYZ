define( [
    'jquery',
    'underscore',
    'owlCarousel',
    'matchHeight'
], function( $, _, owlCarousel, matchHeight ) {

    // Handles the functionality of the choose a fund section
    // that appears in multiple places throughout the site. We chose not to use
    // a Marionette view with ajax loaded template so that the package info can be
    // indexed by search engines

    // When a package is selected, its additional information including past
    // performance is loaded using ajax from html files in the funds-info
    // folder

    var funds = {
        carouselActive      : false,
        fundBoxes           : $( '.funds-box' ),
        fundInfoContainer   : $( '.funds-info' ),
        fundSpinner         : $( '.spinner' ),
        activeFundsContainer: $( '.funds-container.funds-container--active' ),
        activeFundBoxes     : $( '.funds-container.funds-container--active' ).find( '.funds-box' ),

        checkCarousel       : checkCarousel,
        carouselChanged     : carouselChanged,
        selectFund          : selectFund,
        setFundActive       : setFundActive,
        getStartPosition    : getStartPosition
    };


    // Match heights on the fund boxs
    setTimeout( function() {
        funds.fundBoxes.matchHeight( true );
    }, 100 );

    /**
     * On clicking a fund-select button mark the fund as selected
     */
    $( 'body' ).on( 'click', '.funds-select', function( event ) {
        event.preventDefault();
        funds.selectFund( $( event.currentTarget ) );
    } );

    /**
     * On clicking a funds-open button call the onOpenWithFund callback
     * if it has been set and is a function
     */
    $( 'body' ).on( 'click', '.funds-open', function( event ) {
        event.preventDefault();

        if ( typeof funds.onOpenWithFund === 'function' ) {
            funds.onOpenWithFund( $( event.currentTarget ) );
        }
    } );

    /**
     * On clicking a account-fund-open button call the onOpenWithFund callback
     * if it has been set and is a function. This button is only visible the types
     * of investment pages
     */
    $( 'body' ).on( 'click', '.account-fund-open', function( event ) {
        event.preventDefault();

        if ( typeof funds.onOpenWithFund === 'function' ) {
            funds.onOpenWithFund( $( event.currentTarget ) );
        }
    } );

    /**
     * When the windows is resized check to see if carosel needs to be Initialised
     * for smaller screens
     */
    $( window ).on( 'resize', function() {
        _.throttle( funds.checkCarousel(), 33 );
    } );

    /**
     * Initialise the carousel if we are at a mobile screen size
     */
    function checkCarousel() {
        $.fn.matchHeight._update();
        var zindex = $( '.responsive' ).css( 'z-index' );

        // If we are on a tablet or mobile initialise the carousel
        if ( zindex <= 3 ) {

            if ( !$( '.owl-carousel' ).hasClass( 'funds-container--active' ) ) {
                // Remove the Carousel
                funds.activeFundsContainer.trigger( 'destroy.owl.carousel' );
                funds.activeFundsContainer.addClass( 'grid' );
                funds.activeFundsContainer.removeClass( 'owl-carousel owl-theme' );

                // Add back in the dots if needed
                if ( $( '#funds-dots' ).length < 1 ) {
                    $( '.funds-container' ).eq( 0 ).before( '<div id="funds-dots" class="owl-dots funds-dots rhythm-m-1"></div>' );
                }

                $.fn.matchHeight._update();

                funds.carouselActive = false;
            }

            funds.activeFundsContainer = $( '.funds-container.funds-container--active' );
            funds.activeFundBoxes      = funds.activeFundsContainer.find( '.funds-box' );

            var startPosition = funds.getStartPosition();

            if ( !funds.carouselActive ) {

                // Remove grid and add carousel class
                funds.activeFundsContainer.removeClass( 'grid' );
                funds.activeFundsContainer.addClass( 'owl-carousel owl-theme' );

                funds.activeFundsContainer.owlCarousel( {
                    items: 1,
                    margin: 20,
                    dots: true,
                    center: true,
                    startPosition: startPosition,
                    onDragged: funds.carouselChanged,
                    onInitialized: function() {
                        $.fn.matchHeight._update();
                        funds.carouselActive = true;
                    },
                    dotsContainer: '#funds-dots'
                } );

            }
        } else if ( funds.carouselActive ) {
            // Remove the Carousel
            funds.activeFundsContainer.trigger( 'destroy.owl.carousel' );
            funds.activeFundsContainer.addClass( 'grid' );
            funds.activeFundsContainer.removeClass( 'owl-carousel owl-theme' );

            $.fn.matchHeight._update();

            funds.carouselActive = false;
        }
    }

    /**
     * Called when the carousel is interacted with and changed
     */
    function carouselChanged( event ) {
        // If an option has already been selected, the middle carousel item
        // should become the newly selected fund
        if ( $( '.funds-box--selected' ).length > 0 ) {
            var newActiveFundBox       = funds.activeFundBoxes.eq( event.item.index );
            var newActiveSelectFundBtn = newActiveFundBox.find( '.funds-select' );

            funds.selectFund( newActiveSelectFundBtn );
        }
    }

    /**
     * Selects a fund based upon the select button pressed
     * @param  jQuery Object selectButton The fund button that has been pressed
     */
    function selectFund( selectButton ) {

        // If not already selected load in the content
        if ( !selectButton.hasClass( 'funds-select--selected' ) ) {

            // Set the button to its active state
            funds.setFundActive( selectButton );

            // If was not selected before
            if ( funds.fundInfoContainer.hasClass( 'hidden' ) ) {
                // Show spinner
                funds.fundSpinner.removeClass( 'hidden' );
                // Load content
                funds.fundInfoContainer.load( selectButton.attr( 'href' ) + '?' + new Date().getTime(), function() {
                    // Hide spinner
                    funds.fundSpinner.addClass( 'hidden' );
                    // Fade in content
                    funds.fundInfoContainer.removeClass( 'hidden' ).addClass( 'animate--fadeInUp' );

                } );
            // If selected before
            } else {
                // Fade out
                funds.fundInfoContainer.removeClass( 'animate--fadeInUp' ).addClass( 'animate--fadeOut' );
                // Wait for it to fade out
                funds.fundInfoContainer.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    // Hide the container
                    funds.fundInfoContainer.addClass( 'hidden' );
                    // Show spinner
                    funds.fundSpinner.removeClass( 'hidden' );
                    // Empty the container
                    funds.fundInfoContainer.empty();
                    // Load in the template
                    funds.fundInfoContainer.load( selectButton.attr( 'href' ), function() {
                        setTimeout( function() {
                            // Hide spinner
                            funds.fundSpinner.addClass( 'hidden' );
                            // Unbind the event ( weird )
                            funds.fundInfoContainer.off( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend' );
                            // Fade in content
                            funds.fundInfoContainer.removeClass( 'animate--fadeOut hidden' ).addClass( 'animate--fadeInUp' );
                        }, 200 );
                    } );
                } );

                // If we are on an older version of ie we can't use the animation end events
                // so we need a fallback
                if ( $( 'body' ).hasClass( 'oldie' ) ) {
                    // Hide the container
                    funds.fundInfoContainer.addClass( 'hidden' );
                    // Show spinner
                    funds.fundSpinner.removeClass( 'hidden' );
                    // Empty the container
                    funds.fundInfoContainer.empty();
                    // Load in the template
                    funds.fundInfoContainer.load( selectButton.attr( 'href' ), function() {
                        setTimeout( function() {
                            // Hide spinner
                            funds.fundSpinner.addClass( 'hidden' );
                            // Unbind the event ( weird )
                            funds.fundInfoContainer.off( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend' );
                            // Fade in content
                            funds.fundInfoContainer.removeClass( 'animate--fadeOut hidden' ).addClass( 'animate--fadeInUp' );
                        }, 200 );
                    } );
                }

            }
        }
    }

    /**
     * Sets a fund select button to its active state, and removes the active
     * state from any other select buttons
     * @method selectButtonActive
     * @param  jQuery Object           selectButton
     */
    function setFundActive( selectButton ) {
        // Remove the active state from other fund boxs
        funds.fundBoxes.removeClass( 'funds-box--selected' );

        // Remove active state from other buttons
        $( '.funds-select' ).removeClass( 'funds-select--selected btn--green-1' ).addClass( 'btn--orange-3' );
        $( '.funds-select .btn__icon' ).removeClass( 'icon-tick' ).addClass( 'icon-down-arrow' );

        // Add the active state to this buttons parent select box
        selectButton.closest( '.funds-box' ).addClass( 'funds-box--selected' );

        // Add the active state to this button
        selectButton.removeClass( 'btn--orange-3' ).addClass( 'funds-select--selected btn--green-1' );
        selectButton.find( '.btn__icon' ).addClass( 'icon-tick' ).removeClass( 'icon-down-arrow' );
    }

    /**
     * Looks through the active packages and if one has already been selected
     * it will be used as the start position for the carousel
     * @method getStartPosition
     * @return Int
     */
    function getStartPosition() {

        var startPos = 0;

        funds.activeFundBoxes.each( function( index, value ) {
            if ( $( this ).hasClass( 'funds-box--selected' ) ) {
                startPos = index;
            }
        } );

        return startPos;
    }

    return funds;

} );
