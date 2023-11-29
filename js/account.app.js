

define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'common',
    'select/Select.view',
    'select/Select.model',
    'funds'
], function( $, _, Backbone, Marionette, common, SelectView, SelectModel, funds ) {

    // The main controller responsible for the funtionality of
    // the types of investment/account pages

    var app = new Marionette.Application();

    app.on( 'start', function() {

        // Fancy Select
        var riskOptions = [
            {
                name: '1. Avoiding loss is my priority',
                value: '2'
            },
            {
                name: '2. I prefer slow and steady',
                value: '4'
            },
            {
                name: '3. I\'m willing to lose some to make some',
                value: '6'
            },
            {
                name: '4. Focused on growth',
                value: '8'
            },
            {
                name: '5. Risk losses for higher potential returns',
                value: '9'
            }
        ];

        // Create the select box
        var selectModel = new SelectModel( { selector: 'risk-select', options: riskOptions } );
        var selectView  = new SelectView( { el: '#fancy-select', model: selectModel } );
        selectView.render();

        setTimeout( function() {
            $.fn.matchHeight._update();
        }, 700 );

        // When a new risk level is chosen show the correct set of packages
        selectModel.on( 'change:selected', function() {

            $( '.funds-info' ).addClass( 'hidden' );
            $( '.spinner' ).addClass( 'hidden' );

            $( '#step-2' ).css( {
                'min-height': $( '#step-2' ).innerHeight() + 'px'
            } );

            $( '.funds-container' ).removeClass( 'funds-container--active' ).addClass( 'hidden' );
            $( '.funds-container.risk-' + selectModel.get( 'selected' ) ).removeClass( 'hidden' ).addClass( 'funds-container--active' );

            funds.checkCarousel();

        } );

        funds.checkCarousel();

        // When a user wants to open an account submit the info to existing fidelity
        // buy journey
        funds.onOpenWithFund = function( fundButton ) {
            var selectionDetails = {
                fund:     fundButton.data( 'fund-id' ),
                fundName: fundButton.data( 'fund-name' ),
                account:  $( 'body' ).data( 'account-type' )
            };

            // We need to submit the hidden set cookie form first to store the cookie
            // from fidelity. This is then used to identify which package the user has
            // selected in later steps
            var setCookieForm = $( '.setCookieForm' ).contents().find( 'form' );

            if ( selectionDetails.account == 'ia' ) {
                setCookieForm.find( 'input[name="Context"]' ).val( 'nonisaAO' );
            }
            setCookieForm.find( 'input[name="Context"]' ).val( 'isaA0' );
            setCookieForm.find( 'input[name="fundName"]' ).val( selectionDetails.fundName );
            setCookieForm.find( 'input[name="startpageFG"]' ).val( 'shoppingFundGuidance' );
            setCookieForm.find( 'input[name="page"]' ).val( 'isaA0Direct' );
            setCookieForm.find( 'input[name="FundData"]' ).val( selectionDetails.fund );
            setCookieForm[ 0 ].submit();

            var form = $( '.open-account-form' );

            setTimeout( function() {
                if ( selectionDetails.account === 'isa' ) {

                    form.find( 'input[name="HIDDEN_Context"]' ).val( 'isaA0' );
                    form.find( 'input[name="HIDDEN_fundName"]' ).val( selectionDetails.fundName );
                    form.find( 'input[name="HIDDEN_startpageFG"]' ).val( 'shoppingFundGuidance' );
                    form.find( 'input[name="HIDDEN_page"]' ).val( 'isaA0Direct' );
                    form.find( 'input[name="HIDDEN_FundData"]' ).val( selectionDetails.fund );

                    form[0].submit();

                } else if ( selectionDetails.account === 'sipp' ) {
                    form.attr( 'action', 'https://www.fidelity.co.uk/investor/pensions/opening-sipp/open-general.page' );

                    form.find( 'input[name="HIDDEN_Context"]' ).val( 'sipp' );
                    form.find( 'input[name="HIDDEN_FundData"]' ).val( selectionDetails.fund );

                    form[ 0 ].submit();
                } else if ( selectionDetails.account === 'jisa' ) {
                    form.attr( 'action', 'https://www.fidelity.co.uk/investor/isa/open-isa/junior-isa/jisa-register.page' );

                    form.find( 'input[name="HIDDEN_Context"]' ).val( 'jisa' );
                    form.find( 'input[name="HIDDEN_FundData"]' ).val( selectionDetails.fund );

                    form[ 0 ].submit();
                } else if ( selectionDetails.account === 'ia' ) {
                    form.attr( 'action', 'https://www.fidelity.co.uk/investor/site/login.htm?Context=nonisaAO&startpageFG=shoppingFundGuidance' );

                    form.find( 'input[name="HIDDEN_Context"]' ).val( 'nonisaAO' );
                    form.find( 'input[name="HIDDEN_FundData"]' ).val( selectionDetails.fund );

                    form[ 0 ].submit();
                }
            }, 200 );

        };

    } );

    window.app = app;

    return app;
});