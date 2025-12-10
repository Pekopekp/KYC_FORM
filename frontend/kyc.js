const STEPS = ["kyc", "docs", "verify", "status"];
let completedSteps = [];

const REQUIRED = {
    kyc: [
        "firstName", "middleName", "lastName", "fatherName",
        "dob", "age", "gender", "mobile", "email", "address"
    ],
    docs: ["aadhaarFile", "addressFile", "photoFile"],
    verify: ["signFile", "otpMethod"],
    status: []
};

window.addEventListener("DOMContentLoaded", () => {
    loadFormData();
    attachLiveListeners();
    showSection("kyc");
    
});

function goToStep(step) {
    showSection(step);
}

function nextStep(step) {
    const current = getCurrentStep();
    const missing = isSectionFilled(current);

    if (missing !== true) {
        const el = document.getElementById(missing);
        const label = document.querySelector(`label[for="${missing}"]`)?.innerText || missing;

        showToast(`⚠ Please fill: ${label}`);

        el.classList.add("input-error");
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => el.classList.remove("input-error"), 5000);
        el.focus();
        return;
    }

    if(current === "kyc"){
        let mobile = document.getElementById("mobile").value.replace(/\s/g,""); // remove spaces

        if(mobile.length !== 10){
            showToast("⚠ Enter valid 10-digit mobile number");
            let el = document.getElementById("mobile");
            el.classList.add("input-error");
            el.scrollIntoView({behavior:"smooth",block:"center"});
            setTimeout(()=> el.classList.remove("input-error"),5000);
            return;
        }
    }

    const email = document.getElementById("email").value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if(!emailPattern.test(email)){
        showToast("⚠ Enter a valid email address");
        let el = document.getElementById("email");
        el.classList.add("input-error");
        el.scrollIntoView({behavior:"smooth",block:"center"});
        setTimeout(()=> el.classList.remove("input-error"),2000);
        return;
    }

    if (!completedSteps.includes(current)) completedSteps.push(current);
    saveFormData();
    showSection(step);
}



function getCurrentStep() {
    return STEPS.find(step => isVisible("section-" + step));
}

function isVisible(id) {
    const el = document.getElementById(id);
    return el && window.getComputedStyle(el).display !== "none";
}

function showSection(step) {
    STEPS.forEach((s, i) => {
        document.getElementById("section-" + s).style.display = "none";
        document.getElementById("nav-" + s).classList.remove("active");
        const stepBox = document.getElementById("step-" + (i + 1));
        stepBox.classList.remove("active");
        stepBox.classList.remove("completed");
    });

    document.getElementById("section-" + step).style.display = "block";
    document.getElementById("nav-" + step).classList.add("active");
    document.getElementById("step-" + (STEPS.indexOf(step) + 1)).classList.add("active");

    updateProgressUI();

    const sec = document.getElementById("section-" + step);
    sec.classList.add("fade-in");
    setTimeout(() => sec.classList.remove("fade-in"), 400);
}

function isSectionFilled(step) {
    const fields = REQUIRED[step];

    for (const id of fields) {
        const el = document.getElementById(id);

        if (!el) return id;

        if (el.type === "file" && (!el.files || el.files.length === 0)) return id;
        if (el.type !== "file" && el.value.trim() === "") return id;
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

function updateProgressUI() {
    let progress = 0;

    STEPS.forEach((step, i) => {
        const stepBox = document.getElementById("step-" + (i + 1));
        if (completedSteps.includes(step)) {
            stepBox.classList.add("completed");
            progress++;
        }
    });

    const maxSteps = STEPS.length - 1;
    const percent = (progress / maxSteps) * 100;
    document.getElementById("progress-line").style.width = percent + "%";
}

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

function attachLiveListeners() {
    const allInputs = document.querySelectorAll("input, textarea, select");

    allInputs.forEach(input => {
        input.addEventListener("input", () => saveFormData());
        input.addEventListener("change", () => saveFormData());
    });

    document.getElementById("dob").addEventListener("change", calculateAge);

    document.getElementById("mobile").addEventListener("input", function(){
        let v = this.value.replace(/\D/g,"").substring(0,10);
        if(v.length > 5) v = v.substring(0,5) + " " + v.substring(5);
        this.value = v;
    });

    const otpMobileInput = document.getElementById("otpMobile");
    if (otpMobileInput) {
        otpMobileInput.addEventListener("input", function(){
            this.value = this.value.replace(/\D/g,"").substring(0,10);
        });
    }

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
    startLiveCamera();
    document.getElementById("liveCam").style.display = "block";
    document.getElementById("captureBtn").style.display = "block";
}

let liveStream;

function startLiveCamera() {
    const video = document.getElementById("liveCam");

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            liveStream = stream;
            video.srcObject = stream;
            video.play();
        })
        .catch(err => console.error("Camera access denied", err));
}

function captureLivePhoto() {
    const video = document.getElementById("liveCam");
    const canvas = document.createElement("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const capturedImage = canvas.toDataURL("image/png");
    const livePreview = document.getElementById("livePreview");
    livePreview.src = capturedImage;
    livePreview.style.display = "block";

    video.style.display = "none";
    stopCamera();
}

function stopCamera() {
    if (liveStream) liveStream.getTracks().forEach(track => track.stop());
}

document.getElementById("addressProofType").addEventListener("change", function () {
    document.getElementById("addressFile").disabled = (this.value === "");
});
document.getElementById("identityProofType").addEventListener("change", function () {
    document.getElementById("aadhaarFile").disabled = (this.value === "");
});

function showOtpFields() {
    const method = document.getElementById("otpMethod").value;
    document.getElementById("mobileInput").style.display = (method === "mobile") ? "block" : "none";
    document.getElementById("emailInput").style.display = (method === "email") ? "block" : "none";
    document.getElementById("sendOtpBtn").style.display = (method !== "") ? "block" : "none";
}

function sendOTP() {
    const method = document.getElementById("otpMethod").value;

    if (!method) {
        showToast("⚠ Please select a verification method");
        return;
    }

    if (method === "mobile") {
        let mobile = document.getElementById("otpMobile").value.replace(/\s/g, "");

        if (mobile.length !== 10) {
            showToast("⚠ Enter a valid 10-digit mobile number for verification");
            let el = document.getElementById("otpMobile");
            el.classList.add("input-error");
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el.classList.remove("input-error"), 2000);
            return;
        }
    }

    if (method === "email") {
        const email = document.getElementById("otpEmail").value.trim();
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            showToast("⚠ Enter a valid email address for verification");
            let el = document.getElementById("otpEmail");
            el.classList.add("input-error");
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => el.classList.remove("input-error"), 2000);
            return;
        }
    }

    showToast("✅ OTP sent successfully!");
    document.getElementById("otpBox").style.display = "block";
    document.getElementById("captchaBox").style.display = "block";
    generateCaptcha();
}


function generateCaptcha() {
    const text = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("captchaText").innerText = text;
    document.getElementById("captchaText").setAttribute("data-real", text);
}

function completeVerify() {
    const otp = document.getElementById("otpValue").value.trim();
    const captcha = document.getElementById("captchaInput").value.trim();
    const realCaptcha = document.getElementById("captchaText").getAttribute("data-real");

    if (otp === "") {
        alert("Please enter OTP."); return;
    }
    if (captcha === "") {
        alert("Please enter captcha text."); return;
    }
    if (captcha !== realCaptcha) {
        alert("Incorrect captcha. Try again.");
        generateCaptcha();
        return;
    }

    completedSteps.push("verify");
    showSection("status");
    loadReviewPage();
}

function loadReviewPage() {
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
    document.getElementById("rev-addressProof").src = window.preview_address || "";
    document.getElementById("rev-identityProof").src = window.preview_identity || "";
    document.getElementById("rev-passport").src = window.preview_passport || "";
    document.getElementById("rev-sign").src = window.preview_signature || "";
}

function finishKYC() {
    alert("KYC Completed Successfully! 🎉");
    window.location.href = "index.html";
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 5800);
}
