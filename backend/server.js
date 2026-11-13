
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect database
connectDB();

// API routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/newsletter", require("./routes/newsletterRoutes"));

// Home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Sri Lakshmi Fashion API"
    });
});

// Not found route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
