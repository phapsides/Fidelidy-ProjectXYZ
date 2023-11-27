 (function() {
     $('.toggle-trigger').click(function() {
         $(this).find(".display").toggle();
         $(this).parentsUntil('.site-module_container_wrapper').next('.content-panel').slideToggle();
         return false;
     });
 })();
