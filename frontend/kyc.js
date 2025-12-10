/* =====================================================
   UNIVERSAL CONFIG
===================================================== */

const STEPS = ["kyc", "docs", "verify", "status"];

// Steps that the user has OFFICIALLY completed by pressing NEXT.
let completedSteps = [];

/* Required fields per step */
const REQUIRED = {
    kyc: [
    "firstName",
    "middleName",
    "lastName",
    "fatherName",
    "dob",
    "age",
    "gender",
    "mobile",
    "email",
    "address"
    ],
    docs: ["aadhaarFile", "addressFile", "photoFile"], // file inputs
    verify: ["signFile", "otpMethod"],  
    status: []
};


/* =====================================================
   INITIALIZATION
===================================================== */
window.addEventListener("DOMContentLoaded", () => {
    loadFormData();
    attachLiveListeners();
    showSection("kyc");
});

/* =====================================================
   STEP NAVIGATION
===================================================== */

function goToStep(step) {
    showSection(step);    // allow navigation freely
}

function nextStep(step) {
    const current = getCurrentStep();

    // Validation: required fields must be filled
    if (!isSectionFilled(current)) {
        alert("Please fill all required fields before continuing.");
        focusFirstEmpty(current);
        return;
    }

    // Mark current step as officially completed
    if (!completedSteps.includes(current)) {
        completedSteps.push(current);
    }

    saveFormData();
    showSection(step);
}

/* =====================================================
   GET CURRENT VISIBLE SECTION
===================================================== */

function getCurrentStep() {
    return STEPS.find(step => isVisible("section-" + step));
}

function isVisible(id) {
    const el = document.getElementById(id);
    return el && window.getComputedStyle(el).display !== "none";
}

/* =====================================================
   SHOW SECTION & UPDATE UI
===================================================== */

function showSection(step) {

    STEPS.forEach((s, i) => {
        document.getElementById("section-" + s).style.display = "none";
        document.getElementById("nav-" + s).classList.remove("active");

        const stepBox = document.getElementById("step-" + (i + 1));
        stepBox.classList.remove("active");
        stepBox.classList.remove("completed");
    });

    // Show selected
    document.getElementById("section-" + step).style.display = "block";
    document.getElementById("nav-" + step).classList.add("active");
    document.getElementById("step-" + (STEPS.indexOf(step) + 1)).classList.add("active");

    updateProgressUI();

    // Fade animation
    const sec = document.getElementById("section-" + step);
    sec.classList.add("fade-in");
    setTimeout(() => sec.classList.remove("fade-in"), 400);
}

/* =====================================================
   CHECK REQUIRED FIELDS OF A STEP
===================================================== */

function isSectionFilled(step) {
    const fields = REQUIRED[step];

    // If no required fields: treat as incomplete unless manually completed
    if (fields.length === 0) return false;

    for (const id of fields) {
        const el = document.getElementById(id);
        if (!el) return false;

        if (el.type === "file") {
            if (!el.files || el.files.length === 0) return false;
        } else {
            if (el.value.trim() === "") return false;
        }
    }
    return true;
}

function focusFirstEmpty(step) {
    const fields = REQUIRED[step];

    for (const id of fields) {
        const el = document.getElementById(id);
        if (el.type === "file") {
            if (!el.files || el.files.length === 0) {
                el.focus();
                return;
            }
        } else {
            if (el.value.trim() === "") {
                el.focus();
                return;
            }
        }
    }
}

/* =====================================================
   PROGRESS BAR + TICK UPDATE (ONLY COMPLETED STEPS)
===================================================== */

function updateProgressUI() {
    let progress = 0;

    STEPS.forEach((step, i) => {
        const stepBox = document.getElementById("step-" + (i + 1));

        if (completedSteps.includes(step)) {
            stepBox.classList.add("completed");
            progress++;
        }
    });

    // max steps = only the first 3 (kyc, docs, verify)
    const maxSteps = STEPS.length - 1;
    const percent = (progress / maxSteps) * 100;
    document.getElementById("progress-line").style.width = percent + "%";
}

/* =====================================================
   AUTOSAVE (session-based)
===================================================== */

function saveFormData() {
    const data = {
    firstName: document.getElementById("firstName")?.value || "",
    middleName: document.getElementById("middleName")?.value || "",
    lastName: document.getElementById("lastName")?.value || "",
    fatherName: document.getElementById("fatherName")?.value || "",
    dob: document.getElementById("dob")?.value || "",
    age: document.getElementById("age")?.value || "",
    gender: document.getElementById("gender")?.value || "",
    mobile: document.getElementById("mobile")?.value || "",
    email: document.getElementById("email")?.value || "",
    address: document.getElementById("address")?.value || ""
    };
    sessionStorage.setItem("kycData", JSON.stringify(data));
}

function loadFormData() {
    const saved = JSON.parse(sessionStorage.getItem("kycData") || "{}");
    document.getElementById("firstName").value = saved.firstName || "";
    document.getElementById("middleName").value = saved.middleName || "";
    document.getElementById("lastName").value = saved.lastName || "";
    document.getElementById("fatherName").value = saved.fatherName || "";
    document.getElementById("age").value = saved.age || "";
    document.getElementById("gender").value = saved.gender || "";
    document.getElementById("dob").value = saved.dob || "";
    document.getElementById("mobile").value = saved.mobile || "";
    document.getElementById("email").value = saved.email || "";
    document.getElementById("address").value = saved.address || "";
}

/* =====================================================
   LIVE LISTENERS FOR UI REFRESH
===================================================== */


function attachLiveListeners() {
    const allInputs = document.querySelectorAll("input, textarea, select");

    allInputs.forEach(input => {
        input.addEventListener("input", () => saveFormData());
        input.addEventListener("change", () => saveFormData());
    });

    // 🔹 AUTO AGE CALCULATOR
    const dobInput = document.getElementById("dob");
    dobInput.addEventListener("change", calculateAge);
}


function calculateAge() {
    const dob = document.getElementById("dob").value;
    const ageField = document.getElementById("age");

    if (!dob) {
        ageField.value = "";
        return;
    }

    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    // If birthday not passed this year → subtract age by 1
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    ageField.value = age;
    saveFormData();
}

function previewImage(input, targetId) {
    const file = input.files[0];
    const preview = document.getElementById(targetId);

    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            preview.src = reader.result;

            // store globally for final summary
            if (targetId === "addressPreview") window.preview_address = reader.result;
            if (targetId === "identityPreview") window.preview_identity = reader.result;
            if (targetId === "passportPreview") window.preview_passport = reader.result;
            if (targetId === "signPreview") window.preview_signature = reader.result;
        };
        reader.readAsDataURL(file);
    }
}



function handlePassportUpload(input) {
    previewImage(input, "passportPreview");

    // Start camera AFTER passport photo is uploaded
    startLiveCamera();

    document.getElementById("liveCam").style.display = "block";
    document.getElementById("captureBtn").style.display = "block";
}

let liveStream; // global stream holder

function startLiveCamera() {
    const video = document.getElementById("liveCam");

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            liveStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error("Camera access denied / not available.", err);
        });
}

function captureLivePhoto() {
    const video = document.getElementById("liveCam");
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const capturedImage = canvas.toDataURL("image/png");

    // Show captured photo
    const livePreview = document.getElementById("livePreview");
    livePreview.src = capturedImage;
    livePreview.style.display = "block";

    // Hide the video after capturing
    video.style.display = "none";

    // Stop camera after capture
    stopCamera();
}
function stopCamera() {
    if (liveStream) {
        liveStream.getTracks().forEach(track => track.stop());
    }
}

/* =====================================================
   ENABLE / DISABLE UPLOAD BUTTONS BASED ON SELECT TYPE
===================================================== */

document.getElementById("addressProofType").addEventListener("change", function () {
    const upload = document.getElementById("addressFile");
    upload.disabled = (this.value === "");
});

document.getElementById("identityProofType").addEventListener("change", function () {
    const upload = document.getElementById("aadhaarFile");
    upload.disabled = (this.value === "");
});

/* =====================================================
   OTP SELECTION LOGIC
===================================================== */

function showOtpFields() {
    const method = document.getElementById("otpMethod").value;

    document.getElementById("mobileInput").style.display = (method === "mobile") ? "block" : "none";
    document.getElementById("emailInput").style.display = (method === "email") ? "block" : "none";

    document.getElementById("sendOtpBtn").style.display = (method !== "") ? "block" : "none";
}

/* SEND OTP SIMULATION */
function sendOTP() {
    alert("OTP sent successfully!");

    document.getElementById("otpBox").style.display = "block";
    document.getElementById("captchaBox").style.display = "block";

    generateCaptcha();
}

/* CAPTCHA GENERATOR */
function generateCaptcha() {
    const text = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("captchaText").innerText = text;
    document.getElementById("captchaText").setAttribute("data-real", text);
}

/* VERIFY ENTERED DATA */
function completeVerify() {
    const otp = document.getElementById("otpValue").value.trim();
    const captcha = document.getElementById("captchaInput").value.trim();
    const realCaptcha = document.getElementById("captchaText").getAttribute("data-real");

    if (otp === "") {
        alert("Please enter OTP.");
        return;
    }

    if (captcha === "") {
        alert("Please enter captcha text.");
        return;
    }

    if (captcha !== realCaptcha) {
        alert("Incorrect captcha. Try again.");
        generateCaptcha();
        return;
    }

    // If passed → mark step complete
    completedSteps.push("verify");
    showSection("status");
    loadReviewPage();
}

/* =====================================================
   FINAL REVIEW PAGE — LOAD ALL DATA + IMAGES
===================================================== */
function loadReviewPage() {

    // Text fields from session storage
    const saved = JSON.parse(sessionStorage.getItem("kycData") || "{}");

    document.getElementById("rev-first").innerText = saved.firstName || "";
    document.getElementById("rev-middle").innerText = saved.middleName || "";
    document.getElementById("rev-last").innerText = saved.lastName || "";

    document.getElementById("rev-father").innerText = saved.fatherName || "";
    document.getElementById("rev-dob").innerText = saved.dob || "";
    document.getElementById("rev-age").innerText = saved.age || "";
    document.getElementById("rev-gender").innerText = saved.gender || "";

    document.getElementById("rev-mobile").innerText = saved.mobile || "";
    document.getElementById("rev-email").innerText = saved.email || "";
    document.getElementById("rev-address").innerText = saved.address || "";

    // Load preview images stored globally
    document.getElementById("rev-addressProof").src =
        window.preview_address || "";

    document.getElementById("rev-identityProof").src =
        window.preview_identity || "";

    document.getElementById("rev-passport").src =
        window.preview_passport || "";

    document.getElementById("rev-sign").src =
        window.preview_signature || "";
}

/* =====================================================
   FINAL SUBMISSION — SHOW MESSAGE + REDIRECT
===================================================== */
function finishKYC() {

    // Show success message
    alert("KYC Completed Successfully! 🎉");

    // Redirect to home page
    window.location.href = "index.html";
}
