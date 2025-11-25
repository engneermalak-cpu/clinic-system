/*
Product Name: TheNabd - Patient & Employee Management System
Author: NWIT @Khaleel Zbeedi
Website: https://nwit.com.sa/
Contact: support@nwit.com.sa
File: Calendar Init
*/

$(document).ready(function() {
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
   

    /*  className colors

     className: default(transparent), important(red), chill(pink), success(green), info(blue)

     */


    /* initialize the external events
     -----------------------------------------------------------------*/
    
    $('#external-events div.external-event').each(function() {

        // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
        // it doesn't need to have a start or end
        var eventObject = {
            title: $.trim($(this).text()) // use the element's text as the event title
        };

        // store the Event Object in the DOM element so we can get to it later
        $(this).data('eventObject', eventObject);

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true, // will cause the event to go back to its
            revertDuration: 0 //  original position after the drag
        });

    });
    
    $('.fc-title').on('click', function(e) {
    
        console.log("getAppointment is clicked");
        calendar.fullCalendar('select');
     });


    /* initialize the calendar
     -----------------------------------------------------------------*/

    var SITEURL = "{{url('/')}}"
    var calendar = $('#calendar').fullCalendar({
        // initialView: 'dayGridMonth',
        // height: 350,
        // width: 650,

        header: {
            left: 'title',
            // center: 'agendaDay,agendaWeek,month',
            right: 'prev,next'
        },

        editable: true,
        firstDay: 1, //  1(Monday) this can be changed to 0(Sunday) for the USA system
        selectable: true,
        longPressDelay: 1,
        // defaultView: 'month',
        defaultView: 'month',
        axisFormat: 'h:mm',
        columnFormat: {
            month: 'ddd', // Mon
            week: 'ddd d', // Mon 7
            day: 'dddd M/d', // Monday 9/7
            agendaDay: 'dddd d'
        },
        titleFormat: {
            month: 'MMMM YYYY', // September 2009
            week: "MMMM YYYY", // September 2009
            day: 'MMMM YYYY' // Tuesday, Sep 8, 2009
        },
        events: SITEURL + "/cal-appointment-show",
        displayEventTime: true,
        eventRender: function(event, element, view) {
            if (event.allDay === 'true') {
                event.allDay = true;
            } else {
                event.allDay = false;
            }
        },
        allDaySlot: false,
        selectHelper: true,
        select: function(start, end, allDay) {
            var dt = start.format('YYYY/MM/DD');
            var dt = start.format('YYYY-MM-DD');
            $('#selected_date').html(start.format('DD MMM, YYYY'));
            $('#appointment_list').hide();
            $('#new_list').show();
            console.log('aplist_url: ', aplist_url);
            $.ajax({
                method: 'get',
                url: aplist_url,
                data: { date: dt },
                dataType: 'json',
                success: function(response) {
                    console.log('response', response);
                    if (response.status == 'error') {
                        $('#new_list').html('<h6>' + response.message + start.format('DD MMM, YYYY') + '</h6>');
                    } else {
                        var t = 1;
                        var data = response.appointments;
                        var list = '<table class="table table-bordered dt-responsive nowrap datatable" style="border-collapse: collapse; border-spacing: 0; width: 100%;"><thead class="thead-light"><tr><th>#</th><th>رقم الملف</th>';
                        if (response.role == 'doctor') {
                            list += '<th>إسم العميل</th>';
                        } else if (response.role == 'patient') {
                            list += '<th> المختص</th>';
                            list += '<th>رقم المختص</th>';
                        } else {
                            list += "<th>إسم العميل </th><th> المختص</th>";
                            list += '<th> العيادة</th>';
                        }

                        list += '<th>الوقت</th><th>الحالة</th></tr></thead><tbody>';
                        if (response.role == 'receptionist' || response.role == 'admin') {
                            $.each(data, function(i, appointments) {
                                let PatientID = appointments.patient.id;
                                let DFirst_name = appointments.clinic.doctor.first_name;
                                let DLast_name = appointments.clinic.doctor.last_name;
                                let PFirst_name = appointments.patient.first_name;
                                let PLast_name = appointments.patient.last_name;
                                let from = appointments.from_time;
                                let to = appointments.to_time;
                                let mobile = appointments.clinic.name
                                let status = appointments.status 
                                // let status_ ="<span style='padding:10px;width: 100px;' class='badge "+appointments.getStatusColorAttribute()+"'>"+status+"</span>";
                                list += "<tr><td>" + t + "</td><td>" + PatientID + "</td><td>" 
                                + PFirst_name + "&nbsp;" + PLast_name + "</td><td>" + DFirst_name + "&nbsp;" + DLast_name + "</td><td>" + mobile + "</td><td>" 
                                + status + "</td><td>" + convertTime(from) + " إلى " + convertTime(to) +"</td></tr>";
                                t++;
                            });

                        } else if (response.role == 'patient') {
                            $.each(data, function(i, appointments) {
                                let first_name = appointments.clinic.doctor.first_name;
                                let last_name = appointments.clinic.doctor.last_name;
                                let from = appointments.from_time;
                                let to = appointments.to_time;
                                let mobile = appointments.doctor.mobile
                                list += "<tr><td>" + t + "</td><td>" + first_name + "&nbsp;" + last_name + "</td><td>" + mobile + "</td><td>" + from + " to " + to +
                                    "</td></td></tr>";
                                t++;
                            });

                        } else if (response.role == 'doctor') {
                            $.each(data, function(i, appointments) {
                                let PatientID = appointments.patient.id;
                                let first_name = appointments.patient.first_name;
                                let last_name = appointments.patient.last_name;
                                let from = appointments.from_time;
                                let to = appointments.to_time;
                                let status = appointments.status;
                                list += "<tr><td>" + t + "</td><td>" + PatientID + "</td><td>" + first_name + "&nbsp;" + last_name + "</td><td>" + convertTime(from) + " إلى " + convertTime(to)  + "</td><td>"+ status + "</td></tr>";
                                t++;
                            });

                        }
                        list += "</tbody></table>";
                        $('#new_list').html(list);
                    }
                },
                error: function() {
                    console.log('Errors...Something went wrong!!!!');
                }
            });
            calendar.fullCalendar('unselect');
        },
        
        events: function(start, end, timezone, callback) {
            var start = moment(start, 'DD.MM.YYYY').format('YYYY-MM-DD')
            var end = moment(end, 'DD.MM.YYYY').format('YYYY-MM-DD')
                console.log("start: ", start);
                console.log("end: ", end);
            $.ajax({ 
                type: "get",
                url: "/cal-appointment-show",
                data: {
                    start: start,
                    end: end,
                    title: 'appointment',
                },
                success: function(response) {
                    var events = [];
                    $(response.appointments).each(function(key, value) {
                        events.push({
                            title: value.total_appointment + ' مواعيد',
                            start: value.appointment_date,
                            end: value.appointment_date,
                            className: 'bg-success text-white getAppointment',
                        });
                    });
                    callback(events);
                },
                error: function(response) {
                    console.log(response);
                }
            });
        },
        
    });
    
     

});

