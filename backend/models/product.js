
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        gender: {
            type: String,
            enum: ["Women", "Men", "Kids"],
            required: true
        },
        category: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        originalPrice: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
            required: true
        },
        stock: {
            type: Number,
            default: 10,
            min: 0
        },
        rating: {
            type: Number,
            default: 4.5,
            min: 0,
            max: 5
        },
        badge: {
            type: String,
            default: ""
        },
        isFeatured: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
