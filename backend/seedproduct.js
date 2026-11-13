
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("./models/product");

dotenv.config();

const products = [
    {
        name: "Floral Printed Kurti",
        gender: "Women",
        category: "Ethnic Wear",
        price: 599,
        originalPrice: 999,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e3?w=600",
        description: "Comfortable floral printed kurti for everyday style.",
        stock: 20,
        badge: "Popular",
        isFeatured: true
    },
    {
        name: "Elegant Saree",
        gender: "Women",
        category: "Sarees",
        price: 1499,
        originalPrice: 2199,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        description: "Traditional saree for celebrations and special occasions.",
        stock: 15,
        badge: "Trending"
    },
    {
        name: "Casual Women's Top",
        gender: "Women",
        category: "Western Wear",
        price: 449,
        originalPrice: 699,
        image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600",
        description: "Stylish casual top for everyday outfits.",
        stock: 25
    },
    {
        name: "Men's Casual Shirt",
        gender: "Men",
        category: "Shirts",
        price: 699,
        originalPrice: 1099,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        description: "Smart casual shirt for everyday wear.",
        stock: 20,
        badge: "Best Seller"
    },
    {
        name: "Men's Denim Jeans",
        gender: "Men",
        category: "Jeans",
        price: 999,
        originalPrice: 1499,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
        description: "Classic denim jeans with a comfortable fit.",
        stock: 18
    },
    {
        name: "Men's T-Shirt",
        gender: "Men",
        category: "T-Shirts",
        price: 399,
        originalPrice: 599,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        description: "Everyday cotton-style casual T-shirt.",
        stock: 30
    },
    {
        name: "Kids Party Dress",
        gender: "Kids",
        category: "Dresses",
        price: 799,
        originalPrice: 1199,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600",
        description: "Cute party outfit for kids.",
        stock: 12,
        badge: "New"
    },
    {
        name: "Kids Casual T-Shirt",
        gender: "Kids",
        category: "T-Shirts",
        price: 299,
        originalPrice: 449,
        image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600",
        description: "Comfortable casual T-shirt for kids.",
        stock: 25
    },
    {
        name: "Kids Traditional Outfit",
        gender: "Kids",
        category: "Ethnic Wear",
        price: 899,
        originalPrice: 1299,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600",
        description: "Traditional outfit for family celebrations.",
        stock: 10
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Product.deleteMany({});
        await Product.insertMany(products);

        console.log("Sample products added successfully!");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error.message);
        await mongoose.disconnect();
        process.exit(1);
    }
}

seedProducts();
