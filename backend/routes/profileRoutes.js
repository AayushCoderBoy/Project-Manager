const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db'); // PostgreSQL connection

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Store images in the uploads folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage });

// API route to handle profile image upload
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const imageUrl = `/uploads/${req.file.filename}`; // URL of the uploaded file
    const userId = req.user.id; // Get user ID from session or token

    try {
        await pool.query('UPDATE accounts SET profile_image_url = $1 WHERE id = $2', [imageUrl, userId]);
        res.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Database update error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
