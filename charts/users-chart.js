const newUsers = chartsData.newUsers;
const nationalities = chartsData.nationalities;


const newUsersChart = new ApexCharts(document.querySelector("#newUsersChart"), {
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
        text: newUsers.title,
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
        enabled: true,
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
    colors: ['#1E90FF'],
    series: [{
        name: CONFIG.Trans.NumberUsers,
        data: newUsers.data
    }],
    xaxis: {
        categories: newUsers.labels,
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
            text: CONFIG.Trans.TotalUsers +' '+ newUsers.total,
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
const nationalitiesChart = new ApexCharts(document.querySelector("#nationalitiesChart"), {
    chart: {
        type: 'bar',
        height: 480,
        toolbar: { show: false },
    },
    title: {
        text: nationalities.title,
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
            horizontal: true,
            columnWidth: '60%', // تحكم بعرض كل عمود
            borderRadius: 5,
            endingShape: 'rounded'
        }
    },
    dataLabels: {
        enabled: true,
        formatter: (val) => val + '%',
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
    //


    xaxis: {
        categories: nationalities.labels,
        labels: {
            rotate: -45,
            style: {
                fontSize: '13px',
                fontWeight: 'bold'
            }
        },
        title: {
            text: CONFIG.Trans.Percentage,
            style: {
                fontSize: '14px',
                fontWeight: 'bold'
            }
        }
    },
    yaxis: {
        labels: {
            style: {
                fontSize: '13px'
            }
        }
    },
    colors: ['#1E90FF'],
    series: [{
        name: CONFIG.Trans.NumberUsers,
        data: nationalities.percentages
    }],
    grid: {
        show: true,
        borderColor: '#e0e0e0',
        row: {
            colors: ['#f5f5f5', 'transparent'],
            opacity: 0.3
        }
    },
    tooltip: {
        y: {
            formatter: function (val, { dataPointIndex }) {
                return nationalities.data[dataPointIndex] + " " + CONFIG.Trans.NumberUsers;
            }
        }
    }
});

const genderChart = new ApexCharts(document.querySelector("#genderhalfDonutChart"), {
    chart: {
        type: 'donut',
        height: 480,
        offsetY: 20,
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 1000,
            animateGradually: {
                enabled: true,
                delay: 2000
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
        },
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
    series: chartsData.genders.data, // ← القيم
    labels: chartsData.genders.labels,
    colors: chartsData.genders.colors,
    title: {
        text: chartsData.genders.title,
        align: 'center',
    },
    dataLabels: {
        enabled: true,
        dropShadow: {
            enabled: false
        },
        formatter: function (val) {
            return val.toFixed(1) + '%';
        },
        style: {
            fontSize: '14px',
            fontWeight: 'bold'
        }
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val + ' ' + CONFIG.Trans.Patients;
            }
        }
    },
    fill: {
        type: 'gradient'
    },
    plotOptions: {
        pie: {
            startAngle: -135,
            endAngle: 135,
            donut: {
                size: '60%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: CONFIG.Trans.Total,
                        fontSize: '18px',
                        formatter: function (w) {
                            return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        }
                    }
                }
            }
        }
    },
    legend: {
        show: true,
        position: 'bottom'
    },
    responsive: [{
        breakpoint: 768,
        options: {
            chart: { height: 300 }
        }
    }]
});
newUsersChart.render();
nationalitiesChart.render();
genderChart.render();
