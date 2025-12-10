📝 Project Overview

This project is a demo of Digital KYC Web Portal.
It allows customers to update their KYC details through a 4-step guided process, including:

    1.Personal Information
    2.Document Upload
    3.Identity Verification (Signature + OTP)
    4.Final Review & Submission
The project includes real-time form validation, image previews, camera capture, auto-age calculation, and a final summary before submission.
After successfully completing KYC, the user is redirected back to index.html.

📂 Project Structure

    /frontend
    │
    ├── index.html            → Landing page with “Let’s Begin” button
    ├── kyc.html              → 4-step KYC form
    ├── kyc.js                → All logic for steps, validation, previews, OTP, camera
    ├── s1.css                → Styling for entire KYC form UI
    ├── style.css             → Styling for homepage (index.html)
    ├── logo.png              → HDFC logo used in UI
    └── README.md             → Project documentation

🧭 Features

    ✅ 1. Personal Information (Step 1)

        ->First / Middle / Last name
        ->Father’s name
        ->Date of Birth → Auto Age Calculation
        ->Gender dropdown
        ->Mobile Number
        ->Email Address
        ->Residential Address
        ->Local storage of data using sessionStorage
        ->Mandatory field validation

    ✅ 2. Document Upload (Step 2)
        
        ->For each document:
            Select document type
            Upload image file
            Real-time image preview
            Validity score UI
            Disabled → enabled upload field based on dropdown selection
        ->Documents supported:
            Address Proof
            Identity Proof
            Passport Photo
        ->Includes:
            Live Camera Preview + Capture for face validation
            Face capture saved and shown in preview

    ✅ 3. Identity Verification (Step 3)

        Includes two major parts:
        🖊️ Signature Upload
            ->Upload signature image
            ->Preview rendered live
            ->Stored for final review
        🔐 OTP Verification System
            ->Choose message delivery method:
                ->Mobile OTP
                ->Email OTP
            ->Input field appears dynamically
            ->“Send OTP” triggers:
                ->OTP sent message
                ->OTP input box
                ->CAPTCHA-style text check
            ->User must pass:
                ->OTP
                ->CAPTCHA
            ->Only then can they continue.
    
    ✅ 4. Final Review (Step 4)
    
        Before final submission, the user can cross-check:

        Personal Info Summary
            ->All fields from Step 1 loaded from session data
        Document Preview Summary
            ->Address Proof
            ->Identity Proof
            ->Passport Photo
            ->Live Capture (if needed)
        Signature Preview
            ->The uploaded signature is shown
        
        After pressing Submit KYC, the user sees a success message and is redirected to:
        ➡️ index.html
    
🏗️ Technologies Used

    Frontend:
        ->HTML5 (Responsive Layout)
    CSS3
        ->Custom HDFC-themed design
        ->Stepper UI
        ->Upload blocks
    JavaScript
        ->Multi-step form control
        ->Progress bar logic
        ->File preview
        ->OTP + Captcha
        ->Webcam access
        ->Session-based autosave

⚙️ Browser Features Used

    ->FileReader() for image preview
    ->navigator.mediaDevices.getUserMedia() for camera
    ->sessionStorage for storing form data
    ->Dynamic DOM manipulation

▶️ How to Run

There is no backend required.
Just open the project in a browser:

    1. Download / clone the folder
    2. Open index.html
    3. Click “Let’s Begin”
    4. Complete the KYC steps
    5. Submit at Step-4

    The entire project works offline except the camera access.

📸 Screens & Flow

    1. Homepage (index.html)
        -> Shows KYC eligibility checklist
        -> “Let’s Begin” button
    2. KYC 4-Step Flow (kyc.html):
        Step 1 → Personal Info
        Step 2 → Document Upload
        Step 3 → Signature + OTP
        Step 4 → Final Review + Submit
    3. After Submission
        -> Success popup
        -> Redirect back to homepage

🔐 Validation Rules

    -> Every step requires mandatory field completion
    -> Files cannot be uploaded unless document type is selected
    -> OTP + CAPTCHA must match
    -> User can navigate between steps but progress only updates after saving

🏁 Final Output

    A smooth and professional Digital KYC system, ready for:
        -> Academic project submission
        -> HDFC Jilingni program
        -> Resume portfolio
        -> Future backend integration (Node.js, Firebase, etc.)