const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const jwt = require("jsonwebtoken");

// ✅ Middleware to Authenticate User
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token." });
    }
};

// ✅ Route to Add a New Task
router.post("/add", authenticateUser, async (req, res) => {
    try {
        const { title, description, deadline } = req.body;
        const user_id = req.user.userId; // Extract user ID from JWT

        console.log("User ID from JWT:", user_id); // Debugging

        if (!user_id) {
            return res.status(400).json({ message: "User ID is missing from the token." });
        }

        if (!title || !deadline) {
            return res.status(400).json({ message: "Task title and deadline are required." });
        }

        const newTask = await pool.query(
            "INSERT INTO tasks (user_id, title, description, deadline, completed) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [user_id, title, description, deadline, false]
        );

        res.status(201).json(newTask.rows[0]);
    } catch (err) {
        console.error("Error adding task:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ✅ Route to Fetch All Tasks for the Logged-in User
router.get("/", authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.userId;
        const result = await pool.query("SELECT * FROM tasks WHERE user_id = $1 ORDER BY deadline ASC", [user_id]);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching tasks:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ✅ Route to Fetch Pending and Completed Task Counts
router.get("/overview", authenticateUser, async (req, res) => {
    try {
        const user_id = req.user.userId;

        const pendingCount = await pool.query(
            "SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = false",
            [user_id]
        );

        const completedCount = await pool.query(
            "SELECT COUNT(*) FROM tasks WHERE user_id = $1 AND completed = true",
            [user_id]
        );

        res.json({
            pendingTasks: parseInt(pendingCount.rows[0].count),
            completedTasks: parseInt(completedCount.rows[0].count),
        });
    } catch (err) {
        console.error("Error fetching task overview:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ✅ Route to Mark a Task as Completed
router.put("/:id/complete", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        const updatedTask = await pool.query(
            "UPDATE tasks SET completed = true WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, user_id]
        );

        if (updatedTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found or unauthorized." });
        }

        res.json({ message: "Task marked as completed!", task: updatedTask.rows[0] });
    } catch (err) {
        console.error("Error completing task:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

// ✅ Route to Delete a Task
router.delete("/:id", authenticateUser, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.userId;

        const deletedTask = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *",
            [id, user_id]
        );

        if (deletedTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found or unauthorized." });
        }

        res.json({ message: "Task deleted successfully!", task: deletedTask.rows[0] });
    } catch (err) {
        console.error("Error deleting task:", err.message);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;
