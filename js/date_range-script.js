$(function() {
    $('#date_range').daterangepicker({
        minDate: moment(CONFIG.minRangesDate),
        maxDate: moment(CONFIG.maxRangesDate),
        // ✅ العرض الافتراضي للتقويم عند الفتح
        startDate: defaultStart,
        endDate: defaultEnd,
        showDropdowns: true,
        autoApply: false,
        alwaysShowCalendars: true,
        linkedCalendars: false,
        // singleDatePicker: true,
        // showWeekNumbers: true,
        showISOWeekNumbers: true,
        drops: 'down', // أو 'up'
        parentEl: '#datePickerWrapper',
        // ✅ هذا يمنع تحديد تواريخ غير صالحة
        isInvalidDate: function(date) {
            const blockFridays = false; // ← اجعلها true لو أردت حظر الجمعة
            return (
                date.isBefore(moment(CONFIG.minRangesDate), 'day') ||
                date.isAfter(moment(CONFIG.maxRangesDate), 'day') ||
                (blockFridays && date.day() === 5)
                // date.day() === 5 // مثلاً: حظر يوم الجمعة إن أردت
            );
        },
        locale: {
            customRangeLabel: CONFIG.Trans.CustomRange,
            format: 'YYYY-MM-DD',
            separator: ' - ',
            direction: 'rtl',
            applyLabel: CONFIG.Trans.Apply,
            cancelLabel: CONFIG.Trans.Cancel,
            fromLabel: CONFIG.Trans.From,
            toLabel: CONFIG.Trans.To,
            weekLabel: CONFIG.Trans.Week,
            daysOfWeek: CONFIG.daysOfWeek,
            monthNames: CONFIG.monthNames,
            firstDay: 6
        },
        ranges: {
            [CONFIG.Trans.Today]: [moment(), moment()],
            //  [CONFIG.Trans.Today]: [moment().isBefore(moment(CONFIG.minRangesDate)) ? moment(CONFIG.minRangesDate) : moment(), moment()],
            [CONFIG.Trans.Yesterday]: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            [CONFIG.Trans.Last7Days]: [moment().subtract(6, 'days'), moment()],
            [CONFIG.Trans.Last15Days]: [moment().subtract(14, 'days'), moment()],
            [CONFIG.Trans.Last30Days]: [moment().subtract(29, 'days'), moment()],
            [CONFIG.Trans.ThisMonth]: [moment().startOf('month'), moment().endOf('month')],
            [CONFIG.Trans.LastMonth]: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
            // [CONFIG.Trans.AllTime]: [moment(CONFIG.minRangesDate), moment()]
            [CONFIG.Trans.AllTime]: [CONFIG.minRangesDate, CONFIG.maxRangesDate]
            //  [CONFIG.Trans.AllTime]: [moment(CONFIG.minRangesDate), moment(CONFIG.maxRangesDate)]
        },
        opens: 'right',
        autoUpdateInput: false
    }, function(start, end, label) {
        const selectedStart = requestStart ? moment(requestStart) : start;
        const selectedEnd = requestEnd ? moment(requestEnd) : end;
        // عرض التواريخ في الحقل عند الاختيار
        $('#date_range').val(selectedStart.format('YYYY-MM-DD') + ' - ' + selectedEnd.format('YYYY-MM-DD'));
        $('#range_label').val(label);
    });

    // ⬇️ نضيف النصوص بعد عرض التقويم
    $('#date_range').on('show.daterangepicker', function (ev, picker) {
        setTimeout(() => {
            const container = picker.container;
            // إزالة أي عناصر قد تكون مكررة
            container.find('.custom-label').remove();
            // إضافة نص فوق كل تقويم
            container.find('.drp-calendar.left .calendar-table').before(`<div class="custom-label" style="text-align:center; font-weight:bold; margin-bottom:4px;">${CONFIG.Trans.StartDate}</div>`);
            container.find('.drp-calendar.right .calendar-table').before(`<div class="custom-label" style="text-align:center; font-weight:bold; margin-bottom:4px;">${CONFIG.Trans.EndDate}</div>`);
        }, 10); // تأخير بسيط لضمان تحميل DOM
    });

    // تحديث القيمة المختارة تلقائياً
    $('#date_range').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
        $('#range_label').val(picker.chosenLabel || '');
    });

    // عند الإلغاء
    $('#date_range').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        $('#range_label').val();
    });

    // تعيين القيمة عند التحميل (default)
    let start = moment().startOf('month');
    let end = moment().endOf('day');
    $('#date_range').val(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));


    $('#date_range').on('apply.daterangepicker', function() {
        $('#filterForm').submit(); // مثال إذا كان داخل نموذج
    });
});
