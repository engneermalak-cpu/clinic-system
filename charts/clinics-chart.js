const subscriptionAppointment = chartsData.subscriptionAppointments;
const subscriptions = chartsData.subscriptions;
const appointments = chartsData.appointments;
const clinics = chartsData.clinics;
const services = chartsData.services;

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const subscriptionAppointmentChart = new ApexCharts(document.querySelector("#subscriptionAppointment"), {
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
        text: subscriptionAppointment.title,
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
    series: [
        {
            name: CONFIG.Trans.TotalAppointments,
            type: 'column',
            data: subscriptionAppointment.total_appointments
        },
        {
            name: CONFIG.Trans.SubscriptionAppointments,
            type: 'column',
            data: subscriptionAppointment.package_appointments
        },
        {
            name: CONFIG.Trans.Subscriptions,
            type: 'column',
            data: subscriptionAppointment.subscriptions
        }
    ],
    xaxis: {
        categories: subscriptionAppointment.labels,
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
            text: CONFIG.Trans.NumberOfOperations,
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

const subscriptionChart = new ApexCharts(document.querySelector("#subscriptionChart"),  {
    chart: {
        height: 500,
        type: 'line',
        stacked: false,
        toolbar: {
            show: true
        },
        zoom: {
            enabled: true
        }
    },
    title: {
        text: subscriptions.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    plotOptions: {
        bar: {
            columnWidth: '50%',
            borderRadius: 6
        }
    },
    stroke: {
        width: [4, 3, 3, 3, 3, 3],
        curve: 'smooth',
    },
    dataLabels: {
        enabled: true,
        enabledOnSeries: [1, 2, 3, 4, 5], // فقط على الخطوط
        style: {
            fontSize: '14px',
            fontWeight: 'bold'
        },
        background: {
            enabled: true,
            borderRadius: 4
        }
    },
    fill: {
        type: 'gradient'
    },
    colors: ['#2196f3', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0', '#607D8B'],
    series: [
        {
            name: CONFIG.Trans.TotalSubscriptions,
            type: 'column',
            data: subscriptions.total ?? []
        },
        ...Object.values(subscriptions.statuses).map(statusKey => ({
            name: CONFIG.Trans[capitalize(statusKey)] ?? statusKey,
            type: 'line',
            data: subscriptions[statusKey] ?? []
        }))
    ],
    xaxis: {
        categories: subscriptions.labels,
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
                fontSize: '14px',
                fontWeight: 'bold'
            }
        }
    },
    yaxis: {
        title: {
            text: CONFIG.NumberOfSubscriptions,
            style: {
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        labels: {
            style: {
                fontSize: '14px',
                fontWeight: 'bold'
            },
            formatter: function (val) {
                return val.toFixed(0);
            }
        }
    },
    grid: {
        show: true,
        borderColor: '#263238', // لون أغمق من الرمادي الفاتح
        strokeDashArray: 0, // 0 = خطوط صلبة (غير متقطعة)
        xaxis: {
            lines: {
                show: true // إظهار خطوط المحور X الخلفية
            }
        },
        yaxis: {
            lines: {
                show: true // إظهار خطوط المحور Y الخلفية
            }
        },
        row: {
            colors: ['#f0f0f0', 'transparent'], // تظليل متناوب للخلفية إن أردت
            opacity: 0.5
        }
    },
    tooltip: {
        shared: true,
        intersect: false
    },
    legend: {
        position: 'bottom',
        fontSize: '14px',
        markers: {
            width: 12,
            height: 12,
            radius: 12
        }
    },
    markers: {
        size: 6
    }
});

const appointmentChart =new ApexCharts(document.querySelector("#appointmentChart"), {
    chart: {
        height: 500,
        type: 'line',
        stacked: false,
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
        text: appointments.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    colors: ['#2196f3', '#FFC107', '#4CAF50', '#9C27B0', '#F44336'],
    stroke: {
        width: [4, 2, 2, 2, 2],
        curve: 'smooth'
    },
    markers: {
        size: 5,
        hover: {
            sizeOffset: 3
        }
    },
    fill: {
        type: 'gradient'
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
            name: CONFIG.Trans.TotalAppointments,
            type: 'column',
            data: appointments.total ?? []
        },
        ...Object.values(appointments.statuses).map(statusKey => ({
            name: CONFIG.Trans[capitalize(statusKey)] ?? statusKey,
            type: 'line',
            data: appointments[statusKey] ?? []
        }))
    ],
    xaxis: {
        categories: appointments.labels,
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
        title: {
            text: CONFIG.NumberOfAppointments,
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

const clinicDonutChart  = new ApexCharts(document.querySelector("#clinicDonutChart"), {
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
        text: clinics.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    labels: clinics.labels,
    series: clinics.data,
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
                size: '65%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: CONFIG.Trans.Total,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333',
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
        position: 'bottom',
        fontSize: '14px'
    },
    tooltip: {
        y: {
            formatter: function (value) {
                return CONFIG.Trans.Appointment +' ' + value;
            }
        }
    }
});

const servicesPieChart = new ApexCharts(document.querySelector("#servicesPieChart"), {
    chart: {
        type: 'pie',
        stacked: true,
        height: 500,
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
        text: services.title,
        align: 'center',
        style: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#263238'
        }
    },
    labels: services.labels,
    series: services.data,
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
                size: '65%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                        label: CONFIG.Trans.Total,
                        fontSize: '18px',
                        fontWeight: 600,
                        color: '#333',
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
        position: 'bottom',
        fontSize: '14px'
    },
    tooltip: {
        y: {
            formatter: function (value) {
                return CONFIG.Trans.Appointment +' ' + value;
            }
        }
    }
});

subscriptionAppointmentChart.render();
subscriptionChart.render();
appointmentChart.render();
clinicDonutChart.render();
servicesPieChart.render();
