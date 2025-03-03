const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // PostgreSQL connection

// ✅ GET all projects
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM projects ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching projects:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// ✅ POST - Add a new project
router.post("/", async (req, res) => {
    try {
        console.log("Received Request:", req.body); // Debugging

        const {
            title, description, start_date, deadline, assigned_members,
            project_owner, status, priority, completion_percentage, budget, attachments
        } = req.body;

        if (!title) return res.status(400).json({ error: "Title is required" });

        // Ensure completion_percentage is between 0 and 100
        const validCompletion = Math.min(100, Math.max(0, parseInt(completion_percentage) || 0));

        const result = await pool.query(
            `INSERT INTO projects 
            (title, description, start_date, deadline, assigned_members, project_owner, 
             status, priority, completion_percentage, budget, attachments) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [title, description, start_date, deadline, assigned_members, project_owner,
             status, priority, validCompletion, budget, attachments]
        );

        console.log("Project Added:", result.rows[0]); // Debugging
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error adding project:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// ✅ PUT - Update a project
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, start_date, deadline, assigned_members,
            project_owner, status, priority, completion_percentage, budget, attachments
        } = req.body;

        if (!title) return res.status(400).json({ error: "Title is required" });

        // Ensure completion_percentage is between 0 and 100
        const validCompletion = Math.min(100, Math.max(0, parseInt(completion_percentage) || 0));

        const result = await pool.query(
            `UPDATE projects SET 
            title = $1, description = $2, start_date = $3, deadline = $4, assigned_members = $5, 
            project_owner = $6, status = $7, priority = $8, completion_percentage = $9, 
            budget = $10, attachments = $11 WHERE id = $12 RETURNING *`,
            [title, description, start_date, deadline, assigned_members, project_owner,
             status, priority, validCompletion, budget, attachments, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        console.log("Project Updated:", result.rows[0]); // Debugging
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating project:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// ✅ DELETE - Remove a project
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM projects WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        console.log("Project Deleted:", id); // Debugging
        res.json({ message: "Project deleted successfully" });
    } catch (err) {
        console.error("Error deleting project:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

module.exports = router;
