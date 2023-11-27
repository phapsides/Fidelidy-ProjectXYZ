/**
 * Initialises carousels
 */
( function() {
    var oc = $('.owl-carousel');
    var ocOptions = oc.data('carousel-options');
    var defaults = {
        loop:       true,
        navigation: false,
        autoplay:   true,
        pagination: true
    }

    oc.owlCarousel( $.extend( defaults, ocOptions ) );
} )();
