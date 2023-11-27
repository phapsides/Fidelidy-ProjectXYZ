( function() {
  	$(".footer-list__title").click(function(){
     	if(window.checkBreakpoint() != 'large'){
         	$(this).find(".sign").toggle();
          	$(this).next("ul").slideToggle();
      	}
  	});
})();


