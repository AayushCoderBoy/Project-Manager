require("dotenv").config();
const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const cors = require("cors");
const pool = require("./config/db"); // PostgreSQL connection
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const authRoutes = require('./routes/authRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// ✅ Register Task Routes
app.use("/tasks", taskRoutes); 

app.use("/api/projects", projectRoutes); // ✅ Register project routes

app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);


// ✅ Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// ✅ Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Serve Landing Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ✅ User Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email exists
        const existingUser = await pool.query("SELECT * FROM accounts WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert User
        const newUser = await pool.query(
            "INSERT INTO accounts (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );

        res.status(201).json({ message: "Signup successful", user: newUser.rows[0] });
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ User Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query("SELECT * FROM accounts WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare Passwords
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Middleware to Verify JWT Token
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: "Invalid token" });
    }
};

// ✅ Protected Dashboard Route
app.get("/dashboard", authenticateToken, async (req, res) => {
    try {
        const user = await pool.query("SELECT name, email FROM accounts WHERE id = $1", [req.user.userId]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.rows[0]);
    } catch (error) {
        console.error("Dashboard Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Start Server
app.listen(PORT,"0.0.0.0", () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
