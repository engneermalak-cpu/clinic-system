
// ⏱️ إعدادات الوقت والصوت
let alertPlayed = {}; // تتبع حالة الصوت لكل موعد
let alertPlayCount = {}; // مفتاحه هو appointmentId وقيمته عدد المرات
let AppointmentStarted = !!CONFIG.Appointment.START_TIME; // إذا كان موجودًا مسبقًا

// ⏲️ ضبط وقت الخادم بالنسبة للعميل
const localTimeAtLoad = new Date(); // وقت المتصفح عند تحميل الصفحة
const timeOffset = CONFIG.Appointment.SERVER_TIME - localTimeAtLoad; // حساب الفرق بين وقت الخادم ووقت المتصفح
setInterval(() => {
    CONFIG.Appointment.SERVER_TIME = new Date(new Date().getTime() + timeOffset);
}, 1000);


let localTracks = { audioTrack: null, videoTrack: null };
let remoteUsers = {};
let isJoined = false;
let cameraError = false;
let isScreenSharing = false;

window.agoraState = {
    client,
    localTracks,
    remoteUsers,
    isJoined,
    isScreenSharing,
    appointmentId: AppointmentId,
    username
};
// 📦 المتغيرات العامة
const loadingScreen = document.getElementById("loading-screen");
const chatPanel = document.getElementById("chat-panel");
const chatToggleBtn = document.getElementById("chat-toggle-btn");
const closeChatBtn = document.getElementById("close-chat-btn");
const sendChatBtn = document.getElementById("send-chat-btn");
const chatInputField = document.getElementById("chat-input-field");
const chatMessages = document.getElementById("chat-messages");
const shareScreenBtn = document.getElementById("share-screen-btn");
// ✅ لوحة المشاركين
const participantsBtn = document.getElementById("participants-btn");
const participantsPanel = document.getElementById("participants-panel");
const closeParticipantsBtn = document.getElementById("close-participants-btn");
const participantsList = document.getElementById("participants-list");
// settinges module
const settingsBtn = document.getElementById('settings-btn');
const settingsModalOverlay = document.getElementById('settingsModalOverlay');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const ForceAudioOnlyBtn = document.getElementById('force-audio-only-btn'); // إخفاء زر الصوت فقط في البداية

// 🎧 إعداد مستمعي الأحداث للعناصر
function setupUIListeners()  {
    document.getElementById("end-call-btn")?.addEventListener("click", endCall);
    document.getElementById("mic-btn")?.addEventListener("click", toggleMic);
    document.getElementById("cam-btn")?.addEventListener("click", toggleCam);

    chatToggleBtn?.addEventListener('click', toggleChat);
    closeChatBtn?.addEventListener('click', toggleChat);
    participantsBtn?.addEventListener("click", toggleParticipantsPanel);
    closeParticipantsBtn?.addEventListener("click", toggleParticipantsPanel);
    shareScreenBtn.addEventListener("click", toggleScreenShare);
    sendChatBtn?.addEventListener("click", sendMessage);
    chatInputField?.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
    settingsBtn?.addEventListener("click", () => settingsModalOverlay.classList.add("open"));
    closeSettingsBtn?.addEventListener("click", () => settingsModalOverlay.classList.remove("open"));
    settingsModalOverlay?.addEventListener('click', (e) => {
        if (e.target === settingsModalOverlay) {
            settingsModalOverlay.classList.remove('open');
        }
    });
}
// 🧠 تحديث قائمة المشاركين
function updateParticipantsList() {
    participantsList.innerHTML = "";

    const allUsers = [
        {
            uid: UID,
            name: username || "أنت",
            isLocal: true,
            audioMuted: localTracks.audioTrack?.muted ?? true,
            videoMuted: localTracks.videoTrack?.muted ?? true
        },
        ...Object.keys(remoteUsers).filter(uid => Number(uid) !== UID).map(uid => ({
            uid,
            name: remoteUsers[uid]?._cname || remoteUsers[uid]?.name || `مستخدم ${uid}`,
            isLocal: false,
            audioMuted: remoteUsers[uid]?.audioTrack?.muted ?? true,
            videoMuted: remoteUsers[uid]?.videoTrack?.muted ?? true,
        }))
    ];

    allUsers.forEach(user => {
        const div = document.createElement("div");
        div.className = "participant-list-item";

        // 🧠 Avatar: رمزي أو أول حرفين من الاسم
        let avatarContent;
        if (user.isLocal) {
            avatarContent = `<i class="fas fa-user"></i>`;
        } else {
            const initials = user.name.split(" ").map(word => word[0]).join("").substring(0, 2).toUpperCase();
            const bgColors = ["#1abc9c", "#3498db", "#e67e22", "#8e44ad", "#f39c12"];
            const color = bgColors[user.uid % bgColors.length] || "#7f8c8d";
            avatarContent = `<div class="participant-list-avatar" style="background-color: ${color};">${initials}</div>`;
        }

        div.innerHTML = `
            <div class="participant-list-avatar">
                ${user.isLocal ? `<i class="fas fa-user"></i>` : avatarContent}
            </div>
            <div class="participant-list-info">
                <span class="name">${user.isLocal ? `أنت (${user.name})` : user.name}</span>
            </div>
            <div class="participant-list-controls">
                <i class="fas fa-microphone${user.audioMuted ? '-slash muted' : ' active'}" title="${user.audioMuted ? 'الصوت مكتوم' : 'الصوت مفعل'}"></i>
                <i class="fas fa-video${user.videoMuted ? '-slash cam-off' : ' active'}" title="${user.videoMuted ? 'الكاميرا مغلقة' : 'الكاميرا مفعلة'}"></i>
            </div>
        `;

        participantsList.appendChild(div);
    });

    // تحديث العدد في العنوان
    const participantCountEl = document.getElementById("participantCount");
    if (participantCountEl) participantCountEl.textContent = allUsers.length;
}
function toggleChat() {
    chatPanel?.classList.toggle('open')
    // Ensure participants panel is closed if chat is opened
    if (participantsPanel.classList.contains("open")) participantsPanel.classList.remove("open");
}

function toggleParticipantsPanel() {
    updateParticipantsList();
    participantsPanel.classList.toggle('open');
    // Ensure chat panel is closed if participants list is opened
    if (chatPanel.classList.contains("open")) chatPanel.classList.remove("open");
}

function sendMessage() {
    const text = chatInputField.value.trim();
    if (!text) return;
    addMessage(text, "أنت", true);
    chatInputField.value = "";
    setTimeout(() => addMessage("رسالة رد تلقائية للتوضيح.", "النظام", false), 1000);
}

function addMessage(text, sender, isSent) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isSent ? "sent" : "received");
    messageDiv.innerHTML = `
        <span class='message-sender'>${sender}</span>
        <p>${text}</p>
        <span class='message-time'>${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 📌 Helper: Ensure Joined Once
async function ensureJoined() {
    if(!isJoined) {
        await client.join(APP_ID, CHANNEL, TOKEN, UID);
        isJoined = true;
    }
}

// ✅ Join Call and Publish Tracks
async function joinCall() {
    try {
        // ⚡ محاولة الانضمام للقناة
        await ensureJoined();

        // 🎤 إنشاء تراك الصوت وكتمه فوراً
        const selectedMic = document.getElementById("mic-list")?.value;
        localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(selectedMic ? { microphoneId: selectedMic } : {});
        await localTracks.audioTrack.setMuted(true); // 🔇 كتم الصوت فورًا
        console.log("🎤 تم إنشاء تراك الصوت");

        // 🎥 محاولة إنشاء تراك الفيديو وكتمه
        try {
            localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
            await localTracks.videoTrack.setMuted(true); // 🔇 كتم الكاميرا مباشرة
        } catch (videoErr) {
            console.warn("🚫 تعذر إنشاء تراك الفيديو:", videoErr);
            cameraError = true; // الفيديو غير متوفر، نكمل بالصوت فقط
            localTracks.videoTrack = null;
            const msg = (videoErr?.name === "NotAllowedError" || videoErr?.code === "PERMISSION_DENIED" || videoErr.message?.includes("Permission denied"))
                ? "⚠️ لم يتم منح إذن الكاميرا. الرجاء السماح من إعدادات المتصفح."
                : (videoErr?.name === "NotReadableError")
                ? "⚠️ الكاميرا قيد الاستخدام من تطبيق آخر."
                : "❌ فشل تشغيل الكاميرا: " + (videoErr.message || videoErr.name);
            showError(msg, "مشكلة في الكاميرا");
        }

        // 🎦 عرض فيديو المستخدم (أو أيقونة الفيديو المغلق)
        renderVideo(UID, localTracks.videoTrack, true);

        // 🚀 نشر التراكات بعد التأكد من جاهزيتها ومكتومة
        const publishTracks = [localTracks.audioTrack];
        if (localTracks.videoTrack) publishTracks.push(localTracks.videoTrack);
        await client.publish(publishTracks);

        // ⏱ إعادة النشر بعد قليل لضمان التزامن الكامل للطرف الآخر
        setTimeout(async () => {
            if (isJoined && localTracks.audioTrack) {
                try {
                    await client.unpublish();
                    await client.publish(publishTracks);
                } catch (e) {
                    logAndNotifyError(e, "فشل نشر التراكات");
                }
            }
        }, 2500);

        return cameraError;
    } catch (e) {
        showError("فشل في إعداد المكالمة. يرجى المحاولة لاحقًا.", "⚠️ خطأ أثناء الإعداد");
        throw e;
    }
}
// 🎥 Render Video or Placeholder
function renderVideo(uid, track, isLocal = false) {
    const existing = document.getElementById(`participant-${uid}`);
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = `participant-${uid}`;
    container.classList.add("participant-tile");
    if (isLocal) container.classList.add("self-view");

    const videoWrapper = document.createElement("div");
    videoWrapper.classList.add("video-player");
    container.appendChild(videoWrapper);

    // Placeholder for camera off
    const camPlaceholder = document.createElement("div");
    camPlaceholder.classList.add("camera-off-placeholder");
    camPlaceholder.innerHTML = `<i class="fas fa-video-slash"></i>`;
    camPlaceholder.style.display = "none";
    container.appendChild(camPlaceholder);

    const overlay = document.createElement("div");
    overlay.classList.add("participant-overlay");
    overlay.innerHTML = `
        <span class="participant-name">${isLocal ? "أنت" : uid}</span>
        <div class="status-icons">
            <i class="fas fa-microphone-slash" id="mic-status-${uid}"></i>
            <i class="fas fa-video-slash cam-off" id="cam-status-${uid}"></i>
        </div>
    `;
    container.appendChild(overlay);
    container.addEventListener('click', (e) => {
        e.preventDefault(); // يمنع تكرار التنفيذ في الهواتف
        toggleEnlarged(e);
    }, { passive: false });

    document.getElementById("video-streams-grid").appendChild(container);

    setTimeout(async () => {
        let isCamMutedNow = true;
        if (track && typeof track.play === "function") {
            try {
                await track.play(videoWrapper);
                isCamMutedNow = track.muted;
            } catch (err) {
                console.warn("🚫 تعذر تشغيل الفيديو أو قراءة الحالة:", err);
                isCamMutedNow = true;
            }
        }
        // 🔄 تحديث عرض عنصر الكاميرا المغلقة
        // camPlaceholder.style.display = isCamMutedNow ? "flex" : "none";


        // 🔄 تحديث أيقونات الحالة
        const micMuted = isLocal
            ? localTracks.audioTrack?.muted ?? true
            : remoteUsers[uid]?.audioTrack?.muted ?? true;
        updateTrackIcons(uid, micMuted, isCamMutedNow);
        // updateTrackIcons(uid, false, false);
    }, 100);
}

// 🔄 Update Icons and Placeholder
function updateTrackIcons(uid, micMuted, camMuted) {
    const micIcon = document.getElementById(`mic-status-${uid}`);
    const camIcon = document.getElementById(`cam-status-${uid}`);
    const camPlaceholder = document.querySelector(`#participant-${uid} .camera-off-placeholder`);
    // if (micIcon) micIcon.className = micMuted ? "fas fa-microphone-slash muted" : "fas fa-microphone";
    if (micIcon && micMuted !== null) {
        micIcon.className = micMuted ? "fas fa-microphone-slash muted" : "fas fa-microphone";
    }
    // if (camIcon) camIcon.className = camMuted ? "fas fa-video-slash cam-off" : "fas fa-video";
    // if (camPlaceholder) camPlaceholder.style.display = camMuted ? "flex" : "none";

    if (camIcon && camMuted !== null) {
        console.log("camMuted change");
        camIcon.className = camMuted ? "fas fa-video-slash cam-off" : "fas fa-video";
    }

    if (camPlaceholder && camMuted !== null) {
        console.log("camMuted camera-off-placeholde change ");
        camPlaceholder.style.display = camMuted ? "flex" : "none";
    }
}
async function checkAppointmentStatusAndStartClock() {
    if (AppointmentStarted || !window.agoraState.appointmentId) return;
    try {
        const response = await fetch(CONFIG.API.APPOINTMENT_STATUS_URL);
        const data = await response.json();

        console.log("response Timer: ", response);
        console.log("data Timer: ", data);
        if (data.started && data.end_time) {
            AppointmentStarted = true; // ✅ نمنع التكرار
            CONFIG.Appointment.START_TIME = data.start_at;
            CONFIG.Audio.NOTIFY_START.play();

            document.querySelectorAll(".counter").forEach(counter => {
                counter.setAttribute("data-endtime", data.end_time); // ← من API
                initializeClock(counter);
            });
            clearInterval(appointmentInterval);
        }
    } catch (error) {
        console.warn("❌ فشل في جلب حالة بدء الموعد:", error);
    }
}

window.setupEventListeners = function () {
    client.on("user-joined", async (user) => {
        // تأكد ما تم عرضه مسبقًا
        if (!remoteUsers[user.uid]) {
            remoteUsers[user.uid] = { ...user};
        }

        if (!document.getElementById(`participant-${user.uid}`)) {
            renderVideo(user.uid, user.videoTrack || null);  // نعرضه مباشرة حتى لو ما نشر شيء
        }
        updateParticipantsList();
        Toastify({
            text: `🎉 انضم ${user.uid} إلى الجلسة`,
            duration: 3000,
            gravity: "top",
            position: 'top',
            backgroundColor: "#28a745",
            escapeMarkup: false // حتى لا يهرب الوسوم HTML
        }).showToast();
    });

    // 📡 Subscribing to Published Tracks
    client.on("user-published", async (user, mediaType) => {
        // ✅ اشترك في نوع الوسائط
        await client.subscribe(user, mediaType);
        // // ✅ إذا لم يتم عرض هذا المستخدم بعد، قم بعرضه الآن


        // 🎯 هنا نعيد رسم الفيديو بالتراك الصحيح
        if (mediaType === "video" && user.videoTrack) {
            user.videoTrack?.play(document.querySelector(`#participant-${user.uid} .video-player`));
        }
        // if (mediaType === "video") user.videoTrack?.play(document.querySelector(`#participant-${user.uid} .video-player`));
        if (mediaType === "audio" && user.audioTrack) user.audioTrack?.play();

        // ✅ تحديث الأيقونات بدقة بعد اشتراك أي وسيلة
        const micMuted = !user.audioTrack || user.audioTrack.muted;
        const camMuted = !user.videoTrack || user.videoTrack.muted;
        updateTrackIcons(user.uid, micMuted, camMuted);
    });

    client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "video") updateTrackIcons(user.uid, null, true);
        if (mediaType === "audio") updateTrackIcons(user.uid, true, null);
    });

    client.on("user-left", user => {
        const el = document.getElementById(`participant-${user.uid}`);
        if (el) el.remove();
        delete remoteUsers[user.uid];
        updateParticipantsList();
    });

    // تنبيه قبل انتهاء صلاحية التوكن (عادة قبل 30 ثانية من الانتهاء)
    client.on("token-privilege-will-expire", async () => {
        // showError("⚠️ ستنتهي صلاحية الجلسة قريبًا.", 'تنبية');
    });

    // التوكين انتهت صلاحيته فعليًا
    client.on("token-privilege-did-expire", async () => {
        // showError("انتهت صلاحية الاتصال، سيتم المحاولة لإعادة الانضمام...", "⚠️ الاتصال منقطع");
    });
    // client.on("token-privilege-did-expire", async () => {
    //     showError("انتهت صلاحية الاتصال. نحاول إعادة الانضمام...");
    //     try {
    //         await client.leave();
    //         await ensureJoinedOnce();
    //         await client.publish(Object.values(localTracks).filter(Boolean));
    //         showToast("✅ تمت إعادة الانضمام بنجاح", "#3498db");
    //     } catch (e) {
    //         logAndNotifyError(e, "فشل إعادة الاتصال");
    //     }
    // });

    client.on("connection-state-change", (curState, revState, reason) => {
        console.log(`🚦 اتصال: ${revState} → ${curState} (${reason})`);
        if (curState === "DISCONNECTED") {
            showError("📴 تم قطع الاتصال بالجلسة.");
        }
    });
    client.enableAudioVolumeIndicator();
    client.on("volume-indicator", volumes => {
        let maxVolumeUser = volumes.reduce((max, u) => (u.level > max.level ? u : max), { level: 0 });
        if (maxVolumeUser.level > 5) highlightActiveSpeaker(maxVolumeUser.uid);
    });
}
function getInitials(name) {
    return name
        .split(" ")
        .map(w => w[0].toUpperCase())
        .join("")
        .slice(0, 2);
}


function toggleEnlarged(event) {
    const container = event.currentTarget;
    const alreadyEnlarged = container.classList.contains('enlarged');
    document.querySelectorAll('.participant-tile').forEach(tile => tile.classList.remove('enlarged'));
    document.getElementById("video-streams-grid").classList.toggle('enlarged-active', !alreadyEnlarged);

    if (!alreadyEnlarged) {
        container.classList.add('enlarged');
    } else {
        container.classList.remove('enlarged');
    }
}

// 🧹 إزالة الفيديو عند مغادرة المستخدم
function removeVideo(uid) {
    const el = document.getElementById(`participant-${uid}`);
    if (el) el.remove();
}

function highlightActiveSpeaker(uid) {
    document.querySelectorAll(".participant-tile").forEach(el => el.classList.remove("speaking"));
    const activeUser = document.getElementById(`participant-${uid}`);
    if (activeUser) {
        activeUser.classList.add("speaking");
        // activeUser.parentNode.prepend(activeUser);
    }
}

// 🔊 Toggle Mic
async function toggleMic() {
    if (!localTracks.audioTrack) return;

    const wasMuted = localTracks.audioTrack.muted;
    const willMute = !wasMuted;

    await localTracks.audioTrack.setMuted(willMute);
    updateToggleState("mic-btn", willMute, "fas fa-microphone-slash", "fas fa-microphone");

    // ✅ تحديث الأيقونات لدى الطرف الآخر (بشرط استخدام قناة Signal)
    updateTrackIcons(
        UID,
        willMute, // الحالة الجديدة للمايك
        localTracks.videoTrack?.muted ?? true
    );
}

// 📷 Toggle Camera
async function toggleCam() {
    if (!localTracks.videoTrack) return;
    const newState = !localTracks.videoTrack.muted;
    await localTracks.videoTrack.setMuted(newState);
    updateToggleState("cam-btn", newState, "fas fa-video-slash", "fas fa-video");
    updateTrackIcons(
        UID,
        localTracks.audioTrack?.muted ?? true,
        newState
    );
}

// 📷 Toggle Screen Share
async function toggleScreenShare() {
    if (!isScreenSharing) {
        try {
            localTracks.screenTrack = await AgoraRTC.createScreenVideoTrack();
            await client.unpublish(localTracks.videoTrack);
            await client.publish(localTracks.screenTrack);
            localTracks.screenTrack.play(`video-player-${UID}`);
            isScreenSharing = true;
            shareScreenBtn.classList.add("toggled");
            shareScreenBtn.querySelector("i").className = "fas fa-times-circle";
        } catch (err) {
            console.error("فشل في مشاركة الشاشة:", err);
            showError("خطأ في مشاركة الشاشة");
        }
    } else {
        await client.unpublish(localTracks.screenTrack);
        localTracks.screenTrack.stop();
        localTracks.screenTrack.close();
        localTracks.screenTrack = null;
        await client.publish(localTracks.videoTrack);
        const player = document.getElementById(`video-player-${UID}`);
        if (player) {
            player.innerHTML = "";
            localTracks.videoTrack.play(player);
        }
        isScreenSharing = false;
        shareScreenBtn.classList.remove("toggled");
        shareScreenBtn.querySelector("i").className = "fas fa-desktop";
    }
}

// 🧭 Show Force Audio-Only button if needed
function showForceAudioOnlyBtn(btn) {
    if (!btn) return;
    const computedStyle = window.getComputedStyle(btn);
    if (computedStyle.display === "none") {
        setTimeout(() => {
            btn.style.display = "inline-block";
            btn.disabled = false;
        }, 150);
    }
}

// 🧭 List available microphones
async function listMicrophones() {
    try {
        const mics = await AgoraRTC.getMicrophones();
        const select = document.getElementById("mic-list");
        if (!select) return;
        select.innerHTML = "";

        // إضافة خيار افتراضي
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "اختر ميكروفون...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // تعبئة قائمة الميكروفونات
        mics.forEach(mic => {
            const opt = document.createElement("option");
            opt.value = mic.deviceId;
            opt.text = mic.label || `ميكروفون ${mic.deviceId}`;
            select.appendChild(opt);
        });

        // معالجة حالة عدم وجود ميكروفونات
        if (mics.length === 0) {
            const opt = document.createElement("option");
            opt.value = "";
            opt.text = "لم يتم العثور على ميكروفونات";
            opt.disabled = true;
            select.appendChild(opt);
        }
    } catch (err) {
        console.error("فشل الحصول على قائمة الميكروفونات:", err);
    }
}
function showMeetingModal(message) {
    document.getElementById("modal-message").textContent = message;
    document.getElementById("meeting-alert-modal").style.display = "flex";
}
function closeMeetingModal() {
    document.getElementById("meeting-alert-modal").style.display = "none";
}

// ✅ Update Button UI
function updateToggleState(btnId, isToggled, classOn, classOff) {
    const btn = document.getElementById(btnId);
    btn.classList.toggle("toggled", isToggled);
    btn.setAttribute("aria-pressed", isToggled);
    const icon = btn.querySelector("i");
    icon.className = isToggled ? classOn : classOff;
}



// ✅ زر متابعة بدون كاميرا
ForceAudioOnlyBtn?.addEventListener("click", async () => {
    const btn = ForceAudioOnlyBtn;
    btn.disabled = true;

    try {
        // تحقق من صلاحية الميكروفون فعليًا قبل بدء الاتصال
        try {
            const micCheck = await navigator.mediaDevices.getUserMedia({ audio: true });
            micCheck.getTracks().forEach(track => track.stop()); // نوقف المسار مباشرة بعد التأكد
        } catch (micErr) {
            showError("❌ لا يمكن الوصول للميكروفون. الرجاء التأكد من منحه الصلاحية.");
            btn.disabled = false;
            return;
        }

        await ensureJoined();
        const selectedMic = document.getElementById("mic-list")?.value;
        localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack(selectedMic ? { microphoneId: selectedMic } : {});

        renderVideo(UID, null, true); // لا يوجد فيديو

        const isMicMuted = localTracks.audioTrack ? localTracks.audioTrack.muted : true;
        const isCamMuted = true;

        updateTrackIcons(UID, isMicMuted, isCamMuted);

        await client.publish([localTracks.audioTrack]);
        showError("📢 تم الانضمام بالصوت فقط.");
        btn.style.display = "none";
    } catch (e) {
        showError("❌ فشل الانضمام بالصوت فقط: " + (e.message || e));
        btn.disabled = false;
    }
});


// 🛑 End Call
async function endCall() {
    try {
        for (let trackName in localTracks) {
            if (localTracks[trackName]) {
                localTracks[trackName].stop();
                localTracks[trackName].close();
            }
        }
        await client.leave();
        document.getElementById("video-streams-grid").innerHTML = "";
        showError("تم إنهاء المكالمة.");
    } catch (err) {
        showError("فشل إنهاء المكالمة.");
    }
}


// 📌 Helper: Show Error Toast
function showError(message, title='فشل') {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        timer: 5000
    });
}

function logAndNotifyError(error, context = 'غير معروف') {
    console.error(`📛 [${context}]`, error);
    showError(error.message || "حدث خطأ غير متوقع", `⚠️ ${context}`);
}


//Timer
// 🔢 دالة حساب الوقت المتبقي
function getTimeRemaining(endtime) {
    const t = Date.parse(endtime) - CONFIG.Appointment.SERVER_TIME.getTime();
    return {
        'total': t,
        'days': Math.floor(t / (1000 * 60 * 60 * 24)),
        'hours': Math.floor((t / (1000 * 60 * 60)) % 24),
        'minutes': Math.floor((t / 1000 / 60) % 60),
        'seconds': Math.floor((t / 1000) % 60)
    };
}

// 🕒 تشغيل العداد الزمني لموعد معين
function initializeClock(clockElement) {
    const appointmentId = clockElement.id.replace("counter", "");
    const endtime = clockElement.getAttribute("data-endtime");
    if(!endtime) return; // إذا لم يكن هناك وقت نهاية، لا تعمل الدالة

    // تعريف الأزرار والعناصر الأخرى
    const appointmentStatus = document.getElementById("appointment_status" + appointmentId);
    alertPlayed[appointmentId] = false; // تعيين الصوت لم يتم تشغيله لهذا الموعد
    alertPlayCount[appointmentId] = 0;
    let timeinterval; // ✅ هنا الحل
    function updateClock() {
        const t = getTimeRemaining(endtime);
        if(t.total <= 0) {
            clearInterval(timeinterval);
            clockElement.innerHTML = "EXPIRED";
            if (appointmentStatus) {
                appointmentStatus.innerText = Trans.AppointmentEnded;
                appointmentStatus.classList.add('expired');
            }
            playSoundAppotmentEnd();
            return;
        }

        // عرض الوقت بصيغة 00:00:00
        const formatNumber = num => ('0' + num).slice(-2);
        clockElement.innerText = `${formatNumber(t.hours)}:${formatNumber(t.minutes)}:${formatNumber(t.seconds)}`;
        clockElement.classList.remove('text-success', 'end-after-five-mints', 'expired'); // إزالة الكلاسات السابقة

        if (t.hours === 0) {
            if (t.minutes <1) {
                clockElement.classList.add('expired'); // دقيقة أو أقل
            } else if (t.minutes < CONFIG.REMAINING_ALERT_MINUTES) {
                clockElement.classList.add('end-after-five-mints'); // أقل من 5 دقائق
            } else {
                clockElement.classList.add('text-success'); // أكثر من 5 دقائق
            }
        } else {
            clockElement.classList.add('text-success');
        }
        // تشغيل الصوت إذا كان الوقت أقل من 5 دقائق ولم يتم تشغيل الصوت مسبقًا
        if (t.hours === 0 && t.minutes < CONFIG.REMAINING_ALERT_MINUTES && t.minutes >= 0) {
            alertPlayCount[appointmentId] = alertPlayCount[appointmentId] || 0;
            if (alertPlayCount[appointmentId] <= CONFIG.MAX_ALERT_REPEAT) {
                playSoundAppotmentEndAfter5Mints();
                alertPlayCount[appointmentId]++;
            }
        }
    }
    updateClock();
    timeinterval = setInterval(updateClock, 1000);
}

// 🔊 تشغيل تنبيه 5 دقائق
function playSoundAppotmentEndAfter5Mints() {
    CONFIG.Audio.NOTIFY_5MINTS.play().catch(error => console.error("🔇 فشل تشغيل الصوت:", error));
}

// 🔊 تشغيل تنبيه انتهاء الموعد
function playSoundAppotmentEnd() {
    const sound = CONFIG.Audio.NOTIFY_EXPIRED;
    try {
        sound.pause();          // إيقاف أي تشغيل سابق
        sound.currentTime = 0;  // إعادة الصوت للبداية
        sound.play().catch(err => {
            console.error("🔇 فشل تشغيل صوت انتهاء الموعد:", err);
        });
    } catch (error) {
        console.error("❌ خطأ أثناء تشغيل صوت انتهاء الموعد:", error);
    }
}
