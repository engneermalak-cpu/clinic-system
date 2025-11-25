const report = chartsData.report;
const revenue = chartsData.revenue;
const cashFlow = chartsData.cashFlow;
const earnings = chartsData.earnings;

const revenueDonutChart = new ApexCharts(document.querySelector("#revenueDonutChart"), {
    chart: {
        type: 'donut',
        height: 500,
        toolbar: {
            show: true,
            tools: {
                download: true,
                selection: false,
                zoom: false,
                zoomin: false,
                zoomout: false,
                reset: false
            }
        }
    },
    title: {
        text: report.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    labels: report.labels,
    series: report.series,
    dataLabels: {
        enabled: true,
        formatter: (val) => val.toFixed(1) + '%',
        style: {
            fontSize: '14px',
            fontWeight: 'bold'
        }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '65%',
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333'
                    },
                    value: {
                        show: true,
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#000',
                        formatter: function (val) {
                            return val;
                        }
                    },
                    total: {
                        show: true,
                        label: CONFIG.Trans.TodaysRevenues,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333',
                        formatter: function (w) {
                            return report.series[0].toFixed(2);
                        }
                    }
                }
            }
        }
    },
    fill: {
        type: 'gradient'
    },
    legend: {
        show: true,
        position: 'bottom',
        fontSize: '14px'
    },
    tooltip: {
        y: {
            formatter: function (value) {
                return value.toFixed(2);
            }
        }
    }
});

const revenueChart = new ApexCharts(document.querySelector("#revenueChart"), {
    chart: {
        height: 480,
        type: 'bar',
        stacked: false,
        toolbar: {
            show: true,
            tools: {
                download: true, // زر تحميل كصورة
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                reset: true
            }
        },
        zoom: {
            enabled: true,
            type: 'x',
            autoScaleYaxis: true
        },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
        }
    },
    title: {
        text: revenue.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    fill: {
        type: 'gradient'
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '50%', // تحكم بعرض كل عمود
            endingShape: 'rounded'
        }
    },
    colors: ['#2196f3', '#4CAF50', '#9C27B0'],
    stroke: {
        width: 1,
        curve: 'smooth'
    },
    markers: {
        size: 5,
        hover: {
            sizeOffset: 3
        }
    },
    dataLabels: {
        enabled: false,
        style: {
            fontSize: '13px',
            fontWeight: 'bold',
            colors: ['#000']  // ← تغيير لون النص ليكون واضح
        },
        background: {
            enabled: true,
            borderRadius: 4,
            foreColor: '#ffff', // ← لون النص داخل الخلفية البيضاء
            padding: 4,
            opacity: 0.9,
        }
    },
    series: [
        {
            name: CONFIG.Trans.TotalAmount,
            type: 'column',
            data: revenue.total
        },
        {
            name: CONFIG.Trans.TotalCost,
            type: 'column',
            data: revenue.cost
        },
        {
            name: CONFIG.Trans.TotalTax,
            type: 'column',
            data: revenue.tax
        },
        {
            name: CONFIG.Trans.TotalDiscount,
            type: 'column',
            data: revenue.discount
        },
        {
            name: CONFIG.Trans.NetRevenue,
            type: 'column',
            data: revenue.netRevenue
        }
    ],
    xaxis: {
        categories: revenue.labels,
        // title: {
        //     text: CONFIG.Trans.Months,
        //     style: {
        //         fontSize: '16px',
        //         fontWeight: 'bold'
        //     }
        // },
        labels: {
            rotate: -45,
            style: {
                fontSize: '13px',
                fontWeight: 'bold'
            }
        }
    },
    yaxis: {
        title: {
            text: CONFIG.Trans.Revenues,
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        labels: {
            formatter: val => val.toFixed(0),
            style: {
                fontSize: '13px'
            }
        }
    },
    grid: {
        show: true,
        borderColor: '#e0e0e0',
        row: {
            colors: ['#f5f5f5', 'transparent'],
            opacity: 0.3
        }
    },
    tooltip: {
        shared: true,
        intersect: false,
        marker: {
            show: true,
        },
        custom: undefined, // تأكد أن custom غير مفعّل لأن بعض القوالب تعطل الألوان
        x: {
            format: 'MMM yyyy'
        }
    },
    legend: {
        position: 'bottom',
        fontSize: '14px',
        labels: {
            colors: '#333'
        },
        markers: {
            width: 12,
            height: 12,
            radius: 12
        },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        }
    }
});

const cashFlowChart =new ApexCharts(document.querySelector("#cashFlowChart"), {
    chart: {
        height: 500,
        type: 'line',
        // Scroll-like effect
        toolbar: {
            show: true,
            tools: {
                download: true, // زر تحميل كصورة
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                reset: true
            }
        },
        zoom: {
            enabled: true,
            type: 'x',
            autoScaleYaxis: true
        },
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
        }
    },
    title: {
        text: cashFlow.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    colors: ['#2196f3', '#FFC107', '#4CAF50'],
    stroke: {
        width: [4, 2, 2],
        curve: 'smooth'
    },
    markers: {
        size: 5,
        hover: {
            sizeOffset: 3
        }
    },
    dataLabels: {
        enabled: true,
        enabledOnSeries: [1, 2, 3, 4], // الخطوط فقط
        formatter: (val, opts) => opts.seriesIndex === 0 ? '' : val,
        style: {
            fontSize: '13px',
            fontWeight: 'bold'
        },
        background: {
            enabled: true,
            borderRadius: 4
        }
    },
    series: [
        {
            name: CONFIG.Trans.cashFlow,
            type: 'column',
            data: cashFlow.cash_flow
        },
        {
            name: CONFIG.Trans.NetProfit,
            type: 'line',
            data: cashFlow.net_profit
        },
        {
            name: CONFIG.Trans.Revenue,
            type: 'line',
            data: cashFlow.revenue
        }
    ],

    xaxis: {
        categories: cashFlow.labels,
        // title: {
        //     text: CONFIG.Trans.Months,
        //     style: {
        //         fontSize: '16px',
        //         fontWeight: 'bold'
        //     }
        // },
        labels: {
            rotate: -90,
            style: {
                fontSize: '13px',
                fontWeight: 'bold'
            }
        }
    },
    yaxis: {
        // title: {
        //     text: cashFlow.title,
        //     style: {
        //         fontSize: '16px',
        //         fontWeight: 'bold'
        //     }
        // },
        labels: {
            formatter: val => val.toFixed(0),
            style: {
                fontSize: '13px'
            }
        }
    },
    grid: {
        show: true,
        borderColor: '#e0e0e0',
        row: {
            colors: ['#f5f5f5', 'transparent'],
            opacity: 0.3
        }
    },
    tooltip: {
        shared: true,
        intersect: false,
        marker: {
            show: true,
        },
        custom: undefined, // تأكد أن custom غير مفعّل لأن بعض القوالب تعطل الألوان
        x: {
            format: 'MMM yyyy'
        }
    },
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'light',
            type: 'diagonal',
            gradientToColors: undefined,
            opacityFrom: 0.8,
            opacityTo: 1,
            // stops: [0, 90, 100]
        }
    },
    legend: {
        position: 'bottom',
        fontSize: '14px',
        labels: {
            colors: '#333'
        },
        markers: {
            width: 12,
            height: 12,
            radius: 12
        },
        itemMargin: {
            horizontal: 10,
            vertical: 5
        }
    }
});

const earningsChart  = new ApexCharts(document.querySelector("#earningsChart"), {
    chart: {
        height: 500,
        type: 'donut',
        toolbar: {
            show: true,
            tools: {
                download: true, // زر تحميل كصورة
                selection: true,
                zoom: true,
                zoomin: true,
                zoomout: true,
                reset: true
            }
        },
    },
    title: {
        text: earnings.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    labels: earnings.labels,
    series: earnings.data,
    dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
            return val.toFixed(1) + "%";
        },
        style: {
            fontSize: '14px',
            fontWeight: 'bold'
        }
    },
    plotOptions: {
        pie: {
            donut: {
                size: '55%',
                labels: {
                    show: true,
                    name: {
                        show: true,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333'
                    },
                    value: {
                        show: true,
                        fontSize: '20px',
                        fontWeight: 700,
                        color: '#000',
                        formatter: function (val, w) {
                            return val + ' ' + CONFIG.Trans.SAR;
                        }
                    },
                    total: {
                        show: true,
                        label: earnings.labels[0], // ← عنوان "الإيرادات" مثلاً
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333',
                        formatter: function (w) {
                            // نعرض فقط القيمة الأولى (مثلاً الإيرادات)
                            const value = w.globals.series[0];
                            return value + ' ' + CONFIG.Trans.SAR;
                        }
                    }
                }
            }
        }
    },
    legend: {
        show: true,
        position: 'bottom',
        fontSize: '14px'
    },
    tooltip: {
        y: {
            formatter: function (value) {
                return value.toFixed(2) + ' ' + CONFIG.Trans.SAR;
            }
        }
    }
});
revenueDonutChart.render();

revenueChart.render();
cashFlowChart.render();
earningsChart.render();
