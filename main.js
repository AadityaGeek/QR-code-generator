// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'dark';
}

// Theme toggle event listener
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Function to clear all input fields
function clearInputs() {
    document.querySelectorAll(".form-section input, .form-section textarea").forEach(field => {
        field.value = "";
    });
}

// Toggle form sections based on QR type selection
document.querySelectorAll('input[name="qrType"]').forEach(elem => {
    elem.addEventListener("change", function(e) {
        const type = e.target.value;
        document.getElementById("form-text").classList.toggle("hidden", type !== "text");
        document.getElementById("form-url").classList.toggle("hidden", type !== "url");
        document.getElementById("form-contact").classList.toggle("hidden", type !== "contact");
        document.getElementById("form-upi").classList.toggle("hidden", type !== "upi");
        
        // Clear warning message, QR code, and inputs
        document.getElementById("warningMessage").style.display = "none";
        document.getElementById("qrcode").innerHTML = "";
        document.getElementById("downloadBtn").classList.add("hidden");
        clearInputs();
    });
});

// Handle Enter key navigation
function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const fields = Array.from(document.querySelectorAll(".form-section:not(.hidden) .input-group input, .form-section:not(.hidden) .input-group textarea"))
            .filter(el => el.offsetParent !== null);
        const index = fields.indexOf(event.target);
        
        if (index > -1 && index < fields.length - 1) {
            fields[index + 1].focus();
        } else {
            document.getElementById("generateBtn").click();
        }
    }
}

// Attach keydown event to input fields
document.querySelectorAll(".input-group input, .input-group textarea").forEach(field => {
    field.addEventListener("keydown", handleEnterKey);
});

// Generate QR Code functionality
document.getElementById("generateBtn").addEventListener("click", function() {
    const warningMessage = document.getElementById("warningMessage");
    const qrType = document.querySelector('input[name="qrType"]:checked').value;
    const qrCodeContainer = document.getElementById("qrcode");
    let qrData = "";
    
    // Clear previous warning
    warningMessage.style.display = "none";
    warningMessage.innerText = "";

    // Validate and generate QR data based on type
    switch(qrType) {
        case "text":
            qrData = document.getElementById("textInput").value.trim();
            if (!qrData) {
                warningMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter the text.';
                warningMessage.style.display = "block";
                return;
            }
            break;

        case "url":
            qrData = document.getElementById("urlInput").value.trim();
            if (!qrData) {
                warningMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter the URL.';
                warningMessage.style.display = "block";
                return;
            }
            break;

        case "contact":
            const name = document.getElementById("nameInput").value.trim();
            const phone = document.getElementById("phoneInput").value.trim();
            const email = document.getElementById("emailInput").value.trim();

            if (!name || !phone) {
                warningMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please fill in the Name and Phone fields.';
                warningMessage.style.display = "block";
                return;
            }

            // Build MECARD format
            qrData = `MECARD:N:${name};TEL:${phone};${email ? `EMAIL:${email};` : ''};`;
            break;

        case "upi":
            const upiId = document.getElementById("upiInput").value.trim();
            const amount = document.getElementById("amountInput").value.trim();
            const note = document.getElementById("upiNoteInput").value.trim();

            if (!upiId) {
                warningMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter UPI ID.';
                warningMessage.style.display = "block";
                return;
            }

            // Generate UPI payment URL
            qrData = `upi://pay?pa=${encodeURIComponent(upiId)}${amount ? `&am=${amount}` : ''}${note ? `&tn=${encodeURIComponent(note)}` : ''}`;
            break;
    }

    // Clear previous QR code and show container
    qrCodeContainer.innerHTML = "";
    
    new QRCode(qrCodeContainer, {
        text: qrData,
        width: 200,
        height: 200,
        colorDark: "#000000",  // Always black for maximum contrast
        colorLight: "#ffffff", // Always white background
    });

    // Show the container after generating QR code
    qrCodeContainer.classList.add('show');
    document.getElementById("downloadBtn").classList.remove("hidden");
});

// Add download functionality
document.getElementById("downloadBtn").addEventListener("click", function() {
    const qrCanvas = document.querySelector("#qrcode canvas");
    if (qrCanvas) {
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = qrCanvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();