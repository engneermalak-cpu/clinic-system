let countdownInterval;
let timer = 0;
function startTimer() {
    clearInterval(countdownInterval);

    const countdownSpan = document.getElementById('countdown');
    const resendNote = document.getElementById('resend-note');
    const realResendLink = document.getElementById('real-resend-link');

    const now = Math.floor(Date.now() / 1000);
    let timer = otpSentTimestamp ? Math.max(60 - (now - otpSentTimestamp), 0) : 60;

    if (timer > 0) {
        resendNote.classList.remove('d-none');
        realResendLink.classList.add('d-none');

        countdownSpan.textContent = timer;

        const countdownInterval = setInterval(() => {
            timer--;
            countdownSpan.textContent = timer;

            if (timer <= 0) {
                clearInterval(countdownInterval);
                resendNote.classList.add('d-none');
                realResendLink.classList.remove('d-none', 'resend-link');
                realResendLink.classList.add('active-resend-link');
                }
        }, 1000);
    } else {
        // انتهى الوقت مسبقًا → فعّل الرابط فورًا
        resendNote.classList.add('d-none');
        realResendLink.classList.remove('d-none', 'resend-link');
        realResendLink.classList.add('active-resend-link');
    }
}

// Focus on the first OTP input field when the page loads
document.addEventListener("DOMContentLoaded", function () {
    startTimer();
    const inputs = document.querySelectorAll('.otp-box input');
    const form = document.querySelector('form');
    const loadingMessage = document.getElementById('loading-message');
    const resendLink = document.getElementById('real-resend-link');
    let submitted = false;

    if (inputs.length > 0) inputs[0].focus();

    inputs.forEach((input, index) => {
        input.addEventListener('input', (event) => {
            if (event.inputType !== 'deleteContentBackward' && input.value.length === 1) {
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }

                // تحقق هل جميع الحقول ممتلئة؟
                if ([...inputs].every(inp => inp.value.length === 1)  && !submitted) {
                    submitted = true;
                    loadingMessage.style.display = 'inline-block';
                    setTimeout(() => form.submit(), 900); // يعطي المستخدم فرصة لرؤية الرسالة
                }
            }
        });

        input.addEventListener('keydown', (event) => {
            if (event.key === 'Backspace' && input.value.length === 0 && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
});
