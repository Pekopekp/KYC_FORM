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
    verify: [],  // add fields if needed
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
        reader.onload = () => preview.src = reader.result;
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
