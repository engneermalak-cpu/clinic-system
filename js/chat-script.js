
// قائمة الملفات المؤقتة
let selectedFiles = [];
let fileInput;
document.addEventListener('DOMContentLoaded', function () {
    fileInput = document.getElementById('chat-attachment');
    const filePreview = document.getElementById('file-preview');
    const fileList = document.getElementById('file-list');
    const removeAllBtn = document.getElementById('remove-all-files');

    fileInput.addEventListener('change', function () {
        const newFiles = [...fileInput.files];

        // دمج الجديد مع القديم (بدون تكرار الاسم)
        newFiles.forEach(file => {
            if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                selectedFiles.push(file);
            }
        });
        renderPreview();
        syncInputFiles();
    });

    function renderPreview() {
        fileList.innerHTML = '';
        if (selectedFiles.length === 0) {
            filePreview.classList.add('d-none');
            return;
        }
        filePreview.classList.remove('d-none');

        selectedFiles.forEach((file, index) => {
            const fileBox = document.createElement('div');
            fileBox.className = 'border rounded d-flex align-items-center p-1 bg-white';
            fileBox.style.maxWidth = '220px';
            fileBox.dataset.index = index;

            const thumb = document.createElement('div');
            thumb.className = 'me-2';
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.className = 'img-thumbnail';
                img.style.maxWidth = '40px';
                img.style.maxHeight = '40px';
                thumb.appendChild(img);
            } else if (file.type === 'application/pdf') {
                thumb.innerHTML = '<i class="bx bxs-file-pdf text-danger fs-4"></i>';
            } else {
                thumb.innerHTML = '<i class="bx bxs-file fs-4 text-secondary"></i>';
            }

            const name = document.createElement('span');
            name.className = 'text-truncate small me-2';
            name.style.maxWidth = '120px';
            name.textContent = file.name;

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-sm btn-link text-danger p-0 ms-auto';
            removeBtn.innerHTML = '<i class="bx bx-x-circle"></i>';
            removeBtn.type = 'button';
            removeBtn.onclick = () => removeFile(index);

            fileBox.appendChild(thumb);
            fileBox.appendChild(name);
            fileBox.appendChild(removeBtn);
            fileList.appendChild(fileBox);
        });
    }

    function syncInputFiles() {
        const dt = new DataTransfer();
        selectedFiles.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }

    // حذف ملف واحد
    function removeFile(index) {
        selectedFiles.splice(index, 1);
        renderPreview();
        syncInputFiles();
    }

    // حذف الكل
    removeAllBtn.addEventListener('click', function () {
        selectedFiles = [];
        fileInput.value = '';
        renderPreview();
    });


    // imoji
    const emojiBtn = document.getElementById('toggle-emoji-picker');
    const emojiPicker = document.getElementById('emoji-picker');
    const input = document.querySelector('input[name="message"]');

    // إظهار / إخفاء الإيموجي
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('d-none');
    });

    // عند اختيار إيموجي
    emojiPicker.addEventListener('emoji-click', event => {
        input.value += event.detail.unicode;
        emojiPicker.classList.add('d-none');
    });

    // إغلاق الإيموجي إذا ضغط خارج البوب أب
    document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && !emojiBtn.contains(e.target)) {
            emojiPicker.classList.add('d-none');
        }
    });
});

$(document).ready(function () {
    // منع إعادة تحميل الصفحة عند إرسال الرسالة
    $('.chat-footer').on('submit', function (e) {
        // $(e.target).attr('disabled', true);
        e.preventDefault();
        
        let formData = new FormData(this);
        let url = $(this).attr('action');
        let method = $(this).attr('method');

        $.ajax({
            url: url,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                // $(e.target).attr('disabled', false);
                // إضافة الرسالة إلى المحادثة
                if ($(`.chat-conversation ul li[data-id="${response.message_id}"]`).length === 0) {
                    $('.chat-conversation .messages-content').append(response.html);
                }

                $('.chat-input').val('');
                
                // ✅ تفريغ ملف المرفقات فعليًا
                $('input[name="attachments"]').val('');
                selectedFiles = [];
                fileInput.value = '';
                scrollToBottom();

                // تنظيف معاينة الملف بعد الإرسال
                $('#file-preview').addClass('d-none');
                $('#file-name').text('');
                $('#file-thumbnail').html('');

                $(".em").each(function() {
                    $(this).html('');
                })
            },
            error: function(xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;
                    // Clear previous errors
                    $(".em").each(function() {
                        $(this).html('');
                    });
                    $.each(errors, function(key, messages) {
                        const baseKey = key.split('.')[0]; // handle attachments.0, attachments.1
                        $("#err" + baseKey).html(messages[0]);
                    });
                } else {
                    SwError(CONFIG.Trans.Failed, CONFIG.Trans.An_Error_OccurredWhileSending);
                }
            }
        });
    });

    // دالة لجلب الرسائل كل 5 ثواني
    setInterval(fetchNewMessages, 1000);

    function fetchNewMessages() {
        $.ajax({
            url: CONFIG.Routes.fetchNewMessages,
            method: 'GET',
            success: function (data) {
                $('.chat-conversation ul').html(data.html);
                scrollToBottom();
            }
        });
    }
    function scrollToBottom() {
        $('.chat-conversation').scrollTop($('.chat-conversation')[0].scrollHeight);
    }
});
