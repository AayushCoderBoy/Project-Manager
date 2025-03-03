document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) window.location.href = "login.html";
});

document.getElementById("send-otp").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    if (!email) {
        alert("Please enter your email.");
        return;
    }

    const response = await fetch("http://localhost:5000/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        document.getElementById("otp-section").style.display = "block";
    } else {
        alert(data.error);
    }
});

document.getElementById("verify-otp").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const otp = document.getElementById("otp").value;

    if (!otp) {
        alert("Please enter the OTP.");
        return;
    }

    const response = await fetch("http://localhost:5000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
    });

    const data = await response.json();
    if (response.ok) {
        alert(data.message);
        document.getElementById("password").disabled = false;
        document.querySelector("#signup-form button[type='submit']").disabled = false;
    } else {
        alert(data.error);
    }
});

document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) window.location.href = "login.html";
});
