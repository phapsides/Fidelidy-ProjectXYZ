define([
    'jquery',
    'underscore',
    'backbone',
    'marionette'
], function ($, _, Backbone, Marionette) {

    function getMarketPercentages (riskLevel) {
        var goodMktPercent, mediumMktPercent, poorMktPercent;

        goodMktPercent = [2.84, 4.8, 6.76, 8.73, 10.69];
        mediumMktPercent = [1.86, 2.84, 3.82, 4.8, 5.29];
        poorMktPercent = [0.88, -0.1, -1.08, -2.06, -3.04];

        return [goodMktPercent[riskLevel-1], mediumMktPercent[riskLevel-1], poorMktPercent[riskLevel-1]];
    }

    var ChartModel = Backbone.Model.extend({
        initialize: function () {
            // Store a money format value for the start balanace
            // and monthlyDeposit
            this.set('startBalanceFormatted', this.formatMoney(this.get('startBalance'), 0));
            this.set('monthlyDepositFormatted', this.formatMoney(this.get('monthlyDeposit'), 0));

            this.generateYears();
            this.calculateSeries();

            this.on('change:startBalance', this.calculateSeries);
            this.on('change:monthlyDeposit', this.calculateSeries);
            this.on('change:riskLevel', this.calculateSeries);
            this.on('change:numberOfYears', function () {
                this.generateYears();
                this.calculateSeries();
            });
        },
        defaults: {
            startBalance: 10000,
            monthlyDeposit: 0,
            numberOfYears: 10,
            years: ['0', '1', '2', '3', '4', '5', '6'],
            series: [
                {name: 'exceptional', data: []}, // 0 - Exceptional market
                {name: 'average', data: []}, // 1 - Average market
                {name: 'poor', data: []}, // 2 - poor Line
                {name: 'cash', data: []}, // 3 - cash market
                {name: 'average-line', data: []} // 4 - average line market
            ],
            riskLevel: null,
            targetBalance: null, // The balance the user wants to achieve
            targetYears: null, // The number of years to achieve the target balance
            targetAchievable: false, // Whether the target is achievable
            targetType: null,
            updatedByUser: false,
            loading: true
        },

        setRiskLevel: function(riskLevel){
            this.set({riskLevel : riskLevel});
            this.set({marketPercentages: getMarketPercentages(riskLevel)});
            console.log(this.get('marketPercentages'));
        },

        /**
         * Generates the series to be used on a chartist.js graph based on the
         * interest rates and the current risk level
         */
        calculateSeries: function () {

            var self = this;

            self.set({loading: true});
            self.trigger('change:loading');

            if (this.get('riskLevel') !== null) {
                // Create the series for each of the available risks
                var numberOfYears = self.get('years').length;
                var newSeries = {};

                // The risk level on the Fidelity api goes
                // 2,4,6,8,9 not 1,2,3,4,5 so we need to map
                // our risk level to the api risk level
                var mappedRiskLevel = 2;
                switch (self.get('riskLevel')) {
                    case 1:
                        mappedRiskLevel = 2;
                        break;
                    case 2:
                        mappedRiskLevel = 4;
                        break;
                    case 3:
                        mappedRiskLevel = 6;
                        break;
                    case 4:
                        mappedRiskLevel = 8;
                        break;
                    case 5:
                        mappedRiskLevel = 9;
                        break;
                }

                // Get the values from the api
                var queryBody = {
                    "caller": "WEB",
                    "currency": "GBP",
                    "riskLevel": self.get('riskLevel'),
                    "lumpSump": self.get('startBalance'),
                    "goals": [
                        {
                            "goalName": "Test123",
                            "payOutYear": "0",
                            "amount": "0"
                        }
                    ],
                    "duration": self.get('years').length - 1,
                    "msp": {
                        "amount": self.get('monthlyDeposit') ,
                        "mode": 0
                    },
                    "returns": 1
                };

                console.log(queryBody);

                newSeries = [
                    {name: 'exceptional', data: []}, // 0 - Exceptional market
                    {name: 'average', data: []}, // 1 - Average market
                    {name: 'poor', data: []}, // 2 - poor Line
                    {name: 'cash', data: []}, // 3 - cash market
                    {name: 'average-line', data: []} // 4 - average line market
                ];

                $.support.cors = true;

                $.ajax({
                    // url: '/json/new-forecast-engine-01.json',
                    // url:  'https://forecast-service-dev.paasnp.bip.uk.fid-intl.com/rest/fetchForecast',
                    // type: 'GET',
                    
                    url:  'https://dev1.fidelity.co.uk/gateway/planforecast/v1/rest/fetchForecast',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(queryBody),
                    processData: false,
                    dataType: 'json',
                    success: function (response) {

                        //NOTE:
                        // may need sorting : sort(function(a,b){ return a.year -b.year;})
                        response.wealthProjections.forEach(function (item, index) {
                            newSeries[0].data[index] = {meta: index, value: item.high.value};
                            newSeries[1].data[index] = {meta: index, value: item.medium.value};
                            newSeries[2].data[index] = {meta: index, value: item.low.value};
                            newSeries[3].data[index] = {meta: index, value: self.get('startBalance') + ( index * ( self.get('monthlyDeposit') * 12 ) )};
                            newSeries[4].data[index] = {meta: index, value: item.medium.value};
                        });

                        self.set({series: newSeries});
                        self.set({loading: false});

                        // See if our goal is achievable
                        if (self.get('riskLevel') !== null && self.get('targetBalance') > 0) {
                            var currentSeries = self.get('series')[2].data; // 1 is the average line

                            if (currentSeries[self.get('targetYears')].value >= self.get('targetBalance')) {
                                self.set('targetAchievable', true);
                            } else {
                                self.set('targetAchievable', false);
                            }
                        }

                    }
                });

            }

        },

        /**
         * Generates the years array for the y axis of the chartist.js graph
         * based on the number of years
         */
        generateYears: function () {
            // If we have a target year set make the number of years the
            // target years
            if (this.get('targetYears') !== null && !this.get('updatedByUser')) {
                this.set('numberOfYears', this.get('targetYears'));
            }

            var years = [];
            for (var i = 0; i <= this.get('numberOfYears') + 5; i++) {
                years.push(i);
            }

            this.set('years', years);
        },

        /**
         * Find the graph points at a certain x position ( year )
         * @param  {Int} year
         * @return {Array} An array of the points
         */
        getPointsByYear: function (year) {
            var values = [];

            this.get('series').forEach(function (series, index) {
                values.push(series.data[year].value);
            });

            return values;
        },

        /**
         * Take an integer and format it as money
         * like 24,123.24
         * @param  {Int} n The number to format
         * @param  {Int} c Numnber of decimal places
         * @param  {String} d Decimal symbol ( optional )
         * @param  {String} t Thousands symbol ( optional )
         * @return {String}
         */
        formatMoney: function (n, c, d, t) {
            c = isNaN(c = Math.abs(c)) ? 2 : c,
                    d = d == undefined ? '.' : d,
                    t = t == undefined ? ',' : t,
                    s = n < 0 ? '-' : '',
                    i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '',
                    j = ( j = i.length ) > 3 ? j % 3 : 0;
            return s + ( j ? i.substr(0, j) + t : '' ) + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + ( c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
        }
    });

    // Return the model for the module
    return ChartModel;

});
