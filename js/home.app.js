define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'common'
], function( $, _, Backbone, Marionette, common ) {

    // The main controller responsible for the funtionality of
    // the home page

    var app = new Marionette.Application();

    app.on( 'start', function() {

        // Choice triggers on home page
        $( '.choice-trigger' ).click( function( event ) {

            event.preventDefault();

            // Swap classes
            $( '.choice-trigger' ).removeClass( 'btn--bordered--active' );
            $( this ).addClass( 'btn--bordered--active' );

            // Show the selected content
            $( '.choice-content' ).removeClass( 'choice-content--visible' );
            $( this.hash ).addClass( 'choice-content--visible' );

            var zindex = $( '.responsive' ).css( 'z-index' );

            // If we are on a tablet or mobile initialise the carousel
            if ( zindex <= 3 ) {
                $( 'html, body' ).animate( {
                    scrollTop: $( this.hash ).offset().top
                }, 500 );
            } else {
                $( 'html, body' ).animate( {
                    scrollTop: $( '#what-are-you-saving-for' ).offset().top
                }, 500 );
            }

        } );

        // Calculator submit button
        $( '.calculator-submit' ).click( function( event ) {
            event.preventDefault();

            // Find its parent container
            var parent = $( this ).closest( '.choice-content' );

            // Get the target values
            var targetBalance  = parseInt( parent.find( '.balance-input' ).val() );
            var targetYears    = parseInt( parent.find( '.time-input' ).val() );
            var lumpSum        = parseInt( parent.find( '.lump-sum-input' ).val() );
            var monthlyContrib = parseInt( parent.find( '.monthly-contribution-input' ).val() );
            var pensionAge     = parseInt( parent.find( '.pension-age-input' ).val() );
            var childAge       = parseInt( parent.find( '.child-age-input' ).val() );

            // Get the url
            var url = $( this ).attr( 'href' );

            // Build the URL
            url = ( targetBalance > 0 ) ? updateURL( url, 'targetBalance', targetBalance ) : url;

            url = ( targetYears > 0 ) ? updateURL( url, 'targetYears', targetYears ) : url;

            url = ( lumpSum > 0 ) ? updateURL( url, 'lumpSum', lumpSum ) : url;

            url = ( monthlyContrib > 0 ) ? updateURL( url, 'monthlyContrib', monthlyContrib ) : url;

            url = ( pensionAge > 0 ) ? updateURL( url, 'pensionAge', pensionAge ) : url;

            url = ( childAge > 0 ) ? updateURL( url, 'childAge', childAge ) : url;

            // Add the type of goal selected
            url = updateURL( url, 'type', $( this ).data( 'type' ) );

            // Validate
            if ( parent.find( '.lump-sum-input' ).length > 0 && parent.find( '.lump-sum-input' ).val() < 1000 ) {
                parent.find( '.lump-sum-input' ).addClass( 'form-input--error' );
                parent.find( '.form-errors' ).removeClass( 'hidden' );
            } else {
                parent.find( '.lump-sum-input' ).removeClass( 'form-input--error' );
                parent.find( '.form-errors' ).addClass( 'hidden' );
            }

            // Only submit if there are no errors
            if ( parent.find( '.form-input--error' ).length < 1 ) {
                // Redirect with anchor
                window.location = url + '#step-1';
            }

        } );

        $( '.lump-sum-input' ).blur( function( event ) {
            // Find its parent container
            var parent = $( this ).closest( '.choice-content' );

            if ( parseInt ( $( this ).val() ) < 1000 ) {
                $( this ).addClass( 'form-input--error' );
                parent.find( '.form-errors' ).removeClass( 'hidden' );
            } else {
                $( this ).removeClass( 'form-input--error' );
            }
        } );

        /**
         * Function to add URI parameters to url
         * @param  String uri
         * @param  String key
         * @param  String value
         * @return String
         */
        function updateURL( uri, key, value ) {
            var regex     = new RegExp( "([?&])" + key + "=.*?(&|$)", "i" );
            var separator = uri.indexOf( '?' ) !== -1 ? "&" : "?";
            if ( uri.match( regex ) ) {
                return uri.replace( re, '$1' + key + "=" + value + '$2' );
            }
            else {
                return uri + separator + key + "=" + value;
            }
        }

    } );

    window.app = app;

    return app;
});
