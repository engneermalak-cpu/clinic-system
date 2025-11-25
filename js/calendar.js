
// بناء رابط تحميل البيانات
function fetchEventsUrlBuilder(fetchInfo) {
    let url = CONFIG.UrlBuilder;
    let params = [];

    // التاريخ من وإلى حسب عرض الجدول
    params.push('start=' + encodeURIComponent(fetchInfo.startStr));
    params.push('end=' + encodeURIComponent(fetchInfo.endStr));

    let dateFilter = document.getElementById('dateFilter').value;
    let timeFilter = document.getElementById('timeFilter').value;
    let statusFilter = document.getElementById('statusFilter').value;
    // let clinicFilter = $('#clinicFilter').val(); // Because it's a multiple select with select2
    let selectedClinic = $('#clinicFilters .tag-item.active').data('clinic');

    if(timeFilter) params.push('start_time=' + encodeURIComponent(timeFilter));
    if(dateFilter) params.push('date=' + encodeURIComponent(dateFilter));
    if(statusFilter) params.push('status=' + encodeURIComponent(statusFilter));
    // if(clinicFilter && clinicFilter.length > 0 && !clinicFilter.includes('*')) {
    //     clinicFilter.forEach(c => params.push('clinic_ids[]=' + encodeURIComponent(c)));
    // }

    if (selectedClinic && selectedClinic !== '*') {
        params.push('clinic_ids[]=' + encodeURIComponent(selectedClinic));
    }

    if (params.length>0) {
        url += '?' + params.join('&');
    }
    return url;
}

// تأكيد التحديث للموعد
function updateAppointmentTime(event, info = null) {
    const updatedData = {
        id: event.id,
        date: moment(event.start).format('YYYY-MM-DD'),
        start: moment(event.start).format('HH:mm:ss'),
        end: moment(event.end).format('HH:mm:ss')
    };

    fetch(CONFIG.UrlUpdateTime, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": CONFIG.csrf_token
        },
        body: JSON.stringify(updatedData)
    }).then(response => {
        if (!response.ok) throw new Error("فشل التحديث");
        if (!calendar.getEventById(updatedData.id) && info) info.revert(); // يتحقق إن ما انحذف
        return response.json();
    }).then(data => {
        if (!data.status && info) info.revert();
        data.status ? SwSuccess(data.title, data.message) : SwError(data.title, data.message);
    }).catch(error => {
        console.error("خطأ أثناء التحديث:", error);
        Swal.fire(CONFIG.Trans.Failed, CONFIG.Trans.SomeThingIsHappend, 'warning');
        info.revert(); // ترجع الحدث لمكانه القديم لو فشل الحفظ
    });
}

// دالة debounce لتقليل عدد الطلبات أثناء تغيير الفلاتر
function refetchWithBatch() {
    clearTimeout(refetchTimeout);
    refetchTimeout = setTimeout(() => {// حماية من تكرار تحميل الأحداث
        calendar.batchRendering(() => calendar.refetchEvents());
    }, 300); // انتظر 300ms بعد آخر تغيير
}

document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: window.innerWidth < 768 ? 'listWeek' : 'timeGridWeek',
        headerToolbar: {
            left: 'next,prev today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        customButtons: {
            export: {
                text: 'Export CSV',
                click: function() {
                    exportEventsToCSV();
                }
            },
            print: {
                text: '🖨 طباعة',
                click: function() {
                    window.print();
                }
            }
        },

        views: {
            dayGridMonth: { buttonText: 'شهري' },
            timeGridWeek: { buttonText: 'أسبوعي' },
            timeGridDay: { buttonText: 'يومي' },
            listWeek: { buttonText: 'قائمة' }
        },
        slotMinTime: '13:00:00',
        slotMaxTime: '21:00:00',
        slotDuration:  '00:15:00', // نصف ساعة لكل خانة زمنية
        slotLabelInterval:  '00:30:00', // نصف ساعة لكل خانة زمنية
        locale: 'ar',
        timeZone: 'local', // Can be 'local' or any valid IANA timezone string (e.g., 'America/New_York')
        eventMaxStack: 2,         // يحدد كم جلسة تنعرض فوق بعض في نفس الوقت
        slotEventOverlap: false, // يمنع تداخل الأحداث
        eventOverlap: false,      // يمنع التراكب اليدوي
        contentHeight: 'auto', // يخلي الجدول يتمدد حسب عدد الجلسات
        eventMinHeight:10,
        allDaySlot: false,
        selectable: true,
        editable: true,  // تفعيل السحب والتعديل
        eventStartEditable: true, // تفعيل تغيير وقت البداية بالسحب
        eventDurationEditable: false, // تفعيل تغيير مدة الحدث
        // weekends: false, // Disables Saturday/Sunday in the calendar view
        hiddenDays: [5],
        validRange: {
            start: CONFIG.validRangeStart,
            end: CONFIG.validRangeEnd
        },
        longPressDelay: 300,
        events: function(fetchInfo, successCallback, failureCallback) {
            // Show loading indicator
            $('#calendar-loading').show();
            let url = fetchEventsUrlBuilder(fetchInfo);
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    successCallback(data);
                    $('#calendar-loading').hide(); // Hide loading indicator
                })
                .catch(error => {
                    console.error('حدث خطأ في تحميل الأحداث:', error);
                    failureCallback(error);
                    $('#calendar-loading').hide(); // Hide loading on failure
                });
        },

        eventClassNames: function(arg) {
            return classNames(arg.event.extendedProps.status)|| '';
        },

        selectAllow: function (selectInfo) {
            const startMinutes = selectInfo.start.getHours() * 60 + selectInfo.start.getMinutes();
            const endMinutes = selectInfo.end.getHours() * 60 + selectInfo.end.getMinutes();
            const minTime = timeToMinutes(calendar.getOption('slotMinTime'));
            const maxTime = timeToMinutes(calendar.getOption('slotMaxTime'));
            return startMinutes >= minTime && endMinutes <= maxTime;
        },

        eventAllow: function(dropInfo, draggedEvent) { // السماح بالسحب داخل الأوقات المسموحة فقط
            const startMinutes = dropInfo.start.getHours() * 60 + dropInfo.start.getMinutes();
            const endMinutes = dropInfo.end.getHours() * 60 + dropInfo.end.getMinutes();
            const minTime = timeToMinutes(calendar.getOption('slotMinTime'));
            const maxTime = timeToMinutes(calendar.getOption('slotMaxTime'));
            return startMinutes >= minTime && endMinutes <= maxTime;
        },

        eventContent: function(arg) {
            let doctor = arg.event.extendedProps.doctor || '';
            let status = arg.event.extendedProps.status || '';
            let isConfirmed = arg.event.extendedProps.confirmed;
            let appointment_id = arg.event.id || '';
            let title = arg.event.title || '';


            let isConfirmedIcon= isConfirmed==CONFIG.Trans.Confirmed ? '✅' : '⏰';
            return {
                html: `
                <div style="display: flex; flex-direction: column; font-size: 12px; padding: 2px; border-radius: 4px;">
                    <div style="color: #fff;"><span class="font-size-17">${isConfirmedIcon}</span> ${title}</div>
                    <div style="font-size: 11px; color: #e0e0e0;">${doctor}</div>
                    <div style="font-weight: bold; color: #fff;"><i class="fa ${statusIcon(status)} font-size-12"></i> ${arg.timeText}</div>
                </div>`
            };
        },

        eventDrop: function(info) { // هنا تقدر ترسل البيانات للسيرفر لتحديث وقت الموعد
            confirmAlert(CONFIG.Trans.ChangTimeMsg).then(function (result) {
                if(result.value) {
                    updateAppointmentTime(info.event);
                } else {
                    info.revert();
                }
            });
        },

        eventClick: function(info) {
            const eventId = info.event.id;
            const userName = info.event.title;
            const userMobile = info.event.extendedProps.mobile;
            const eventUrl = CONFIG.showRouteTemplate.replace(':id', eventId);
            let confirmed = info.event.extendedProps.confirmed;
            $('#modal-title').text(CONFIG.Trans.ConfirmedAppointment);
            $('#event-modal').modal('show');
            $('#event-id').val(eventId);
            $('#event-title').val(userName);
            $('#event-mobile').val(userMobile);
            if(confirmed === CONFIG.Trans.Confirmed) {
                $('#event-confirmed').addClass('border-success');
                $('#event-confirmed').val(1).change();
                $('#btn-save-event').prop('disabled', true); // لو حبيت تمنع التعديل
            } else {
                $('#event-confirmed').val(0).change();
                $('#event-confirmed').removeClass('border-success');
                $('#btn-save-event').prop('disabled', false);
            }
            $('#btn-view-event').attr('href', eventUrl);
            date =FormatDateTime(info.event.start);
            const message = __('whatsapp_session_reminder', {
                name: userName,
                date: date.format('dddd D MMMM'),
                time: date.format('h:mm A')
            });
            const whatsappUrl = `https://wa.me/${userMobile}?text=${encodeURIComponent(message)}`;
            $('#btn-whatsapp-event').attr('href', whatsappUrl);
        },
        eventDidMount: function(info) {
            if (window.innerWidth < 768) {
                info.el.style.fontSize = '11px';
                info.el.style.padding = '2px 4px';
            }
            tippy(info.el, {
                content: generateEventContent(info),
                allowHTML: true,
                interactive: true,
                trigger: 'mouseenter',
                placement: 'top-start',
                dir: 'rtl',
                theme: 'light-border',
                maxWidth: window.innerWidth < 768 ? 200 : 300,
                delay: [300, 100], // [تأخير الظهور, تأخير الإخفاء]
                hideOnClick: true,
                appendTo: document.body, // ✅ هذا مهم جداً
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 10], // تعديل المسافة
                        },
                    },
                ],
            });
        },
        // Loading function to show/hide the loading indicator
        loading: function(isLoading) {
            document.getElementById('calendar-loading').classList.toggle('d-none', !isLoading);
            spinner.classList.toggle("d-none", !isLoading);
        }
    });
    // بدء تشغيل التقويم
    calendar.render();


    // دالة تحويل الوقت من HH:mm:ss إلى دقائق
    function timeToMinutes(timeStr) {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }
    function FormatDateTime(dateTime) {
        dayjs.extend(dayjs_plugin_utc);
        dayjs.extend(dayjs_plugin_timezone);
        dayjs.locale('ar');

        return date = dayjs(dateTime).tz('Asia/Riyadh');
    }

    $('#event-form').on('submit', function(e) {
        e.preventDefault();
        const id = $('#event-id').val();
        const data = {
            id: id,
            confirmed: $('#event-confirmed').val(),
            _token: CONFIG.csrf_token
        };
        fetch(CONFIG.UrlSubmitForm, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
        .then(response => {
            if (response.status) {
                $('#event-modal').modal('hide');
                calendar.refetchEvents();
                SwSuccess(response.title, response.message)
            } else {
                SwError(response.title, response.message);
            }
        }).catch(() => {
            Swal.fire(CONFIG.Trans.Failed, CONFIG.Trans.SomeThingIsHappend, 'warning');
        });
    });

    function generateEventContent(info) {
        let event = info.event;
        return `
        <div class="text-left" style="direction: rtl;">
            <strong><i class="fa fa-user-alt"></i> ${event.title}</strong>
            <div><i class="fa fa-clinic-medical"></i> ${event.extendedProps.clinic || 'غير محدد'}</div>
            <div><i class="fa fa-user-md"></i> ${event.extendedProps.doctor || 'لا يوجد'}</div>
            <div><i class="fa ${statusIcon(event.extendedProps.status)} ${statusTextColor(event.extendedProps.status)}"></i> ${event.extendedProps.status || 'غير معروف'}</div>
            <div><i class="fa fa-hashtag"></i> ${event.id}</div>
            <div>${event.extendedProps.confirmed || 'غير معروف'}</div>
            <div style="color: #666; font-size: 12px; margin: 4px 0;"><i class="fa fa-clock"></i> ${info.timeText}</div>
        </div>
        `;
    }



    // 📅 الأحداث عند تغيير الفلاتر
    document.getElementById('dateFilter').addEventListener('change', refetchWithBatch);
    document.getElementById('timeFilter').addEventListener('change', refetchWithBatch);
    // $('#clinicFilter').on('change', refetchWithBatch);
    $('#clinicFilters .tag-item').on('click', function () {
        // تبديل الحالة النشطة
        $('#clinicFilters .tag-item').removeClass('active');
        $(this).addClass('active');
        // إعادة جلب البيانات بناءً على الفلتر المختار
        refetchWithBatch();
    });
    $('#statusFilter').on('change', refetchWithBatch);

    // Spinner لزر التحديث اليدوي
    document.getElementById("btn-refresh-calendar").addEventListener("click", function () {
        calendar.refetchEvents();
    });
    // تحديث العرض عند تغيير حجم الشاشة
    window.addEventListener('resize', function () {
        let newView = window.innerWidth < 768 ? 'listWeek' : 'timeGridWeek';
        if(calendar.view.type !== newView) {
            calendar.batchRendering(() => {
                calendar.changeView(newView);
            });
        }
    });
});
