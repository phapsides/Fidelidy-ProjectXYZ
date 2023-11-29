require.config( {
    paths: {
        text: '../bower_components/requirejs-text/text',
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        backbone: '../bower_components/backbone/backbone',
        marionette: '../bower_components/marionette/lib/backbone.marionette',
        owlCarousel: '../bower_components/owl.carousel/dist/owl.carousel',
        matchHeight: '../bower_components/matchHeight/jquery.matchHeight-min'
    },
    shim: {
        owlCarousel: {
            deps: [ 'jquery' ]
        },
        matchHeight: {
            deps: [ 'jquery' ]
        }
    }
} );

require( [
    // Load our app module and pass it to our definition function
    'account.app',
], function( App ){
    // The 'app' dependency is passed in as 'App'
    App.start();
});
