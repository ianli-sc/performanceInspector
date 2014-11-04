(function(w) {
    w.onload = function() {
        setTimeout(function () {
            if(chrome && chrome.devtools) {
                var devTools = chrome.devtools;
                var inspectedWindow = devTools.inspectedWindow;
                inspectedWindow.eval(
                    "window.performance",
                    function (result, isException) {
                        if(isException) {
                            document.body.innerHTML = 'Eval code error : ' + result.timing.loadEventEnd;
                        } else {
                            createView(result);
                        }
                    }
                );
            } else {
                createView(window.performance);
            }
            $('article > h3').on('click', function(e) {
                $(e.target).parents('article').find('div').toggle();
            });

            /**
             * create view of performance
             */
            function createView(performance) {
                createMemory(performance.memory);
                createTiming(performance.timing);
                createEntries(performance.getEntries());
            }


            /**
             * create panel for memory
             */
            function createMemory(memory) {
                var type = 'area';
                var keyList = [];
                var dataList = [];
                var plotOption;
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
            function createEntries() {

            }
        }, 4000);
    };
})(window);