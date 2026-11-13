
const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");

router.post("/", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const existing = await Newsletter.findOne({ email });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "This email is already subscribed"
            });
        }

        await Newsletter.create({ email });

        res.status(201).json({
            success: true,
            message: "Successfully subscribed!"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
