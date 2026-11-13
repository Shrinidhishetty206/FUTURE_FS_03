
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Product = require("../models/product");
const Order = require("../models/order");

// Create a customer order
router.post("/", async (req, res) => {
    try {
        const { customer, items } = req.body;

        if (
            !customer?.name ||
            !customer?.email ||
            !customer?.phone ||
            !customer?.address
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all customer details"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty"
            });
        }

        let totalAmount = 0;
        const verifiedItems = [];

        for (const item of items) {
            if (
                !mongoose.isValidObjectId(item.productId) ||
                !Number.isInteger(Number(item.quantity)) ||
                Number(item.quantity) < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid product or quantity"
                });
            }

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "A product in your cart was not found"
                });
            }

            const quantity = Number(item.quantity);

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Not enough stock for ${product.name}`
                });
            }

            totalAmount += product.price * quantity;

            verifiedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity
            });
        }

        const order = await Order.create({
            customer,
            items: verifiedItems,
            totalAmount
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all orders (for development/admin testing)
router.get("/", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
