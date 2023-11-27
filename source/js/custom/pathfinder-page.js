(function() {

    var chart;
    var startAmount = 1000;
    var startAmountUpdatedByUser = false;
    var monthlyDeposit = 100;
    var monthlyDepositUpdatedByUser = false;
    var numberOfYears = 10;
    var targetYears = 10;
    var numberOfYearsUpdatedByUser = false;
    var ready = false;
    var loading = false;
    var isTouching = false;
    var lastX = 0;
    var lastY = 0;
    var currentSeries;
    var ctGrids;
    var averagePath;
    var graphPoint = $('.graph-point');
    var graphKey = $('.graph__key');
    var graphLine = $('.graph-line');
    var graphContainer = $('.graph-container');
    var tooltip = {
        container: $('.graph-tooltip'),
        poor: $('.graph-tooltip .poor'),
        average: $('.graph-tooltip .average'),
        good: $('.graph-tooltip .good'),
        countUpAnim: null
    };
    var graphOverlay = $('.graph-overlay');

    // Get a reference to input elements
    var balanceInput = $('.start-balance');
    var monthlyDepositInput = $('.monthly-deposit');

    /**
     * Generates the options object to initialise the chart. The options will
     * vary depending on browser size
     * @return Object The chart options
     */
    function getChartOptions() {
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
                labelInterpolationFnc: function(value, index) {
                    if (numberOfYears > 20) {
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
                labelOffset: {
                    x: -10,
                    y: 6
                },
                labelInterpolationFnc: function(value) {
                    return '£' + formatMoney(value, 0);
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
    }

    /**
     * Generates the years array for the y axis of the chartist.js graph
     * based on the number of years
     */
    function getYears() {
        // If we have a target year set make the number of years the
        // target years
        if (targetYears !== null && !numberOfYearsUpdatedByUser) {
            numberOfYears = targetYears;
        }

        var years = [];
        for (var i = 0; i <= numberOfYears + 5; i++) {
            years.push(i);
        }
        return years;
    }

    function drawChart(chart, years, series) {
        var chartData = {
            // A labels array that can contain any sort of values
            labels: years,
            // Our series array that contains series objects or in this case series data arrays
            series: series
        };

        if (!chart) {
            chart = new Chartist.Line('.ct-chart', chartData, getChartOptions());

            chart.on('created', function() {
                ready = true;
                // We call detach on the graph to remove its default event listeners
                // this gives us more control over what happens to the graph on window
                // resize etc
                chart.detach();

                // Grad a reference to the .ct-grids elements as we will make
                // use of this a lot
                ctGrids = {
                    element: $('.ct-grids'),
                    width: $('.ct-grids')[0].getBoundingClientRect().right - $('.ct-grids')[0].getBoundingClientRect().left,
                    boundingRect: $('.ct-grids')[0].getBoundingClientRect()
                };

                // Get a reference to the svg path for the average balance
                averagePath = {
                    element: document.querySelector('.ct-series-b .ct-line'),
                    length: document.querySelector('.ct-series-b .ct-line').getTotalLength()
                };

                // Hide the tooltip and point
                hideTooltip();
                graphPoint.removeClass('graph-point--visible');

                if (!graphOverlay.hasClass('graph-overlay--closing')) {
                    graphOverlay.addClass('graph-overlay--visible');
                }

                // Show the key
                graphKey.addClass('graph__key--visible');
                // Position the vertical line in the middle
                graphLine.css({
                    height: $('.ct-horizontal').attr('y2') + 'px',
                    left: ctGrids.boundingRect.left
                });
                // The position to animate left
                var graphStartOffset = ctGrids.boundingRect.left - graphContainer.offset().left;
                var left = $('.ct-point')[numberOfYears - 2].getBoundingClientRect().left - graphContainer.offset().left;

                // Animate the line up the graph
                graphLine.finish();
                graphLine.animate({
                    left: left
                }, 1000, function() {
                    var point = getAveragePathPoint(left - graphStartOffset);
                    graphPoint.finish();
                    graphPoint.css({
                        left: left,
                        top: point.y - 10
                    });
                    var year = numberOfYears - 1;
                    updateTooltip(left, point.y, year, true);
                    showTooltip();
                    graphPoint.addClass('graph-point--visible');
                });

                var width = ctGrids.boundingRect.right - ctGrids.boundingRect.left;
                var height = ctGrids.boundingRect.bottom - ctGrids.boundingRect.top;

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
                // if (self.model.get('targetAchievable') === false && self.model.get('targetType') !== null && self.model.get('targetBalance') > 0) {
                //     $('.target-unachievable').removeClass('hidden');
                // } else {
                //     $('.target-unachievable').addClass('hidden');
                // }
            });
        } else {
            chart.update(this.chartData, getChartOptions());
        }
    }

    function calculateGraph() {
        // Get the values from the api
        var queryBody = {
            "caller": "WEB",
            "currency": "GBP",
            "riskLevel": 4,
            "lumpSump": 2000,
            "goals": [{
                "goalName": "Test123",
                "payOutYear": "0",
                "amount": "0"
            }],
            "duration": 10,
            "msp": {
                "amount": 100,
                "mode": 0
            },
            "returns": 1
        };

        $.ajax({
            // url: '/json/new-forecast-engine-01.json',
            // url:  'https://forecast-service-dev.paasnp.bip.uk.fid-intl.com/rest/fetchForecast',
            // type: 'GET',
            // url https://dev1.fidelity.co.uk/gateway/planforecast/v1/rest/fetchForecast POST
            url: 'assets/js/api.json',
            type: 'GET',
            contentType: 'application/json',
            data: JSON.stringify(queryBody),
            processData: false,
            dataType: 'json',
            success: function(response) {
                var newSeries = [
                    {
                        name: 'exceptional',
                        data: []
                    }, // 0 - Exceptional market
                    {
                        name: 'average',
                        data: []
                    }, // 1 - Average market
                    {
                        name: 'poor',
                        data: []
                    }, // 2 - poor Line
                    {
                        name: 'cash',
                        data: []
                    }, // 3 - cash market
                    {
                        name: 'average-line',
                        data: []
                    } // 4 - average line market
                ];

                // //NOTE:
                // // may need sorting : sort(function(a,b){ return a.year -b.year;})
                response.wealthProjections.forEach(function(item, index) {
                    newSeries[0].data[index] = {
                        meta: index,
                        value: item.high.value
                    };
                    newSeries[1].data[index] = {
                        meta: index,
                        value: item.medium.value
                    };
                    newSeries[2].data[index] = {
                        meta: index,
                        value: item.low.value
                    };
                    newSeries[3].data[index] = {
                        meta: index,
                        value: startAmount + (index * (monthlyDeposit * 12))
                    };
                    newSeries[4].data[index] = {
                        meta: index,
                        value: item.medium.value
                    };
                });
                console.log(newSeries);
                currentSeries = newSeries;
                drawChart(chart, getYears(), newSeries);
                // self.set({series: newSeries});
                // self.set({loading: false});
                //
                // // See if our goal is achievable
                // if (self.get('riskLevel') !== null && self.get('targetBalance') > 0) {
                //     var currentSeries = self.get('series')[2].data; // 1 is the average line
                //
                //     if (currentSeries[self.get('targetYears')].value >= self.get('targetBalance')) {
                //         self.set('targetAchievable', true);
                //     } else {
                //         self.set('targetAchievable', false);
                //     }
                // }
            }
        });
    }

    /**
     * Take an integer and format it as money
     * like 24,123.24
     * @param  {Int} n The number to format
     * @param  {Int} c Numnber of decimal places
     * @param  {String} d Decimal symbol ( optional )
     * @param  {String} t Thousands symbol ( optional )
     * @return {String}
     */
    function formatMoney(n, c, d, t) {
        c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? '.' : d,
            t = t == undefined ? ',' : t,
            s = n < 0 ? '-' : '',
            i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
            j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
    }

    /**
     * Gets the point at position x along the average balance path
     * @param  {Int} x The x coordintate of the mouse of pointer
     * @return {Object}  An object containing an x and y value
     */
    function getAveragePathPoint(x) {
        // Find our position along the average path
        var percentAcross = 1 - (((ctGrids.width - x) / ctGrids.width));
        // Cap the percentage between 0 and 1
        percentAcross = Math.min(Math.max(0, percentAcross), 1);
        if (isNaN(percentAcross)) {
            return {
                x: 0,
                y: 0
            };
        }

        // Get the closest point on the average line
        return averagePath.element.getPointAtLength(percentAcross * averagePath.length);
    }

    /**
     * Find the year closest to the x coordinate provided
     * @param  {Int} x An x coordinate relative to the page
     * @return {Int} The closest year on the graph
     */
    function getClosestYear(x) {
        var closestDistance = 999999;
        var closestYear;
        $('.ct-labels .ct-label.ct-horizontal').each(function(index, label) {
            var distance = Math.abs(label.getBoundingClientRect().left - x);
            if (distance < closestDistance) {
                closestYear = $(label).text();
                closestDistance = distance;
            }
        });
        return closestYear;
    }

    /**
     * Updates the position of the point on the graph
     * @param  {Int} x
     * @param  {Int} y
     */
    function updatePoint(x, y) {
        graphPoint.finish();
        graphPoint.css({
            left: x,
            top: y
        });
    }

    /**
     * Positions and updates the chart tooltip with new values
     * @param  {Int} x
     * @param  {Int} y
     */
    function updateTooltip(x, y, year, countup) {
        var poorMktValue, averageMktValue, goodMktValue;

        // By default we don't want to count up
        countup = typeof countup !== 'undefined' ? countup : false;

        // Position the tooptip
        tooltip.container.css({
            top: y - tooltip.container.height() * 1.1,
            left: x
        });

        // Update its values
        var valuesAtYear = getPointsByYear(year);
        poorMktValue = Math.ceil(valuesAtYear[2] / 100) * 100;
        averageMktValue = Math.ceil(valuesAtYear[1] / 100) * 100;
        goodMktValue = Math.ceil(valuesAtYear[0] / 100) * 100;
        tooltip.countUpAnims = tooltip.countUpAnims || {
            poor: null,
            average: null
        };

        function createCountUpAnim(self, className, market, val) {
            self.tooltip.countUpAnims[market] = new CountUp(self.tooltip[className][0], 0, val, 0, 2.0, {
                prefix: '£'
            });

            self.tooltip.countUpAnims[market].start();
        }

        function updateCountUpAnim(self, market, val) {
            self.tooltip.countUpAnims[market].update(val);
        }

        // Set the estimated value
        // if (countup) {
        if (true === false) {
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
            tooltip['poor'].empty().append('£' + formatMoney(poorMktValue, 0));
            tooltip['average'].empty().append('£' + formatMoney(averageMktValue, 0));
            tooltip['good'].empty().append('£' + formatMoney(goodMktValue, 0));
        }
        // this.updateMarketPercentages();
    }

    /**
    * Find the graph points at a certain x position ( year )
    * @param  {Int} year
    * @return {Array} An array of the points
    */
    function getPointsByYear(year) {
        var values = [];

        currentSeries.forEach(function(series, index) {
            values.push(series.data[year].value);
        });
        return values;
    }

    /**
    * Shows the graph tooltip
    */
    function showTooltip() {
        tooltip.container.addClass('graph-tooltip--visible');
    }

    /**
     * Hides the graph tooltip
     */
    function hideTooltip() {
        tooltip.container.removeClass('graph-tooltip--visible');
    }

    /**
     * Handler for the move events on the graph
     * to allow dragging of the tooltip
     * @param  Event event
     */
    function graphPointMove(event) {
        if (isTouching) {
            // We only want to trigger the mouseover function if
            // the user is moving left or right, and not up or down
            // this is so the user can still scroll up and down the
            // page while touching the graph
            var moveX;
            var moveY;
            if (event.type == 'mousemove') {
                moveX = Math.abs(lastX - event.clientX);
                moveY = Math.abs(lastY - event.clientY);
            } else if (event.type == 'touchmove') {
                moveX = Math.abs(lastX - event.originalEvent.touches[0].pageX);
                moveY = Math.abs(lastY - event.originalEvent.touches[0].pageY);
            }

            if (moveX > moveY || moveX > 20) {
                event.preventDefault();
                graphMouseover(event);
            }
        }
    }

    /**
     * Handler for mousing over the grpah. Responsible for updating the
     * chart-info section, showing the tooltip and moving the graph vertical
     * line all based on the position of the mouse
     * @param  {Event} event
     */
    function graphMouseover(event) {
        if (!loading) {
            // Get the x coordinate of the event
            var x = 0;
            if (event.type == 'mousemove') {
                x = event.clientX;
            } else if (event.type == 'touchmove') {
                x = event.originalEvent.touches[0].pageX;
            }

            // Find the year closest to the cursor
            var year = getClosestYear(x);

            // Get the offset from the left of the graph
            var graphStartOffset = ctGrids.boundingRect.left - graphContainer.offset().left;
            var left = Math.min(Math.max(x - ctGrids.boundingRect.left, 0), ctGrids.boundingRect.right - ctGrids.boundingRect.left);

            // Get the closest point on the average line
            var point = getAveragePathPoint(left);

            // Move the chart line
            graphLine.finish();
            graphLine.css({
                left: left + graphStartOffset
            });

            // Move the graph point along the average line
            updatePoint(left + graphStartOffset, point.y - 10);

            // Move graph tooltip
            updateTooltip(left + graphStartOffset, point.y, year);
        }
    }

    function graphPointDown(event) {
        event.preventDefault();
        isTouching = true;
        ctGrids.element.attr('class', 'ct-grids ct-grids--grabbing');

        // We keep track of the starting x position so we can work out
        // whether the user is dragging left and right or up and down
        if (event.type == 'mousedown') {
            lastX = event.clientX;
            lastY = event.clientY;
        } else if (event.type == 'touchstart') {
            lastX = event.originalEvent.touches[0].pageX;
            lastY = event.originalEvent.touches[0].pageY;
        }
    }

    /**
     * Handle letting go of the graph point,
     * eg mouseleave or touchend
     *
     * @param  Event event
     */
    function graphPointLeave(event) {
        event.preventDefault();
        if (ready) {
            isTouching = false;
            ctGrids.element.attr('class', 'ct-grids');
        }
    }

    /**
    * Handler for the start balance input change. Update the model
    * with the value from the input
    * @param  {Event} event
    */
    function updateStartBalance(event) {
        var input = $(event.target);

        // Removes all non numeric characters from string then
        // parse as an integer
        var val = parseInt(input.val().replace(/\D/g, ''));
        setStartBalance(val);
    }

    /**
     * Set the start amount and perform
     * and update based on the new risk
     *
     * @param Integer value
     */
    function setStartBalance(balance) {
        startAmount = balance;
        startAmountUpdatedByUser = true;
        calculateGraph();
    }

    /**
     * Handler for the number of years input change. Updates the model
     * with the value from the input
     * @param  {Event} event
     */
    function updateNumberYears(event) {
        var val = parseInt($(event.target).val());
        if (val > 2) {
            numberOfYears = val;
            numberOfYearsUpdatedByUser = true;
            calculateGraph();
        }
    }

    /**
     * Handler for the start balance input field on blur
     * @param  {Event} event
     */
    function formatInput(event) {
        var input = $(event.target);

        // Removes all non numeric characters from string then
        // parse as an integer
        var val = formatMoney(parseInt(input.val().replace(/\D/g, '')), 0);
        input.val('£' + val);
    }

    /**
     * Handler for the monthly deposit input change. Updates the model
     * with the value from the input
     * @param  {Event} event
     */
    function updateMonthlyDeposit(event) {
        var input = $(event.target);
        // Removes all non numeric characters from string then

        // parse as an integer
        var val = parseInt(input.val().replace(/\D/g, ''));
        console.log("Monthly val: " + val);
        setMonthlyDeposit(val);
    }

    /**
     * Set the monthly deposit and perform
     * and update based on the new risk
     *
     * @param Integer value
     */
    function setMonthlyDeposit(value) {
        monthlyDeposit = value;
        monthlyDepositUpdatedByUser = true;
        calculateGraph();
    }

    /**
    * Handler for for clicking on a risk-select button. This will update
    * the risk level of the model and in turn update the graph
    * @param  {Event} event
    */
    function updateRisk(event) {
        event.preventDefault();

        var val = parseInt($(event.currentTarget).val());

        // Swap in the correct risk explanation
        $('.risk-explanation').removeClass('hide');
        $('.risk-explanation p').addClass('hide');
        $('.risk-explanation .risk' + val).removeClass('hide');
        $('.forecasting-info').removeClass('hide');
        $('.pathfinder__graph').removeClass('hide');
        $('.pathfinder__inputs').removeClass('hide');

        hideTooltip();
        graphPoint.removeClass('graph-point--visible');

        // Moe pointer to the correct position, only on desktop
        var zindex = $('.js-mediaquery').css('z-index');

        if (zindex < 3) {
            var parent = $(event.currentTarget).parent()[0];

            $('.risk-explanation .risk-explanation__pointer').css({
                left: parent.getBoundingClientRect().left + ((parent.getBoundingClientRect().right - parent.getBoundingClientRect().left) / 2) - $('.risk-explanation')[0].getBoundingClientRect().left
            });
        }

        // this.model.setRiskLevel(val);
        riskLevel = val;
        calculateGraph();
        // Update market percentages
        showStep2();
    }

    /**
     * Shows and hides the graph overlay explaining what is happening
     * @param  Event event
     */
    function toggleOverlay(event) {
        event.preventDefault();
        graphOverlay.toggleClass('hidden');
    }

    /**
     * Hides and shows the graph inputs on mobile
     */
    function toggleSettings(event) {
        // event.preventDefault();
        $('.graph-inputs').toggleClass('tablet-hidden');

        // Scroll back to the graph if it is closing
        if ($('.graph-inputs').hasClass('tablet-hidden')) {
            $('html, body').animate({
                scrollTop: $('#graph-container').offset().top
            }, 200);
        }
    }

    /**
     * Gets url parameters by name if they exist
     * @param  String name The name of the url param
     * @return String
     */
    function urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if (results === null) {
            return null;
        } else {
            return results[1] || 0;
        }
    }

    function debounce(func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function() {
            var last = Date.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();

            var callNow = immediate && !timeout;

            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    }

    /**
     * Reveals step 2 of pathfinder
     */
    function showStep2() {
        $('.number-badge.hide').removeClass('hide');
        $('.number-badge--dotted').addClass('hide');
        $('.step-2-activatable').removeClass('hide');
    }

    /**
     * Chose a fund and show its performance and tabs
     * @param  Event event
     */
    function selectFund(event) {
        event.preventDefault();

        var button = $(event.currentTarget);
        var container = button.closest('.option-panel');

        $('.option-panel').removeClass('is-active');
        $('.option-panel .js-select-fund-trigger').text('Select this fund type');

        button.text('Selected');
        container.addClass('is-active');

        $('.fund-info-container').load('pathfinder-funds/risk-' + riskLevel + '-' + button.data('type') + '.html', function() {
            $(document).foundation();
        });
    }

    if ( $( '.graph-container' ).length > 0 ) {
        // Set parameters from url
        if (urlParam('targetBalance')) {
            targetBalance = parseInt(urlParam('targetBalance'));
        }

        if (urlParam('targetYears')) {
            targetYears = parseInt(urlParam('targetYears'));
        }

        startAmount = parseInt(urlParam('lumpSum')) || 5000;
        $('.lump-sum-input').val(startAmount);

        monthlyDeposit = parseInt(urlParam('monthlyContrib')) || 500;
        $('.monthly-deposit').val(monthlyDeposit);

        numberOfYears = parseInt(urlParam('numberOfYears')) || 10;
        $('.number-years').val(numberOfYears);

        if (urlParam('pensionAge')) {
            numberOfYears = 65 - parseInt(urlParam('pensionAge'));
            $('.number-years').val(numberOfYears);
        }

        if (urlParam('type')) {
            targetType = urlParam('type');
        }

        calculateGraph();
        // Graph move event listeners
        $('.ct-chart').on('mousemove', graphPointMove);
        $('.ct-chart').on('touchmove', graphPointMove);
        graphPoint.on('mousemove', graphPointMove);
        graphPoint.on('touchmove', graphPointMove);
        $('.ct-chart').on('mousedown', graphPointDown);
        graphPoint.on('mousedown', graphPointDown);
        $('.ct-chart').on('mouseleave', graphPointLeave);
        $('.ct-chart').on('mouseup', graphPointLeave);
        graphPoint.on('mouseup', graphPointLeave);

        // Graph form event listeners
        $('.lump-sum-input').on('keyup', debounce(updateStartBalance, 300));
        $('.lump-sum-input').on('focusout', formatInput);
        $('.monthly-deposit').on('focusout', formatInput);
        $('.monthly-deposit').on('keyup', debounce(updateMonthlyDeposit, 300));
        $('.number-years').on('keyup', debounce(updateNumberYears, 300));
        $('.risk-select').on('click', updateRisk);
        $('input[type=radio][name=pathfinder-risk]').on('change', updateRisk);
        $('.graph-overlay__ok').on('click', toggleOverlay);
        $('.show-settings').on('click', toggleSettings);
        $('.graph-inputs__close').on('click', toggleSettings);
        $('.graph-inputs__submit').on('click', toggleSettings);
        $('.js-select-fund-trigger').on('click', selectFund);

        $(window).on('resize', debounce(calculateGraph, 500));
    }




})();