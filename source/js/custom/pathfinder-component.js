/**
 * Javascript for the Pathfinder component.
 * A form that allows the user to choose why they
 * want invest, and how much etc
 */
(function(){

    // Show the correct form when the user makes a choice
    $( '.pathfinder-choice-trigger' ).click( function() {
        var choiceClass = '.js-pathfinder-' + $( this ).parent().find( 'input' ).val() + '-form';

        // Hide all other pathfinder form content
        $( '.js-pathfinder-form-content' ).addClass( 'hide' );

        // Show the correct form
        $( choiceClass ).removeClass( 'hide' );
        $('html, body').animate({
            scrollTop: $( choiceClass ).offset().top
        }, 500);
    } );

    // Perform validation and build the url when the user
    // submits the pathfinder form
    $( '.js-pathfinder-submit' ).click( function( event ) {
        event.preventDefault();
        console.log( "Submitted" );
        // Find its parent container
        var parent = $( this ).closest( '.js-pathfinder-form-content' );

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
            console.log( 'Validation error' );
            parent.find( '.lump-sum-input' ).addClass( 'input--error' );
            parent.find( '.form-errors' ).removeClass( 'hide' );
        } else {
            parent.find( '.lump-sum-input' ).removeClass( 'input--error' );
            parent.find( '.form-errors' ).addClass( 'hide' );
        }

        // Only submit if there are no errors
        if ( parent.find( '.input--error' ).length < 1 ) {
            // Redirect with anchor
            window.location = url + '#step-1';
        }

    } );

    /**
     * Function to add URI parameters to url
     * @param  String uri
     * @param  String key
     * @param  String value
     * @return String
     */
    function updateURL(uri, key, value) {
        var regex = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(regex)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    }

})();
