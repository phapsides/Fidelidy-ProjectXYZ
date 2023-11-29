define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette'
], function( $, _, Backbone, Marionette ) {

    var SelectModel = Backbone.Model.extend( {
        defaults: {
            selector: null,
            selected: null,
            options: []
        },
        initialize: function() {
            // if ( this.get( 'selected' ) === null ) {
            //     this.set( { selected: this.get( 'options' )[ 2 ].value } );
            //     console.log( this.get( 'options' )[ 2 ].value );
            //     // this.set( { selected: "Please select a risk level" } );
            // }
        }
    } );

    return SelectModel;

} );
