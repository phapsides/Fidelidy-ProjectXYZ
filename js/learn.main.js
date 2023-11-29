require.config( {
    paths: {
        text: '../bower_components/requirejs-text/text',
        jquery: '../bower_components/jquery/dist/jquery',
        underscore: '../bower_components/underscore/underscore',
        backbone: '../bower_components/backbone/backbone',
        marionette: '../bower_components/marionette/lib/backbone.marionette',
        chartist: '../bower_components/chartist/dist/chartist',
        chartistAxisTitle: '../bower_components/chartist-plugin-axistitle/dist/chartist-plugin-axistitle',
        countUp: '../bower_components/countUp.js/dist/countUp',
        owlCarousel: '../bower_components/owl.carousel/dist/owl.carousel',
        matchHeight: '../bower_components/matchHeight/jquery.matchHeight-min'
    },
    shim: {
        chartistAxisTitle: {
            deps: [ 'chartist' ]
        },
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
    'learn.app',
], function( App ){
    // The 'app' dependency is passed in as 'App'
    App.start();
});
