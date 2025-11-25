/*
 Template Name: Doctorly - Patient Management System
 Author: Lndinghub(Themesbrand)
 File: Appointment
 */ 
$(document).ready(function() {

});


$('.discount').change(function(e) {
    e.preventDefault();
    filterDiscount($(this).val());
}); 

function filterDiscount(value) { 
    var total_amount;
    var discount;
    if(value !=0) {
        discount = ((appointment.price * value)/100);
        total_amount = (appointment.price - ((appointment.price * value)/100));
    } else {
        discount = value;
        total_amount = appointment.price;
    } 
    var tax = ((total_amount*localTax)/100);
    $('.tax_value').val(tax); 
    $('.discount_value').val(discount);
    $('.total_amount').val(Number(tax + total_amount));
}

function formatFormDataForPatient(){
    $('.user_error').empty();
    $('.select_appointment').empty();
    $('.clinic_input').val('');
    $('.service_input').val('');
    $('.title').val('');
    $('.tax').val(15);
    $('.tax_value').val(0);
    $('.amount').val('');
    $('.total_amount').val('');

    $('.clinic').addClass('hiden');
    $('.insurance').addClass('hiden');
    $('.payment').addClass('hiden');
    $('.service').addClass('hiden');

    $('.select_selling_point').addClass('hiden');
    $('.approval_symbol_tag').empty();
    $('.approval_symbol_tag').addClass('hiden');
}

function formatFormData(){
    $('.clinic_input').val('');
    $('.service_input').val('');
    $('.title').val('');
    $('.tax').val(15);
    $('.tax_value').val(0);
    $('.amount').val('');
    $('.total_amount').val('');

    $('.select_selling_point').addClass('hiden');
    $('.approval_symbol_tag').empty();
    $('.approval_symbol_tag').addClass('hiden');
}


