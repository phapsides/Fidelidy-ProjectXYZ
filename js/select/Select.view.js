define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'text!select/Select.template.html'
], function( $, _, Backbone, Marionette, SelectTemplate ) {

    var view = Marionette.ItemView.extend( {

        template: _.template( SelectTemplate ),

        events: {
            'click .listTrigger': 'openList',
            'click .selectTrigger': 'selectOption'
        },

        initialize: function() {
            // Watch for model changes
            this.model.on( 'change', this.update, this );

            // temporarily set the selected to the first
            var options = this.model.get( 'options' );

        },

        update: function() {
            this.render();
        },

        onRender: function() {
            //
        },

        openList: function( event ) {
            event.preventDefault();

            // Open the list
            $( '.fancy-select ol.select-list' ).toggleClass( 'visible' );

            // Close the dropdown if we click anywhere else after it is opened
            setTimeout( function() {
                $( 'html' ).one( 'click', function() {
                     $( '.fancy-select ol.select-list' ).removeClass( 'visible' );
                } );
            }, 0 );

        },

        selectOption: function( event ) {
            event.preventDefault();

            // Hide the list
            $( $( event.target ).parents( 'ol.select-list' )[ 0 ] ).removeClass( 'visible' );

            // Set the selected attribute to the value of the clicked item
            var value = $( event.target ).data( 'value' );
            if ( !value ) {
                value = $( event.target ).parent().data( 'value' );
            };

            this.model.set( { selected: value } );

            this.render();
        }

    } );

    return view;

});
