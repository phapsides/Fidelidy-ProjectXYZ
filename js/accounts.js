define( [
    'jquery',
    'underscore',
    'owlCarousel',
    'matchHeight'
], function( $, _, owlCarousel, matchHeight ) {

    // Handles the functionality of the open and account section
    // that appears on the learn page. We chose not to use
    // a Marionette view with ajax loaded template so that the account info can be
    // indexed by search engines

    var accounts = {
        carouselActive      : false,
        accountsBoxes       : $( '.accounts-box' ),
        accountsContainer   : $( '.accounts-container' ),
        accountsInfo        : $( '.accounts-info' ),

        checkCarousel       : checkCarousel,
        carouselChanged     : carouselChanged,
        selectAccount       : selectAccount,
        setAccountActive    : setAccountActive,
        getStartPosition    : getStartPosition
    };


    // Match heights on the account boxs
    accounts.accountsBoxes.matchHeight();

    /**
     * On clicking a accounts-select button mark the account as selected
     */
    $( 'body' ).on( 'click', '.accounts-select', function( event ) {
        event.preventDefault();
        accounts.selectAccount( $( event.currentTarget ) );
    } );

    /**
     * On clicking a accounts-open button call the onOpenWithAccount callback
     * if it has been set and is a function
     */
    $( 'body' ).on( 'click', '.accounts-open', function( event ) {
        event.preventDefault();

        if ( typeof accounts.onOpenWithAccount === 'function' ) {
            accounts.onOpenWithAccount( $( event.currentTarget ) );
        }
    } );

    /**
     * When the windows is resized check to see if carosel needs to be Initialised
     * for smaller screens
     */
    $( window ).on( 'resize', function() {
        _.debounce( accounts.checkCarousel(), 200 );
    } );

    accounts.checkCarousel();

    /**
     * Initialise the carousel if required
     */
    function checkCarousel() {
        var zindex = $( '.responsive' ).css( 'z-index' );

        // If we are on a tablet or mobile initialise the carousel
        if ( zindex <= 3 ) {

            var startPosition = accounts.getStartPosition();

            // Remove grid and add carousel class
            accounts.accountsContainer.removeClass( 'grid' );
            accounts.accountsContainer.addClass( 'owl-carousel owl-theme' );

            if ( !accounts.carouselActive ) {

                accounts.accountsContainer.owlCarousel( {
                    items: 1,
                    margin: 20,
                    dots: true,
                    center: true,
                    startPosition: startPosition,
                    onChanged: accounts.carouselChanged,
                    dotsContainer: '#accounts-dots'
                } );

                $.fn.matchHeight._update();

                accounts.carouselActive = true;
            }
        } else if ( accounts.carouselActive ) {
            // Remove the Carousel
            accounts.accountsContainer.trigger( 'destroy.owl.carousel' );
            accounts.accountsContainer.addClass( 'grid' );
            accounts.accountsContainer.removeClass( 'owl-carousel owl-theme' );

            $.fn.matchHeight._update();

            accounts.carouselActive = false;
        }
    }

    /**
     * Called when the carousel is interacted with and changed
     */
    function carouselChanged( event ) {
        // If an option has already been selected, the middle carousel item
        // should become the newly selected fund
        if ( $( '.accounts-box--selected' ).length > 0 ) {
            var newActiveAccountsBox      = accounts.accountsBoxes.eq( event.item.index );
            var newActiveSelectAccountBtn = newActiveAccountsBox.find( '.accounts-select' );

            accounts.selectAccount( newActiveSelectAccountBtn );
        }
    }

    /**
     * Selects a fund based upon the select button pressed
     * @param  jQuery Object selectButton The fund button that has been pressed
     */
    function selectAccount( selectButton ) {

        // If not already selected load in the content
        if ( !selectButton.hasClass( 'accounts-select--selected' ) ) {

            // Set the button to its active state
            accounts.setAccountActive( selectButton );

            // Hide other account info
            accounts.accountsInfo.addClass( 'hidden' );

            // Show the relevant account info
            $( selectButton.attr( 'href' ) ).removeClass( 'hidden' );

        }
    }

    /**
     * Sets a account select button to its active state, and removes the active
     * state from any other select buttons
     * @method selectButtonActive
     * @param  jQuery Object           selectButton
     */
    function setAccountActive( selectButton ) {
        // Remove the active state from other fund boxs
        accounts.accountsBoxes.removeClass( 'accounts-box--selected' );

        // Remove active state from other buttons
        $( '.accounts-select' ).removeClass( 'accounts-select--selected btn--green-1' ).addClass( 'btn--orange-3' );
        $( '.accounts-select .btn__icon' ).removeClass( 'icon-tick' ).addClass( 'icon-down-arrow' );

        // Add the active state to this buttons parent select box
        selectButton.closest( '.accounts-box' ).addClass( 'accounts-box--selected' );

        // Add the active state to this button
        selectButton.removeClass( 'btn--orange-3' ).addClass( 'accounts-select--selected btn--green-1' );
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

        accounts.accountsBoxes.each( function( index, value ) {
            if ( $( this ).hasClass( 'accounts-box--selected' ) ) {
                startPos = index;
            }
        } );

        return startPos;
    }

    return accounts;

} );
