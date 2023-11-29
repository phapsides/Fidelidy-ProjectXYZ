define( [
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'chart/Chart.view',
    'chart/Chart.model',
    'select/Select.view',
    'select/Select.model',
    'common',
    'funds',
    'accounts'
], function( $, _, Backbone, Marionette, ChartView, ChartModel, SelectView, SelectModel, common, funds, accounts ) {

    // The main controller responsible for the funtionality of
    // the learn/plan your investment page

    var app = new Marionette.Application();

    var selectionDetails = {
        fund: 'GB00BC7GX723::0::0::0',
        fundName: 'Fidelity Multi Asset Allocator Defensive Fund N-Accumulation Gross',
        account: 'isaAO'
    };

    app.on( 'start', function() {

        // Collapse steps
        $( 'body' ).on( 'click', '.collapse-trigger', function( event ) {

            event.preventDefault();

            var target = this.hash;

            $( target ).removeClass( 'collapsed bg-grey-05 divider-t' ).addClass( 'bg-gradient' );

            $( target ).find( '.title-badged .text-blue-2' ).removeClass( 'text-blue-2 text-truncate' ).addClass( 'text-white' );

            // This accounts for a chrome bug that was preventing the buttons from showing
            // after being hidden in their section -- hopefully can remove
            $( target ).hide().show( 0 );

            $.fn.matchHeight._update();

            $( 'html, body' ).animate( {
                scrollTop: $( target ).offset().top // - 60 // navbar height
            }, 500 );

        } );

        $( document ).on( 'click', '.collapsed#step-2', function( event ) {

            event.preventDefault();

            $( this ).removeClass( 'collapsed bg-grey-05 divider-t' ).addClass( 'bg-gradient' );

            $( this ).find( '.title-badged .text-blue-2' ).removeClass( 'text-blue-2 text-truncate' ).addClass( 'text-white' );

            // This accounts for a chrome bug that was preventing the buttons from showing
            // after being hidden in their section -- hopefully can remove
            $( this ).hide().show( 0 );

            $.fn.matchHeight._update();

            $( 'html, body' ).animate( {
                scrollTop: $( this ).offset().top
            }, 500 );
        } );

        $( document ).on( 'click', '.collapsed#step-3', function( event ) {

            event.preventDefault();

            if ( $( '.funds-open' ).length > 0 ) {

                $( '.funds-open' ).click();

                $( this ).removeClass( 'collapsed bg-grey-05 divider-t' ).addClass( 'bg-gradient' );

                $( this ).find( '.title-badged .text-blue-2' ).removeClass( 'text-blue-2 text-truncate' ).addClass( 'text-white' );

                // This accounts for a chrome bug that was preventing the buttons from showing
                // after being hidden in their section -- hopefully can remove
                $( this ).hide().show( 0 );

                $.fn.matchHeight._update();

                $( 'html, body' ).animate( {
                    scrollTop: $( this ).offset().top
                }, 500 );
            }

        } );

        /**
         * Gets url parameters by name if they exist
         * @param  String name The name of the url param
         * @return String
         */
        function urlParam( name ) {
            var results = new RegExp( '[\?&]' + name + '=([^&#]*)' ).exec( window.location.href );
            if ( results == null ) {
               return null;
            }
            else{
               return results[1] || 0;
            }
        }

        // Create a model for the chart. If a target balance and year has been
        // set initialise the model with them, otherwise we will use the defaults
        var chartModelData = {};

        if ( urlParam( 'targetBalance' ) ) {
            chartModelData.targetBalance = parseInt( urlParam( 'targetBalance' ) );
        }
        if (  urlParam( 'targetYears' ) ) {
            chartModelData.targetYears = parseInt( urlParam( 'targetYears' ) );
        }
        if ( urlParam( 'lumpSum' ) ) {
            chartModelData.startBalance = parseInt( urlParam( 'lumpSum' ) );
        }
        if ( urlParam( 'monthlyContrib' ) ) {
            chartModelData.monthlyDeposit = parseInt( urlParam( 'monthlyContrib' ) );
        }
        if ( urlParam( 'numberOfYears' ) ) {
            chartModelData.numberOfYears = parseInt( urlParam( 'numberOfYears' ) );
        }
        if ( urlParam( 'pensionAge' ) ) {
            chartModelData.numberOfYears = 65 - parseInt( urlParam( 'pensionAge' ) );
        }
        if ( urlParam( 'type' ) ) {
            chartModelData.targetType = urlParam( 'type' );
        }

        var chartModel = new ChartModel( chartModelData );

        // Create and render the chart view
        var chartView  = new ChartView( { el: '#chart-container', model: chartModel } );
        chartView.render();

        // The options for the risk select dropdown
        var riskOptions = [
            {
                name: '1. Avoiding loss is my priority',
                value: '1'
            },
            {
                name: '2. I prefer slow and steady',
                value: '2'
            },
            {
                name: '3. I\'m willing to lose some to make some',
                value: '3'
            },
            {
                name: '4. Focused on growth',
                value: '4'
            },
            {
                name: '5. Risk losses for higher potential returns',
                value: '5'
            }
        ];

        // Create the risk select dropdown
        var selectModel = new SelectModel( { selector: 'risk-select', options: riskOptions, selected: chartModel.get( 'riskLevel' ) } );
        var selectView  = new SelectView( { el: '#fancy-select', model: selectModel } );

        // Make sure we are showing the right packages for the risk level
        $( '.funds-container' ).addClass( 'hidden' ).removeClass( 'funds-container--active' );
        $( '.funds-container.risk-' + selectModel.get( 'selected' ) ).removeClass( 'hidden' ).addClass( 'funds-container--active' );;
        $.fn.matchHeight._update();

        // If the risk level is updated on the chart, update the
        // select box in the fund area if needed
        chartModel.on( 'change:riskLevel', function() {
            if ( selectModel.get( 'selected' ) != chartModel.get( 'riskLevel' ) ) {
                selectModel.set( 'selected', chartModel.get( 'riskLevel' ) );
            }
        } );

        // Show the different options when the select box is changed
        selectModel.on( 'change:selected', function() {

            // If the risk level is changed using the select box, update the chart
            // if needed
            if ( selectModel.get( 'selected' ) != chartModel.get( 'riskLevel' ) ) {
                chartModel.set( 'riskLevel', parseInt( selectModel.get( 'selected' ) ) );
            }

            $( '.funds-info' ).addClass( 'hidden' );
            $( '.spinner' ).addClass( 'hidden' );

            $( '#step-2' ).css( {
                'min-height': $( '#step-2' ).innerHeight() + 'px'
            } );

            $( '.funds-container' ).addClass( 'hidden' ).removeClass( 'funds-container--active' );
            $( '.funds-container.risk-' + selectModel.get( 'selected' ) ).removeClass( 'hidden' ).addClass( 'funds-container--active' );

            funds.checkCarousel();
        } );
        selectView.render();

        funds.checkCarousel();

        // Show the correct account explanation once selected
        $( '.account-select' ).click( function( event ) {
            event.preventDefault();

            $( 'account-explanation' ).addClass( 'hidden' );
            $( this.hash ).removeClass( 'hidden' );
        } );

        // When a user has selected a package store its details
        // so they can be passed on later
        funds.onOpenWithFund = function( fundButton ) {
            selectionDetails.fund = fundButton.data( 'fund-id' );
            selectionDetails.fundName = fundButton.data( 'fund-name' );

            $( '#step-3' ).addClass( 'collapsed--openable' );
        };

        // When a user wants to open an account submit the info to existing fidelity
        // buy journey
        accounts.onOpenWithAccount = function( accountButton ) {
            selectionDetails.account  = accountButton.data( 'account-type' );

            // We need to submit the hidden set cookie form first to store the cookie
            // from fidelity. This cookie is then used to identify which package the user has
            // selected in later steps
            var setCookieForm = $( '.setCookieForm' ).contents().find( 'form' );
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
                }
            }, 200 );

        };

    } );

    window.app = app;

    return app;
});
