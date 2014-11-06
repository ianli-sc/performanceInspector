(function(w) {
    var loadTime = 20000;

    /**
     * get res before load
     * @param res
     */
    function getDataBeforeLoad(res) {
        var result = [];
        $.each(res, function(key, value) {
            if(value.fetchStart <= loadTime) {
                result.push(value);
            }
        });
        return result;
    }
    /**
     * get all entries
     */
    function getEntries() {
        var entries;
        if(chrome && chrome.devtools) {
            var devTools = chrome.devtools;
            var inspectedWindow = devTools.inspectedWindow;
            inspectedWindow.eval("JSON.stringify(window.performance.getEntries())", function(result, e) {
                if(e) {
                    document.body.innerHTML = 'Eval code error : ' + e;
                } else {
                    entries = JSON.parse(result);
                    createEntries(entries, $('.all'));
                    createEntries(getDataBeforeLoad(entries), $('.beforeonload'));
                }
            });
        } else {
            entries = window.performance.getEntries();
            createEntries(entries, $('.all'));
            createEntries(getDataBeforeLoad(entries), $('.beforeonload'));
        }
    }

    /**
     * create panel for memory
     */
    function createMemory(memory) {
        var type = 'area';
        var keyList = [];
        var dataList = [];
        var text;
        $.each(memory, function(key, value) {
            keyList.push(key);
            text = value / 1024 / 1024;
            dataList.push(parseFloat(text.toFixed(4)));
        });
        text = 'Memory Used';
        $('.memory > div.container').highcharts({
            chart: {
                type: type,
                backgroundColor : 'rgba(255, 255, 255, 0)'
            },
            title: {
                text: text
            },
            xAxis: {
                categories: keyList
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'MB'
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#333',
                            fontSize: '20px'
                        },
                        formatter: function () {
                            return this.y + 'MB';
                        }
                    }
                }
            },
            series: [{
                name : 'current page',
                data : dataList
            }]
        });
    }

    /**
     * create timing
     */
    function createTiming(timing) {
        var keyList = [
            'redirect',
            'fetch app catch',
            'dns look up',
            'tcp connect',
            'request',
            'response',
            'dom loaded',
            'dom complete',
            'onload'
        ];
        var dataList = [];
        var startTime = timing.fetchStart;

        function getRange(now) {
            if(now) {
                return now - startTime;
            } else {
                return now;
            }
        }

        //save load Time
        loadTime = timing.loadEventStart - startTime;
        dataList.push(
            [getRange(timing.redirectStart), getRange(timing.redirectEnd)],
            [getRange(timing.fetchStart), getRange(timing.domainLookupStart)],
            [getRange(timing.domainLookupStart), getRange(timing.domainLookupEnd)],
            [getRange(timing.connectStart), getRange(timing.connectEnd)],
            [getRange(timing.requestStart), getRange(timing.responseStart)],
            [getRange(timing.responseStart), getRange(timing.responseEnd)],
            [getRange(timing.domLoading), getRange(timing.domContentLoadedEventEnd)],
            [getRange(timing.domContentLoadedEventEnd), getRange(timing.domComplete)],
            [getRange(timing.loadEventStart), getRange(timing.loadEventEnd)]

        );
        $('.timing > div.column').highcharts({
            chart: {
                type: 'columnrange',
                backgroundColor : 'rgba(255, 255, 255, 0)',
                inverted: true
            },
            title: {
                text: 'Timing line'
            },
            xAxis: {
                categories: keyList
            },
            yAxis: {
                label : '{value} ms',
                title: {
                    text: 'Time for start and end of event'
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                columnrange: {
                    dataLabels: {
                        enabled: true,
                        formatter: function () {
                            return this.y + 'ms';
                        }
                    }
                }
            },
            series: [{
                name : 'current page',
                data : dataList
            }]
        });
        var dataLength = [];
        var item;
        $.each(dataList, function(key, value) {
            item  = [];
            item.push(keyList[key]);
            item.push(value[1] - value[0]);
            dataLength.push(item);
        });
        $('.timing > div.pie').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            title: {
                text: 'Pie view for timing'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        connectorColor: 'silver'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: 'All time percentage',
                data: dataLength
            }]
        });
    }

    /**
     * create createEntries
     */
    function createEntries(resources, root) {
        var brandsDataAmount = [];
        var brandsDataTimes = [];
        var drilldownSeries = [];
        var tmpObj = {};
        var easyfinder = {};
        var foundData;
        var initiatorType;
        var totalAmount = 0;
        var totalTime = 0;
        var totalDrillTime = [];

        $.each(resources, function(key, value) {
            //amout and time increase
            totalAmount ++;
            totalTime += value.duration;

            initiatorType = value.initiatorType;
            foundData = easyfinder[initiatorType];
            if(foundData === undefined) {
                //In fact the 3 array have same length
                easyfinder[initiatorType] = brandsDataAmount.length;

                //create data for brand
                tmpObj = {
                    drilldown : initiatorType,
                    fullName : initiatorType,
                    name : initiatorType,
                    data : 1, //act data
                    y : 1     //percentage
                };
                brandsDataAmount.push($.extend({}, tmpObj));
                tmpObj.data = value.duration;
                brandsDataTimes.push($.extend({}, tmpObj));

                //create data for drill
                var name = value.name;
                var shortName = name.substr((name.lastIndexOf('/') + 1), 20);
                //full name may toooooooo long
                var fullName4show = name.length < 50 ? name : (name.slice(0, 30) + '...' + shortName);
                tmpObj = {
                    data : [
                        {
                            fullName : fullName4show,
                            name : shortName,
                            data : value.duration,
                            y : 1
                        }
                        //[value.name, value.duration]
                    ],
                    id : initiatorType,
                    name : initiatorType
                };
                drilldownSeries.push($.extend({}, tmpObj));
                //add total drill time for each drill
                totalDrillTime.push(value.duration);
            } else {
                //count increase
                var amount = brandsDataAmount[foundData].data;
                amount++;
                brandsDataAmount[foundData].data = amount;

                //duration increase
                amount = brandsDataTimes[foundData].data;
                amount += value.duration;
                brandsDataTimes[foundData].data = amount;

                //add to series
                //tmpObj = [value.name, value.duration];
                var name = value.name;
                var shortName = name.substr((name.lastIndexOf('/') + 1), 20);
                //full name may toooooooo long
                var fullName4show = name.length < 50 ? name : (name.slice(0, 30) + '...' + shortName);
                tmpObj = {
                    name : shortName,
                    fullName : fullName4show,
                    y : 1,
                    data : value.duration
                };
                drilldownSeries[foundData].data.push(tmpObj);
                //update drill all time
                amount = totalDrillTime[foundData];
                amount += value.duration;
                totalDrillTime[foundData] = amount;
            }
        });

        //create percentage
        $.each(brandsDataAmount, function(key, value) {
            value.y = value.data / totalAmount * 100;
        });
        $.each(brandsDataTimes, function(key, value) {
            value.y = value.data / totalTime * 100;
            value.data = value.data.toFixed(4) + 'ms';
        });
        var curTotalDrillTime;
        $.each(drilldownSeries, function(key, value) {
            curTotalDrillTime = totalDrillTime[key];
            $.each(value.data, function(index, item) {
                item.y = item.data / curTotalDrillTime * 100;
                item.data = item.data.toFixed(4) + 'ms';
            });
        });
        // Create the chart
        $('div.pie-amout', root).highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Resources amount detail - total : ' + totalAmount
            },
            subtitle: {
                text: 'Click the slices to view timing details'
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y:.1f}%'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color};font-weight:bolder;">{point.fullName} </span>: <b>{point.data} </b><br/>'
            },

            series: [{
                name: 'Amount of Resource',
                colorByPoint: true,
                data: brandsDataAmount
            }],
            drilldown: {
                series: drilldownSeries
            }
        });
        $('div.pie-duration', root).highcharts({
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Resources duration detail - total : ' + parseFloat(totalTime).toFixed(4) + 'ms'
            },
            subtitle: {
                text: 'Click the slices to view timing details'
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}: {point.y:.1f}%'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color};font-weight:bolder;">{point.fullName} </span>: <b>{point.data} </b><br/>'
            },

            series: [{
                name: 'Duration of resource',
                colorByPoint: true,
                data: brandsDataTimes
            }],
            drilldown: {
                series: drilldownSeries
            }
        });
    }

    /**
     * create view of performance
     */
    function createView(performance) {
        createMemory(performance.memory);
        createTiming(performance.timing);
    }

    function init() {
        if(chrome && chrome.devtools) {
            chrome.devtools.inspectedWindow.eval(
                "window.performance",
                function (result, isException) {
                    if(isException) {
                        document.body.innerHTML = 'Eval code error : ' + isException;
                    } else {
                        createView(result);
                        getEntries();
                    }
                }
            );
        } else {
            createView(window.performance);
            getEntries();
        }

        $('article > h3').on('click', function(e) {
            var target = $(e.target).parents('article');
            target.find('div').toggle();
            target.find('table').toggle();
        });
    }

    var timer;
    w.afterReload = function (msg) {
        if(msg === 'reloadcomplete') {
            clearTimeout(timer);
            timer = setTimeout(function() {
                init();
            }, 2000);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(function() {
            init();
        }, 2000);
    });
})(window);