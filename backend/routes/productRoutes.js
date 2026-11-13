
const express = require("express");
const router = express.Router();
const Product = require("../models/product");

// GET all products with optional filters
router.get("/", async (req, res) => {
    try {
        const {
            gender,
            category,
            search,
            minPrice,
            maxPrice,
            sort
        } = req.query;

        const filter = {};

        if (gender && gender !== "All") {
            filter.gender = new RegExp(`^${gender}$`, "i");
        }

        if (category && category !== "All") {
            filter.category = new RegExp(`^${category}$`, "i");
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let query = Product.find(filter);

        if (sort === "price-low") query = query.sort({ price: 1 });
        else if (sort === "price-high") query = query.sort({ price: -1 });
        else if (sort === "newest") query = query.sort({ createdAt: -1 });
        else if (sort === "rating") query = query.sort({ rating: -1 });

        const products = await query;

        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET one product by ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({ success: true, product });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }
});

module.exports = router;
