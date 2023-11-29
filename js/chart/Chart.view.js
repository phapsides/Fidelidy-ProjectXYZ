define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'chartist',
    'chartistAxisTitle',
    'text!chart/Chart.template.html',
    'countUp',
    'owlCarousel',
    'matchHeight'
], function ($, _, Backbone, Marionette, Chartist, ChartistAxisTitle, ChartTemplate, CountUp, owlCarousel, matchHeight) {

    var view = Marionette.ItemView.extend({

        template: _.template(ChartTemplate),

        events: {
            'mousemove .ct-chart': 'graphPointMove',
            'mousemove .graph-point': 'graphPointMove',

            'mousedown .ct-chart': 'graphPointDown',
            'mousedown .graph-point': 'graphPointDown',

            'mouseleave .ct-chart': 'graphPointLeave',
            'mouseup .ct-chart': 'graphPointLeave',
            'mouseup .graph-point': 'graphPointLeave',

            'touchmove .ct-chart': 'graphPointMove',
            'touchstart .ct-chart': 'graphPointDown',
            'touchmove .graph-point': 'graphPointMove',
            'touchleave .ct-chart': 'graphPointLeave',
            'touchend .ct-chart': 'graphPointLeave',

            'keyup .start-balance': 'updateStartBalance',
            'focusout .start-balance': 'formatInput',
            'focusout .monthly-deposit': 'formatInput',
            'keyup .monthly-deposit': 'updateMonthlyDeposit',
            'keyup .number-years': 'updateNumberYears',
            'click .risk-select': 'updateRisk',
            'click .graph-overlay__ok': 'toggleOverlay',
            'click .show-settings': 'toggleSettings',
            'click .graph-inputs__close': 'toggleSettings',
            'click .graph-inputs__submit': 'toggleSettings'
        },

        initialize: function () {
            var self = this;

            self.ready = false;

            // Watch for model changes
            self.model.on('change', self.update, self);

            self.isTouching = false;
            self.lastX = 0;
            self.lastY = 0;

            var width = $(window).width();

            // If the window is resized horizontaly redraw the graph
            var updateIfChanged = _.debounce(function () {
                if (self.ready) {
                    if ($(window).width() != width) {
                        width = $(window).width(); // update width
                        self.update();
                    }
                }
            }, 200);

            $(window).on('resize', function () {
                self.checkMobile(self);
                updateIfChanged();
                $('.risk-select').matchHeight();
            });

            // When the risk level is changed update the carousel
            self.model.on('change:riskLevel', function () {
                $('.owl-carousel.risk-select-container').trigger('to.owl.carousel', [self.model.get('riskLevel') - 1, 300, true]);
                self.updateRiskByNumber(self.model.get('riskLevel'));
            });

            self.model.on('change:loading', function () {
                if (self.model.get('loading')) {
                    $('.graph-section').removeClass('hidden').addClass('graph-loading');
                } else {
                    $('.graph-section').removeClass('graph-loading');
                }
            });

        },

        checkMobile: _.throttle(function (self) {
            var zindex = $('.responsive').css('z-index');

            var margin = 20; // Spacing between carousel items

            // If the screen is smaller than the tablet breakpoint
            if (zindex <= 3) {
                // Swap classes
                $('.risk-select-container').removeClass('grid');
                $('.risk-select-container').addClass('owl-carousel owl-theme');
                // If the carousel was not yet initialized, initialize it
                if (!$('.owl-carousel.risk-select-container').hasClass('owl-loaded')) {
                    var startPosition = self.model.get('riskLevel') - 1;
                    $('.owl-carousel.risk-select-container').owlCarousel({items: 1, margin: margin, dots: true, center: true, startPosition: startPosition, onDragged: updateCarousel});
                }

            } else {
                $('.owl-carousel.risk-select-container').trigger('destroy.owl.carousel');
                $('.risk-select-container').addClass('grid');
                $('.risk-select-container').removeClass('owl-carousel owl-theme');
            }

            function updateCarousel (event) {
                var riskNumber = event.item.index + 1;
                if (riskNumber) {
                    self.updateRiskByNumber(riskNumber);
                }
            }

            // Correct the position of the arrow
            if (zindex > 3 && self.ready) {
                $('.risk-explanation .risk-explanation__pointer').css({
                    left: $('.risk-select.active')[0].getBoundingClientRect().left + ( ( $('.risk-select.active')[0].getBoundingClientRect().right - $('.risk-select.active')[0].getBoundingClientRect().left ) / 2 ) - $('.risk-explanation')[0].getBoundingClientRect().left
                });
            } else {
                $('.risk-explanation .risk-explanation__pointer').css({left: '50%'});
            }

            $('.risk-select').matchHeight();

        }, 10),

        /**
         * Redraws the graph with new values from the model
         */
        update: function () {
            if (this.ready && !this.model.get('loading')) {

                this.chartData = {
                    // A labels array that can contain any sort of values
                    labels: this.model.get('years'),
                    // Our series array that contains series objects or in this case series data arrays
                    series: this.model.get('series')
                };

                this.chart.update(this.chartData, this.getChartOptions());
            } else if (!this.ready && this.model.get('series')[0].data.length > 0) {
                this.createGraph();
            }

        },

        graphPointDown: function (event) {
            //event.preventDefault();
            this.isTouching = true;
            this.ctGrids.element.attr('class', 'ct-grids ct-grids--grabbing');

            // We keep track of the starting x position so we can work out
            // whether the user is dragging left and right or up and down
            if (event.type == 'mousedown') {
                this.lastX = event.clientX;
                this.lastY = event.clientY;
            } else if (event.type == 'touchstart') {
                this.lastX = event.originalEvent.touches[0].pageX;
                this.lastY = event.originalEvent.touches[0].pageY;
            }
        },

        graphPointMove: function (event) {

            if (this.isTouching) {

                // We only want to trigger the mouseover function if
                // the user is moving left or right, and not up or down
                // this is so the user can still scroll up and down the
                // page while touching the graph
                var moveX;
                var moveY;
                if (event.type == 'mousemove') {
                    moveX = Math.abs(this.lastX - event.clientX);
                    moveY = Math.abs(this.lastY - event.clientY);
                } else if (event.type == 'touchmove') {
                    moveX = Math.abs(this.lastX - event.originalEvent.touches[0].pageX);
                    moveY = Math.abs(this.lastY - event.originalEvent.touches[0].pageY);
                }

                if (moveX > moveY || moveX > 20) {
                    event.preventDefault();
                    this.graphMouseover(event);
                }

            }
        },

        graphPointLeave: function (event) {
            event.preventDefault();
            if (this.ready) {
                this.isTouching = false;
                this.ctGrids.element.attr('class', 'ct-grids');
            }
        },

        /**
         * Handler for the start balance input field on blur
         * @param  {Event} event
         */
        formatInput: function (event) {
            var input = $(event.target);

            // Removes all non numeric characters from string then
            // parse as an integer
            var val = this.model.formatMoney(parseInt(input.val().replace(/\D/g, '')), 0);

            input.val('£' + val);
        },

        /**
         * Handler for the start balance input change. Update the model
         * with the value from the input
         * @param  {Event} event
         */
        updateStartBalance: _.debounce(function (event) {
            var input = $(event.target);

            // Removes all non numeric characters from string then
            // parse as an integer
            var val = parseInt(input.val().replace(/\D/g, ''));

            // Update the model
            this.model.set({startBalance: val, updatedByUser: true});
        }, 300),

        /**
         * Handler for the monthly deposit input change. Updates the model
         * with the value from the input
         * @param  {Event} event
         */
        updateMonthlyDeposit: _.debounce(function (event) {
            var input = $(event.target);

            // Removes all non numeric characters from string then
            // parse as an integer
            var val = parseInt(input.val().replace(/\D/g, ''));

            this.model.set({monthlyDeposit: val, updatedByUser: true});
        }, 300),

        /**
         * Handler for the number of years input change. Updates the model
         * with the value from the input
         * @param  {Event} event
         */
        updateNumberYears: _.debounce(function (event) {
            var val = parseInt($(event.target).val());
            if (val > 2) {
                this.model.set({numberOfYears: val, updatedByUser: true});
            }
        }, 300),

        /**
         * Handler for for clicking on a risk-select button. This will update
         * the risk level of the model and in turn update the graph
         * @param  {Event} event
         */
        updateRisk: function (event) {
            event.preventDefault();

            // Highlight the selected button
            $('.risk-select').removeClass('active');
            $(event.currentTarget).addClass('active');

            var val = parseInt($(event.currentTarget).data('risk'));

            // Swap in the correct risk explanation
            $('.risk-explanation').removeClass('hidden');
            $('.risk-explanation p').addClass('hidden');
            $('.risk-explanation .risk' + val).removeClass('hidden');

            this.hideTooltip();
            this.graphPoint.removeClass('graph-point--visible');

            // Move the pointer to the correct position, only on desktop
            var zindex = $('.responsive').css('z-index');
            if (zindex > 3) {
                $('.risk-explanation .risk-explanation__pointer').css({
                    left: event.currentTarget.getBoundingClientRect().left + ( ( event.currentTarget.getBoundingClientRect().right - event.currentTarget.getBoundingClientRect().left ) / 2 ) - $('.risk-explanation')[0].getBoundingClientRect().left
                });
            }
            ;

            // this.model.set({riskLevel: val});
            this.model.setRiskLevel(val);

        },

        updateRiskByNumber: function (riskNumber) {
            // Highlight the selected button
            $('.risk-select').removeClass('active');
            $('*[data-risk="' + riskNumber + '"]').addClass('active');

            // Swap in the correct risk explanation
            $('.risk-explanation p').addClass('hidden');
            $('.risk-explanation .risk' + riskNumber).removeClass('hidden');

            // this.model.set({riskLevel: riskNumber});
            this.model.setRiskLevel(riskNumber);
        },

        /**
         * Shows the graph tooltip
         */
        showTooltip: function () {
            this.tooltip.container.addClass('graph-tooltip--visible');
        },

        /**
         * Hides the graph tooltip
         */
        hideTooltip: function () {
            this.tooltip.container.removeClass('graph-tooltip--visible');
        },

        /**
         * Hides and shows the graph inputs on mobile
         */
        toggleSettings: function (event) {
            event.preventDefault();
            $('.graph-inputs').toggleClass('tablet-hidden');

            // Scroll back to the graph if it is closing
            if ($('.graph-inputs').hasClass('tablet-hidden')) {
                $('html, body').animate({
                    scrollTop: $('#graph-container').offset().top
                }, 200);
            }
        },

        /**
         * Shows and hides the graph overlay explaining what is happening
         * @param  Event event
         */
        toggleOverlay: function (event) {
            event.preventDefault();
            this.graphOverlay.toggleClass('hidden');
        },

        /**
         * Positions and updates the chart tooltip with new values
         * @param  {Int} x
         * @param  {Int} y
         */
        updateTooltip: function (x, y, year, countup) {
            var poorMktValue, averageMktValue, goodMktValue;

            // By default we don't want to count up
            countup = typeof countup !== 'undefined' ? countup : false;

            // Position the tooptip
            this.tooltip.container.css({
                top: y - this.tooltip.container.height() * 1.1,
                left: x
            });

            // Update its values
            var valuesAtYear = this.model.getPointsByYear(year);

            poorMktValue = Math.ceil(valuesAtYear[2] / 100) * 100;
            averageMktValue = Math.ceil(valuesAtYear[1] / 100) * 100;
            goodMktValue = Math.ceil(valuesAtYear[0] / 100) * 100;

            this.tooltip.countUpAnims = this.tooltip.countUpAnims || {
                        poor: null,
                        average: null
                    };


            function createCountUpAnim (self, className, market, val) {
                self.tooltip.countUpAnims[market] = new CountUp(self.tooltip[className][0], 0, val, 0, 2.0, {
                    prefix: '£'
                });

                self.tooltip.countUpAnims[market].start();
            }

            function updateCountUpAnim (self, market, val) {
                self.tooltip.countUpAnims[market].update(val);
            }

            // Set the estimated value
            if (countup) {
                if (this.tooltip.countUpAnims.average === null) {
                    createCountUpAnim(this, 'poor', 'poor', poorMktValue);
                    createCountUpAnim(this, 'average', 'average', averageMktValue);
                    createCountUpAnim(this, 'good', 'good', goodMktValue);
                } else {
                    updateCountUpAnim(this, 'poor', poorMktValue);
                    updateCountUpAnim(this, 'average', averageMktValue);
                    updateCountUpAnim(this, 'good', goodMktValue);
                }
            } else {
                this.tooltip['poor'].empty().append('£' + this.model.formatMoney(poorMktValue, 0));
                this.tooltip['average'].empty().append('£' + this.model.formatMoney(averageMktValue, 0));
                this.tooltip['good'].empty().append('£' + this.model.formatMoney(goodMktValue, 0));
            }

            this.updateMarketPercentages();

        },

        /**
         * Updates the position of the point on the graph
         * @param  {Int} x
         * @param  {Int} y
         */
        updatePoint: function (x, y) {
            this.graphPoint.finish();
            this.graphPoint.css({
                left: x,
                top: y
            });
        },

        /**
         * Gets the point at position x along the average balance path
         * @param  {Int} x The x coordintate of the mouse of pointer
         * @return {Object}  An object containing an x and y value
         */
        getAveragePathPoint: function (x) {
            // Find our position along the average path
            var percentAcross = 1 - ( ( ( this.ctGrids.width - x ) / this.ctGrids.width ) );

            // Cap the percentage between 0 and 1
            percentAcross = Math.min(Math.max(0, percentAcross), 1);

            if (isNaN(percentAcross)) {
                return {x: 0, y: 0};
            }

            // Get the closest point on the average line
            return this.averagePath.element.getPointAtLength(percentAcross * this.averagePath.length);
        },

        /**
         * Handler for mousing over the grpah. Responsible for updating the
         * chart-info section, showing the tooltip and moving the graph vertical
         * line all based on the position of the mouse
         * @param  {Event} event
         */
        graphMouseover: _.throttle(function (event) {

            if (!this.model.get('loading')) {
                // Get the x coordinate of the event
                var x = 0;
                if (event.type == 'mousemove') {
                    x = event.clientX;
                } else if (event.type == 'touchmove') {
                    x = event.originalEvent.touches[0].pageX;
                }

                // Find the year closest to the cursor
                var year = this.getClosestYear(x);

                // Get the offset from the left of the graph
                var graphStartOffset = this.ctGrids.boundingRect.left - this.graphContainer.offset().left;

                var left = Math.min(Math.max(x - this.ctGrids.boundingRect.left, 0), this.ctGrids.boundingRect.right - this.ctGrids.boundingRect.left);

                // Get the closest point on the average line
                var point = this.getAveragePathPoint(left);

                // Move the chart line
                this.graphLine.finish();
                this.graphLine.css({
                    left: left + graphStartOffset
                });

                // Move the graph point along the average line
                this.updatePoint(left + graphStartOffset, point.y);

                // Move graph tooltip
                this.updateTooltip(left + graphStartOffset, point.y, year);
            }

        }, 16),

        /**
         * Find the year closest to the x coordinate provided
         * @param  {Int} x An x coordinate relative to the page
         * @return {Int} The closest year on the graph
         */
        getClosestYear: function (x) {
            var closestDistance = 999999;
            var closestYear;
            $('.ct-labels .ct-label.ct-horizontal').each(function (index, label) {
                var distance = Math.abs(label.getBoundingClientRect().left - x);
                if (distance < closestDistance) {
                    closestYear = $(label).text();
                    closestDistance = distance;
                }
            });

            return closestYear;
        },

        /**
         * Generates the options object to initialise the chart. The options will
         * vary depending on browser size
         * @return Object The chart options
         */
        getChartOptions: function () {
            var self = this;

            // Build the chart options
            var chartOptions = {
                showLine: true,
                showArea: true,
                chartPadding: {
                    top: 0,
                    right: 0,
                    bottom: 60,
                    left: 80
                },
                divisor: 4,
                fullWidth: true,
                axisX: {
                    showLabel: true,
                    scaleMinSpace: 350,
                    labelOffset: {
                        x: -2,
                        y: 20
                    },
                    labelInterpolationFnc: function (value, index) {
                        if (self.model.get('numberOfYears') > 15) {
                            return index % 10 === 0 ? value : null;
                        } else {
                            return value;
                        }
                    }
                },
                axisY: {
                    showLabel: true,
                    onlyInteger: true,
                    scaleMinSpace: 50,
                    //high: self.model.get( 'series' )[ 5 ][ 0 ][  self.model.get( 'series' )[ 5 ][ 0 ].length - 1 ].value,
                    labelOffset: {
                        x: -10,
                        y: 6
                    },
                    labelInterpolationFnc: function (value) {
                        return '£' + self.model.formatMoney(value, 0);
                    }
                }
            };

            // If we are on mobile modify them
            if ($('.responsive').css('z-index') <= 3) {
                chartOptions.chartPadding.left = 0;
                chartOptions.axisY.showLabel = false;
                chartOptions.axisY.offset = 0;

                // Add the axis title plugin just for the x axis
                chartOptions.plugins = [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'Years',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: -45,
                                y: 70
                            },
                            textAnchor: 'left'
                        },
                        axisY: {}
                    })
                ];
            } else {
                // Add the title plugin to both axis
                chartOptions.plugins = [
                    Chartist.plugins.ctAxisTitle({
                        axisX: {
                            axisTitle: 'Years',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: 0,
                                y: 70
                            },
                            textAnchor: 'middle'
                        },
                        axisY: {
                            axisTitle: 'Balance',
                            axisClass: 'ct-axis-title',
                            offset: {
                                x: -35,
                                y: 20
                            },
                            flipTitle: true
                        }
                    })
                ];
            }

            return chartOptions;
        },

        onRender: function () {

            var self = this;

            // Check if should be initialized for mobile
            self.checkMobile(self);

            // Get references to the ui elements that will need updating
            self.graphContainer = $('#graph-container');
            self.graphKey = $('.graph__key');

            self.tooltip = {
                container: $('.graph-tooltip'),
                poor: $('.graph-tooltip .poor'),
                average: $('.graph-tooltip .average'),
                good: $('.graph-tooltip .good'),
                countUpAnim: null
            };

            self.graphOverlay = $('.graph-overlay');
            self.graphLine = $('.graph-line');
            self.graphPoint = $('.graph-point');

            // Get a reference to input elements
            self.balanceInput = $('.start-balance');
            self.monthlyDepositInput = $('.monthly-deposit');

            $('.risk-select').matchHeight();

            console.log('marketPercentages ', this.model.get('marketPercentages'));

            this.updateMarketPercentages();
        },

        updateMarketPercentages : function(){
            console.log('updateMarketPercentages = ', this.model)
            if (this.model.get('riskLevel') !== null) {
                $('.good-percent').text(this.model.get('marketPercentages')[0] + '%');
                $('.average-percent').text(this.model.get('marketPercentages')[1] + '%');
                $('.poor-percent').text(this.model.get('marketPercentages')[2] + '%');
            }
        },

        createGraph: function () {
            var self = this;
            if (this.model.get('series')) {

                // Show the graph section
                $('.graph-section').removeClass('hidden');

                this.chartData = {
                    // A labels array that can contain any sort of values
                    labels: this.model.get('years'),
                    // Our series array that contains series objects or in this case series data arrays
                    series: this.model.get('series')
                };

                // Create a new line chart object where as first parameter we pass in a selector
                // that is resolving to our chart container element. The Second parameter
                // is the actual data object.
                this.chart = new Chartist.Line('.ct-chart', this.chartData, this.getChartOptions());

                this.chart.on('created', function () {

                    self.ready = true;

                    // We call detach on the graph to remove its default event listeners
                    // this gives us more control over what happens to the graph on window
                    // resize etc
                    self.chart.detach();

                    // Grad a reference to the .ct-grids elements as we will make
                    // use of this a lot
                    self.ctGrids = {
                        element: $('.ct-grids'),
                        width: $('.ct-grids')[0].getBoundingClientRect().right - $('.ct-grids')[0].getBoundingClientRect().left,
                        boundingRect: $('.ct-grids')[0].getBoundingClientRect()
                    };

                    // Get a reference to the svg path for the average balance
                    self.averagePath = {
                        element: document.querySelector('.ct-series-e .ct-line'),
                        length: document.querySelector('.ct-series-e .ct-line').getTotalLength()
                    };

                    // Hide the tooltip and point
                    self.hideTooltip();
                    self.graphPoint.removeClass('graph-point--visible');

                    if (!self.graphOverlay.hasClass('graph-overlay--closing')) {
                        self.graphOverlay.addClass('graph-overlay--visible');
                    }

                    // Show the key
                    self.graphKey.addClass('graph__key--visible');

                    // Position the vertical line in the middle
                    self.graphLine.css({
                        height: $('.ct-horizontal').attr('y2') + 'px',
                        left: self.ctGrids.boundingRect.left + 200
                    });

                    // The position to animate left
                    var graphStartOffset = self.ctGrids.boundingRect.left - self.graphContainer.offset().left;
                    var left = $('.ct-point')[self.model.get('numberOfYears')].getBoundingClientRect().left - self.graphContainer.offset().left;

                    // Animate the line up the graph
                    self.graphLine.finish();
                    self.graphLine.animate({
                        left: left
                    }, 1000, function () {

                        var point = self.getAveragePathPoint(left - graphStartOffset);

                        self.graphPoint.finish();
                        self.graphPoint.css({
                            left: left,
                            top: point.y
                        });

                        var year = self.model.get('numberOfYears');

                        self.updateTooltip(left, point.y, year, true);
                        self.showTooltip();
                        self.graphPoint.addClass('graph-point--visible');
                    });

                    var width = self.ctGrids.boundingRect.right - self.ctGrids.boundingRect.left;
                    var height = self.ctGrids.boundingRect.bottom - self.ctGrids.boundingRect.top;

                    // Work out the x position of the rectangle. If on mobile set to
                    // 0 as there is no y axis labels, otherwise set to 120 to account
                    // for the labels
                    var x = 120;
                    if ($('.responsive').css('z-index') <= 3) {
                        x = 0;
                    }

                    // Add the grey background svgrectangle
                    var svgNS = 'http://www.w3.org/2000/svg';
                    var rect = document.createElementNS(svgNS, 'rect');
                    rect.setAttributeNS(null, 'x', x);
                    rect.setAttributeNS(null, 'y', 0);
                    rect.setAttributeNS(null, 'height', height);
                    rect.setAttributeNS(null, 'width', width);
                    rect.setAttributeNS(null, 'fill', '#f7f7f7');
                    document.getElementsByClassName('ct-grids')[0].appendChild(rect);

                    if (self.model.get('targetAchievable') === false && self.model.get('targetType') !== null && self.model.get('targetBalance') > 0) {
                        $('.target-unachievable').removeClass('hidden');
                    } else {
                        $('.target-unachievable').addClass('hidden');
                    }
                });
            }

        }

    });

    return view;

});
