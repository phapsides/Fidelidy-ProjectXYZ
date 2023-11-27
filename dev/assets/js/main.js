$(document).ready(function() {

    /* SLICK carousel init options */

    $('.slider-container').slick({

        cssEase: 'ease',
        dots: true,
        prevArrow: '.carousel-prev',
        nextArrow: '.carousel-next',
        infinite: false,
        speed: 300,
        rows: 1,
        slidesPerRow: 1,
        centerMode: true,
        centerPadding: '40px',
        slidesToShow: 3,
        initialSlide: 1,
        responsive: [{
                breakpoint: 740,
                settings: {
                    arrows: false,
                    dots: true,
                    swipeToSlide: true,
                    centerMode: true,
                    initialSlide: 0,
                    centerPadding: '40px',
                    slidesToShow: 1,
                    rows: 1
                }
            }

        ]

    }); /* CLOSE: SLICK carousel init options */


    /* TOOLS offscreen page functions */

    $('.js-tool-trigger').click(function() {

        $('.tools-section-offscreen-container').addClass('active');

    });

    $('.js-close-tools').click(function() {

        $('.tools-section-offscreen-container').removeClass('active');

    });


    /* TOOLS range slider */

    $('.invest-amount').on('change.fndtn.slider', function() {
        var thisVal = $('.invest-amount').attr('data-slider');
        $('.invest-amount-display .js-range-amount').html(thisVal);
    });

    $('.invest-period').on('change.fndtn.slider', function() {
        var thisVal = $('.invest-period').attr('data-slider');
        $('.invest-period-display .js-range-amount').html(thisVal);
    });



    /* Site Navigation search button */

    $('.js-site-nav-search-btn').click(function(e) {

        $(this).toggleClass('active');
        $('.site-nav-search-bar').toggleClass('active');

        if ($('.site-nav-search-bar').hasClass('active')) {
            $('.nav-search-input').focus();
        }

    });


    $('.nav-search-input').keyup(function() {

        var numChars = $(this).val().length;

        if (numChars > 1) {

            if ($('.search-input-help-text').hasClass('active')) {
                // do nothing
            } else {

                $('.search-input-help-text').addClass('active');

            }

        } else {
            $('.search-input-help-text').removeClass('active');
        }

    });

    $('.secondary-nav-mobile-btn').click(function(e) {

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            $('.nav-secondary-links').removeClass('active');
        } else {
            $(this).addClass('active');
            $('.nav-secondary-links').addClass('active');
        }

    });

    $('.nav-main-mobile-btn').click(function(e) {

        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            // $('.nav-secondary-links').removeClass('active');
        } else {
            $(this).addClass('active');
            // $('.nav-secondary-links').addClass('active');
        }

    });


}); /* CLOSE: doc ready*/





$('input.toggle-switch').click(function () {
    $('input:not(:checked)').parent().removeClass("active");
    $('input:checked').parent().addClass("active");
}); 



