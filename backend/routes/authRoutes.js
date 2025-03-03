const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { createUser, getUserByEmail } = require("../models/User");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "a32ff05353ce31f760c6ca229acf2eb3756e93bc037fb29e3b56413c5a083a1f"; // Store in .env
const otpStorage = new Map(); // Temporary storage for OTPs

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Store in .env
        pass: process.env.EMAIL_PASS   // Store in .env
    }
});

// **Send OTP to Email**
router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStorage.set(email, otp);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent to email" });

    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// **Verify OTP**
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    if (otpStorage.get(email) === otp) {
        otpStorage.delete(email);
        res.json({ success: true, message: "OTP verified" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});

// **Signup Route**
router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = await createUser(name, email, password);
        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// **Login Route**
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
