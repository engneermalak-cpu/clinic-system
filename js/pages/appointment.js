/*
Product Name: TheNabd - Patient & Employee Management System
Author: NWIT @Khaleel Zbeedi
Version: 2.0.0
Website: https://nwit.com.sa/
Contact: support@nwit.com.sa
File: Appointment Js File
*/
$(document).ready(function() {
    var token = $("input[name='_token']").val();

    $('.dt').on('change', function() {
        //alert();
        $("#btn_create").removeAttr('disabled');
    });

    $('#btn_create').on('click', function(e) {
        e.preventDefault();
        var p_id = $('#myselect2').val();
        var date = $('#datepicker-autoclose').val();
        var time = $('#timepicker1').val();
        //alert(time);

        $.ajax({
            type: 'POST',
            url: '../user_operation/chkappointment',
            dataType: 'json',
            data: {
                p_id: p_id,
                date: date,
                time: time
            },
            success: function(data) {
                if (data.status == 1) {
                    $(".status").css('color', 'red');
                    $(".status").text("Appointment booked on this day");
                    $("#btn_create").prop('disabled', 'true');
                } else if (data.status == 2) {
                    $(".status").css('color', 'red');
                    $(".status").text("Time slot allocated to other patient");
                } else {
                    $(".status").css('color', 'green');
                    $(".status").text("Appointment booked Successfully");
                }
            },
            error: function(data) {
                alert('oops! Something Went Wrong!!!');
            }
        });
    });

    $("#appointment_form").on("submit", function(e) {
        e.preventDefault();
        var route = $('#appointment_form').data('route');
        var form_data = $(this);
        $.ajax({
            type: 'POST',
            url: route,
            data: form_data.serialize(),
            success: function(response) {
                if (response.status == 'error') {
                    $(".status").css('color', 'red');
                    $(".status").text(response.message);
                    console.log(response.message);
                } else {
                    $(".status").css('color', 'green');
                    $(".status").text(response.message);
                }
            },
            error: function() {
                console.log("Something went Wrong!!!");
                $(".status").css('color', 'red');
                $(".status").text('Something went Wrong!!!');
            }
        });

    });

    $('.complete').on('click', function(e) {
        var id = $(this).data('id');
        var token = $("input[name='_token']").val();
        var status = 3;
        var url = $(this).data('url');
        // if (confirm('تغير حالة الموعد الى مكتمل?')) {

            $.ajax({
                type: "post",
                // url:  url,
                url: "/appointment-status/" + id,
                data: { 'appointment_id': id, '_token': token, 'status': status },
                beforeSend: function() {
                    $('#preloader').show()
                },
                success: function(response) { 
                    if(response.isSuccess) {
                        toastr.success(response.Message);
                        location.reload();
                    }else if(response.isSuccess == false) {
                        toastr.error(response.Message);
                        location.href = "/appointments/treatment-plan/create/"+id;
                        // setTimeout(() => {
                        //     if (confirm('هل تود إضافة تقرير?')) {
                        //         // location.href = '/appointments/reports/create/'+id;
                        //     }
                        // }, 2000);
                    }
                },
                error: function(response) {
                    console.error(response);
                    toastr.error(response.responseJSON.Message);
                },
                complete: function() {
                    $('#preloader').hide();
                }
            });
        // }
    });

    $('.cancel').on('click', function(e) {
        var id = $(this).data('id');
        var token = $("input[name='_token']").val();
        var url = $(this).data('url');

        var status = 4;
        console.log(id);
        if (confirm('Are you sure you want to cancel appointment?')) {

            $.ajax({
                type: "post",
                // url: url,
                url: "/appointment-status/" + id,
                data: { 'appointment_id': id, '_token': token, 'status': status },
                beforeSend: function() {
                    $('#pageloader').show();
                },
                success: function(response) {
                    toastr.success(response.Message);
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                },
                error: function(response) {
                    toastr.error(response.responseJSON.Message);
                },
                complete: function() {
                    $('#pageloader').hide();
                }
            });
        }
    });
    $('.activeAppointment').on('click', function(e) {
        var id = $(this).data('id');
        var token = $("input[name='_token']").val();
        var url = $(this).data('url');
        var status = 0;
        console.log(id);
        if (confirm('هل انت متأكد من إعادة حجز هذه الموعد؟')) {

            $.ajax({
                type: "post",
                // url:  url,
                url: "/appointment-status/" + id,
                data: { 'appointment_id': id, '_token': token, 'status': status },
                beforeSend: function() {
                    $('#pageloader').show();
                },
                success: function(response) {
                    toastr.success(response.Message);
                    console.log('Response: ',response)
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                },
                error: function(response) {
                    console.log('Response Error: ',response);
                    toastr.error(response.responseJSON.Message);
                },
                complete: function() {
                    $('#pageloader').hide();
                }
            });
        }
    });
    $('.startAppointment').on('click', function(e) {
        var id = $(this).data('id');
        var url = $(this).data('url');
        var token = $("input[name='_token']").val();
        var status = 2; 
        console.log("startAppointment is cklicked");
        $.ajax({
            type: "post",
            url: "/appointment-status/" + id,
            data: { 'appointment_id': id, '_token': token, 'status': status },
            beforeSend: function() {
                $('#pageloader').show();
            },
            success: function(response) {
                // console.log('response: ',response )
                toastr.success(response.Message);
                setTimeout(() => {
                    location.reload();
                }, 1500);
            },
            error: function(response) {
                console.log('response: ',response )
                toastr.error(response.responseJSON.Message);
            },
            complete: function() {
                $('#pageloader').hide();
            }
        });
    });

    // delete appointment
    $(document).on('click', '#delete-appointment', function() {
        var id = $(this).data('id');
        if (confirm('هل أنت متأكد من حذف هذه الموعد؟')) {
            $.ajax({
                type: "DELETE",
                url: '/appointment/' + id,
                data: {
                    _token: token,
                    id:id,
                },
                beforeSend: function() {
                    $('#pageloader').show()
                },
                success: function(response) {
                    console.log('response: ', response);
                    toastr.success(response.message, {
                        timeOut: 2000
                    });
                    $('.appointment'+id).remove();
                    // location.reload();
                },
                error: function(response) {
                    toastr.error(response.responseJSON.message, {
                        timeOut: 20000
                    });
                },
                complete: function() {
                    $('#pageloader').hide();
                }
            });
        }
    });


    $(document).on('click', '#delete-item', function() {
        var id = $(this).data('id');
        confirmAlert("{{__('admin.Are You Sure To Delete This Invoice?')}}").then(function (result) {
            if(result.value) {
                $.ajax({
                    type: "DELETE",
                    url: "{{route('admin.dispensary.invoices.destroy')}}",
                    data: {
                        _token: '{{ csrf_token() }}',
                        id:id,
                    },
                    beforeSend: function() {
                        $('#pageloader').show()
                    },
                    success: function(response) {
                        $('.item'+id).remove(); 
                        SwSuccess(response.title, response.text);
                    },
                    error: function(response) {
                        console.log("response error: ", response)
                        var response =response.responseJSON;
                        SwError(response.title, response.text); 
                    },
                    complete: function() {
                        $('#pageloader').hide();
                    }
                });
            }   
        });
    }); //Parameter 
});
