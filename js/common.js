define( [
    'jquery',
    'underscore',
    'owlCarousel',
    'matchHeight'
], function( $, _, owlCarousel, matchHeight ) {

    // Contains common site wide functionality 

    // NAV TRIGGER
    $( '.site-nav__burger' ).click( function( event ) {
        event.preventDefault();

        var burger   = $( this );
        var header   = $( '.site-header' );
        var rightNav = $( '.site-nav__right' );

        // If menu is open
        if ( burger.hasClass( 'site-nav__burger--open' ) ) {
            burger.removeClass( 'site-nav__burger--open' );
            header.removeClass( 'site-header__burger--open' );
            rightNav.removeClass( 'site-nav__right--visible' );
        } else {
            burger.addClass( 'site-nav__burger--open' );
            header.addClass( 'site-header__burger--open' );
            rightNav.addClass( 'site-nav__right--visible' );
        }
    } );



    // STICKY NAV
    var header   = $( '.site-header' );
    var position = $( window ).scrollTop();

    $( window ).on( 'scroll', _.throttle( function() {

        var scroll = $( window ).scrollTop();

        // If scrolling upwards
        if ( scroll < position ) {
            // If lower than static navbar
            if ( scroll > 100 ) {
                header.addClass( 'site-header--fixed' );
                header.removeClass( 'rhythmic-xl fixed-hidden no-transition' );
            } else {
                header.removeClass( 'site-header--fixed' );
                header.addClass( 'rhythmic-xl' );
            }
        // If scrolling downwards
        } else {
            // If lower than static navbar
            if ( scroll > 100 ) {
                header.addClass( 'site-header--fixed fixed-hidden' );
                header.removeClass( 'rhythmic-xl' );
            } else {
                header.addClass( 'no-transition' );
            }
        }

        position = scroll;

    }, 100 ) );



    // VIDEO LIGHTBOX
    $( '.video-box__trigger' ).click( function( event ) {
        event.preventDefault();

        $( '.video-box' ).addClass( 'video-box--active' );
        $( '.video-box--open__container' ).addClass( 'open--visible' );
    } );

    $( '.video-box__close' ).click( function( event ) {
        event.preventDefault();

        $( '.video-box' ).removeClass( 'video-box--active' );
        $( '.video-box--open__container' ).removeClass( 'open--visible' );

        // We force the video to stop by removing then re-adding the iframe
        $( '.video-box--open__container' ).find( 'iframe' ).attr( 'src', $( '.video-box--open__container' ).find( 'iframe' ).attr( 'src' ) );
    } );


    // LIGHTBOX
    $( document ).on( 'click', '.lightbox-trigger', function( event ) {
        event.preventDefault();

        var lightbox = $( '.lightbox' );

        lightbox.html( $( this.hash ).html() );

        lightbox.removeClass( 'hidden animate--fadeOut' ).addClass( 'animate--fadeIn' );
    } );

    $( document ).on( 'click', '.lightbox__close', function( event ) {
        event.preventDefault();

        var lightbox = $( '.lightbox' )

        lightbox.removeClass( 'animate--fadeIn' ).addClass( 'animate--fadeOut' );

        lightbox.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            // Unbind event ( weird, shoudln't have to do this... )
            lightbox.off( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend' );

            $( this ).addClass( 'hidden' );
        } );

    } );

    // Accordions
    $( 'body' ).on( 'click', '.accordion__item__heading', function( event ) {
        event.preventDefault();

        var accordion    = $( this ).closest( '.accordion' );
        var selectedItem = $( this ).closest( '.accordion__item' );
        var items        = accordion.find( '.accordion__item' );

        // Show the selected item content
        selectedItem.toggleClass( 'accordion__item--active' );
    } );

    // Collapse panels ( sidebars )
    $( '.collapse-panel__toggle' ).click( function( event ) {
        event.preventDefault();
        var parent = $( this ).closest( '.collapse-panel' );
        parent.toggleClass( 'collapse-panel--open' );
    } );

    // Make telephone numbers clickable on mobile devices
    function isTouchDevice() {
        // Set as true if device has touch capabilities
        return ( ( 'ontouchstart' in window ) || ( navigator.MaxTouchPoints > 0 ) || ( navigator.msMaxTouchPoints > 0 ) );
    }

    if( isTouchDevice() ) {
        $( ".tel-num" ).each(function() {
            var $a = $("<a />").attr( "href", "tel:" + $( this ).text() ).attr( "class", $( this ).attr( "class" ) );
            $a.html( $( this ).html() );
            $( this ).html( $a );
        } );
    }

} );
