// $(document).ready(function() {
//     $(".searchTable").keyup(function () {
//         var searchTerm = $(".searchTable").val();
//         console.log('searchTerm:', searchTerm);
//         var listItem = $('.results tbody').children('tr');
//         var searchSplit = searchTerm.replace(/ /g, "'):containsi('")

//         $.extend($.expr[':'], {'containsi': function(elem, i, match, array){
//             return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
//             }
//         });

//         $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function(e){
//             $(this).attr('visible','false');
//         });

//         $(".results tbody tr:containsi('" + searchSplit + "')").each(function(e){
//             $(this).attr('visible','true');
//         });

//         var jobCount = $('.results tbody tr[visible="true"]').length;
//             $('.counter').text(jobCount + ' item');

//         if(jobCount == '0') {
//             $('.no-result').show();
//         } else {
//             $('.no-result').hide();
//         }
//     });
// });


// function toEnglishNumber(strNum) {
//     var ar = '٠١٢٣٤٥٦٧٨٩+'.split('');
//     var en = '0123456789'.split('');
//     strNum = strNum.replace(/[٠١٢٣٤٥٦٧٨٩ ]/g, x => en[ar.indexOf(x)]);
//     strNum = strNum.replace(/[^\d]/g, '');
//     return strNum;
// } 
function toEnglishNumber(strNum) {
    return strNum
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) // تحويل مباشر من unicode
    .replace(/[^\d]/g, ''); // إزالة أي رموز غير أرقام
}
$(document).on('input', '.arabicNumbers', function(e) {
    $(this).val(toEnglishNumber($(this).val()))
});
$(document).on('keyup', '.proofArabicNumbers', function(e) {
    console.log("proofArabicNumbers: ", $(this).val());
    var val = toEnglishNumber($(this).val())
    console.log("result sproofArabicNumbers: ", val);
    $(this).val(val)
});
$(document).ready(function(){
    // Variable of content
    var myylist = $("#list");
    var myselect = $(".select");

    // Show/hide function
    myselect.on('click', function(){
        myylist.toggle();
    });
    $('.list #contry').on('click', function(){
        var id =$(this).attr('data-id');
        $("#select img").attr("src",$('#contry #img'+id).attr('src'));
        $("#select span").css('padding-left', '50px');
        $("#select span").text($(this).text());
        $("#select #contry_code").attr('value', $(this).attr('value'));
        $("#list").hide();
    });
});

// JavaScript
// close list when click on anywhere
window.addEventListener('mouseup', function(event){
    var ullist = document.getElementById('list');
    if (!ullist) {
        return; // Ensure the 'ullist' element exists
    }
    if(event.target != ullist && event.target.parentNode != ullist) {
        ullist.style.display = 'none';
    }
});

function convertTime(time) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        // time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[3] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
}

function DifferenceBetweenTowDates(d1,d2) {
    var date1 = new Date(d1);
    var date2 = new Date(d2);
    // To calculate the time difference of two dates
    var Difference_In_Time = date2.getTime() - date1.getTime();
    // To calculate the no. of days between two dates
    return Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
}
