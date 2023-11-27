$( document ).ready(function() {

     $("#nav-trigger").click(function(){
        if ($(".dl-menuwrapper").hasClass("expanded")) {
            $(".dl-menuwrapper.expanded").removeClass("expanded").slideUp(250);
            $('main').show();
            $(this).removeClass("open");
        }
        else {
            $(".dl-menuwrapper").addClass("expanded").slideDown(250);
            $("#dl-menu ul").removeClass("dl-subview");
            $("#dl-menu ul li").removeClass("dl-subviewopen");
            $('main').hide();
            $(this).addClass("open");
        }
    });

    $('.swap').click(function() {
        $(this).find(".display").toggle();
        return false;
    });

});// Doc Ready End


// Mobile navigation animations
$(function() {
    $('#dl-menu').dlmenu({
        animationClasses : { classin : 'dl-animate-in-2', classout : 'dl-animate-out-2' }
    });
});




$('.openbtn').click(function(event) {
    event.preventDefault();

    // Swap classes
    $('.openbtn').removeClass('active');
    $(this).addClass('active').delay(200);
    // Show the selected content
    $('.overlay').removeClass('visible');
    $(this).next('.overlay').addClass('visible').delay(200);
});


$(".closebtn").click(function() {

    // event.preventDefault();
    $('.overlay').removeClass('visible');
    $('.openbtn').removeClass('active');
    return false;
});
