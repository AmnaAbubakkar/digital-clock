// ================= DIGITAL CLOCK (24 HOURS) =================

function updateClock() {
    let now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("time").textContent = `${hours}:${minutes}:${seconds}`;
    document.getElementById("date").textContent = now.toDateString();
}

setInterval(updateClock, 1000);
updateClock();


// ================= ALARM =================

let alarmTime = null;
let isRinging = false;       // true rahe to alarm baj'ta rahega
let audioFailed = false;
let previewTimeout = null;
let ringWatcher = null;
let audioCtx = null;

const alarmSound = document.getElementById("alarmSound");
const soundSelect = document.getElementById("soundSelect");
const alarmStatus = document.getElementById("alarmStatus");

function applySelectedSound() {
    audioFailed = false;
    alarmSound.src = soundSelect.value;
    alarmSound.load();
}

applySelectedSound();

// Agar file load na ho to pata chal jaye
alarmSound.addEventListener("error", function () {
    audioFailed = true;
    console.error("Audio file load nahi hui:", alarmSound.src);
    if (isRinging) {
        alarmStatus.textContent = "⏰ Alarm Ringing! (file nahi chali, beep chal rahi hai)";
    }
});

// Fallback beep (audio file fail ho to)
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function playBeep() {
    try {
        let ctx = getAudioContext();
        let osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Beep failed:", e);
    }
}

function startAlarm() {
    isRinging = true;
    clearTimeout(previewTimeout);

    alarmSound.loop = true;
    alarmSound.currentTime = 0;

    alarmSound.play().catch(function (error) {
        console.error("Alarm sound failed:", error);
        audioFailed = true;
    });

    alarmStatus.textContent = "⏰ Alarm Ringing! Click 'Stop Alarm' to stop it.";

    // Watchdog: jab tak isRinging true hai, alarm chalta rahe
    clearInterval(ringWatcher);
    ringWatcher = setInterval(function () {
        if (!isRinging) {
            return;
        }

        if (audioFailed) {
            playBeep();
        } else if (alarmSound.paused || alarmSound.ended) {
            alarmSound.currentTime = 0;
            alarmSound.play().catch(function () {
                audioFailed = true;
            });
        }
    }, 500);
}

function stopAlarm() {
    isRinging = false;           // loop yahan band hota hai
    clearInterval(ringWatcher);
    ringWatcher = null;
    clearTimeout(previewTimeout);

    alarmSound.loop = false;
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

// Set Alarm
document.getElementById("setAlarm").addEventListener("click", function () {
    let inputTime = document.getElementById("alarmTime").value;   // hamesha "HH:MM" 24 hours mein

    if (inputTime === "") {
        alarmStatus.textContent = "Please select alarm time";
        return;
    }

    getAudioContext();           // click ke waqt audio ko unlock kar lo
    alarmTime = inputTime;
    applySelectedSound();

    // Button dabate hi foran message
    alarmStatus.textContent = "✅ Alarm set for " + alarmTime;
});

// Har second check karo ke alarm ka waqt aaya ya nahi
setInterval(function () {
    if (alarmTime !== null && !isRinging) {
        let now = new Date();

        let currentTime =
            now.getHours().toString().padStart(2, "0") + ":" +
            now.getMinutes().toString().padStart(2, "0");

        if (currentTime === alarmTime) {
            alarmTime = null;
            startAlarm();
        }
    }
}, 1000);

// Stop Alarm
document.getElementById("stopAlarm").addEventListener("click", function () {
    stopAlarm();
    alarmTime = null;
    alarmStatus.textContent = "Alarm Stopped";
});

// Sound badalne par 3 second ka preview
soundSelect.addEventListener("change", function () {
    applySelectedSound();

    if (isRinging) {
        alarmSound.loop = true;
        alarmSound.play().catch(function () {
            audioFailed = true;
        });
        return;
    }

    alarmSound.loop = false;
    alarmSound.play().catch(function (error) {
        console.error("Sound failed:", error);
        alarmStatus.textContent = "Ye sound file nahi chal rahi. File ka naam check karein.";
    });

    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(function () {
        if (!isRinging) {
            alarmSound.pause();
            alarmSound.currentTime = 0;
        }
    }, 3000);
});


// ================= STOPWATCH =================

let stopwatchTime = 0;
let stopwatchInterval = null;

function showStopwatch() {
    let hours = Math.floor(stopwatchTime / 3600);
    let minutes = Math.floor((stopwatchTime % 3600) / 60);
    let seconds = stopwatchTime % 60;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("stopwatch").textContent = `${hours}:${minutes}:${seconds}`;
}

document.getElementById("start").addEventListener("click", function () {
    if (stopwatchInterval === null) {
        stopwatchInterval = setInterval(function () {
            stopwatchTime++;
            showStopwatch();
        }, 1000);
    }
});

document.getElementById("pause").addEventListener("click", function () {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
});

document.getElementById("reset").addEventListener("click", function () {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
    stopwatchTime = 0;
    showStopwatch();
});