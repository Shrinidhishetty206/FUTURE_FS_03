
const API_URL = "http://localhost:5000/api";

let allProducts = [];
let selectedGender = "All";

let cart = JSON.parse(localStorage.getItem("sriLakshmiCart")) || [];
let wishlist = JSON.parse(localStorage.getItem("sriLakshmiWishlist")) || [];

// HTML elements
const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortFilter = document.getElementById("sortFilter");

// Safe text display
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// LOAD PRODUCTS FROM MONGODB
async function loadProducts() {
    if (!productGrid) return;

    productGrid.innerHTML = "<p>Loading products...</p>";

    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load products");
        }

        allProducts = data.products || [];

        filterProducts();

    } catch (error) {
        console.error("Backend error:", error);

        productGrid.innerHTML = `
            <p>Products could not be loaded.
            Please check whether your backend is running.</p>
        `;
    }
}

// DISPLAY PRODUCTS
function displayProducts(products) {
    if (!productGrid) return;

    if (productCount) {
        productCount.textContent = `${products.length} products found`;
    }

    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-products">
                <h3>No products found</h3>
                <p>Try selecting another category.</p>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = products.map(product => {
        const id = escapeHTML(product._id);
        const isWishlisted = wishlist.includes(product._id);

        return `
            <div class="product-card">

                <div class="product-image">
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        onerror="this.src='https://placehold.co/400x500?text=Fashion'"
                    >

                    ${product.badge ? `
                        <span class="product-badge">
                            ${escapeHTML(product.badge)}
                        </span>
                    ` : ""}

                    <button
                        class="wishlist-btn ${isWishlisted ? "active" : ""}"
                        onclick="toggleWishlist('${id}')"
                    >
                        ${isWishlisted ? "♥" : "♡"}
                    </button>
                </div>

                <div class="product-info">

                    <p class="product-category">
                        ${escapeHTML(product.gender)} |
                        ${escapeHTML(product.category)}
                    </p>

                    <h3>${escapeHTML(product.name)}</h3>

                    <p class="product-rating">
                        ★ ${Number(product.rating || 0).toFixed(1)}
                    </p>

                    <div class="product-price">
                        <strong>
                            ₹${Number(product.price).toLocaleString("en-IN")}
                        </strong>

                        ${Number(product.originalPrice) > Number(product.price) ? `
                            <del>
                                ₹${Number(product.originalPrice).toLocaleString("en-IN")}
                            </del>
                        ` : ""}
                    </div>

                    <button
                        class="add-cart-btn"
                        onclick="addToCart('${id}')"
                        ${product.stock <= 0 ? "disabled" : ""}
                    >
                        ${product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>

                </div>
            </div>
        `;
    }).join("");
}

// FILTER PRODUCTS
function filterProducts() {
    let filtered = [...allProducts];

    // GENDER FILTER - MEN, WOMEN, KIDS
    if (selectedGender.toLowerCase() !== "all") {
        filtered = filtered.filter(product =>
            String(product.gender || "").trim().toLowerCase() ===
            selectedGender.trim().toLowerCase()
        );
    }

    // SEARCH FILTER
    const search = searchInput?.value.trim().toLowerCase();

    if (search) {
        filtered = filtered.filter(product =>
            `${product.name} ${product.category} ${product.gender}`
                .toLowerCase()
                .includes(search)
        );
    }

    // CATEGORY FILTER
    const category = categoryFilter?.value;

    if (category && !["all", "All", ""].includes(category)) {
        filtered = filtered.filter(product =>
            product.category.toLowerCase() === category.toLowerCase()
        );
    }

    // PRICE FILTER
    const price = priceFilter?.value;

    if (price === "under500") {
        filtered = filtered.filter(p => p.price < 500);
    } else if (price === "500-1000") {
        filtered = filtered.filter(p => p.price >= 500 && p.price <= 1000);
    } else if (price === "1000-2000") {
        filtered = filtered.filter(p => p.price > 1000 && p.price <= 2000);
    } else if (price === "above2000") {
        filtered = filtered.filter(p => p.price > 2000);
    }

    // SORT FILTER
    const sort = sortFilter?.value;

    if (sort === "low-high") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "high-low") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "name") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    displayProducts(filtered);
}

// GENDER BUTTONS
document.querySelectorAll(".gender-btn").forEach(button => {
    button.addEventListener("click", () => {
        selectedGender = button.dataset.gender || "All";

        document.querySelectorAll(".gender-btn").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        filterProducts();
    });
});

// CATEGORY CARDS
document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
        selectedGender = card.dataset.gender || "All";
        filterProducts();

        document.getElementById("products")?.scrollIntoView({
            behavior: "smooth"
        });
    });
});

// FILTER EVENTS
searchInput?.addEventListener("input", filterProducts);
categoryFilter?.addEventListener("change", filterProducts);
priceFilter?.addEventListener("change", filterProducts);
sortFilter?.addEventListener("change", filterProducts);

// ADD TO CART
function addToCart(productId) {
    const product = allProducts.find(p => p._id === productId);

    if (!product || product.stock <= 0) {
        showToast("Product is unavailable");
        return;
    }

    const existing = cart.find(item => item._id === productId);

    if (existing) {
        if (existing.quantity >= product.stock) {
            showToast("Maximum stock reached");
            return;
        }

        existing.quantity++;
    } else {
        cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    showToast("Added to cart successfully!");
}

// SAVE CART
function saveCart() {
    localStorage.setItem("sriLakshmiCart", JSON.stringify(cart));
    updateCartCount();
    displayCart();
}

// CART COUNT
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const element = document.getElementById("cartCount");

    if (element) element.textContent = count;
}

// DISPLAY CART
function displayCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">

                <div>
                    <h4>${escapeHTML(item.name)}</h4>
                    <p>₹${Number(item.price).toLocaleString("en-IN")}</p>

                    <button onclick="changeQuantity('${escapeHTML(item._id)}', -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity('${escapeHTML(item._id)}', 1)">+</button>

                    <button onclick="removeFromCart('${escapeHTML(item._id)}')">
                        Remove
                    </button>
                </div>
            </div>
        `).join("");
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    if (cartTotal) {
        cartTotal.textContent = `₹${total.toLocaleString("en-IN")}`;
    }
}

// CHANGE QUANTITY
function changeQuantity(productId, change) {
    const item = cart.find(p => p._id === productId);
    const product = allProducts.find(p => p._id === productId);

    if (!item) return;

    item.quantity += change;

    if (product && item.quantity > product.stock) {
        item.quantity = product.stock;
        showToast("Maximum stock reached");
    }

    if (item.quantity <= 0) {
        cart = cart.filter(p => p._id !== productId);
    }

    saveCart();
}

// REMOVE CART ITEM
function removeFromCart(productId) {
    cart = cart.filter(p => p._id !== productId);
    saveCart();
}

// WISHLIST
function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
        showToast("Removed from wishlist");
    } else {
        wishlist.push(productId);
        showToast("Added to wishlist");
    }

    localStorage.setItem("sriLakshmiWishlist", JSON.stringify(wishlist));

    updateWishlistCount();
    filterProducts();
}

function updateWishlistCount() {
    const element = document.getElementById("wishlistCount");

    if (element) element.textContent = wishlist.length;
}

// OPEN AND CLOSE CART
function openCart() {
    document.getElementById("cartDrawer")?.classList.add("active");
    document.getElementById("cartOverlay")?.classList.add("active");
    displayCart();
}

function closeCart() {
    document.getElementById("cartDrawer")?.classList.remove("active");
    document.getElementById("cartOverlay")?.classList.remove("active");
}

document.getElementById("openCartBtn")?.addEventListener("click", openCart);
document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
document.getElementById("cartOverlay")?.addEventListener("click", closeCart);

// TOAST MESSAGE
function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// NEWSLETTER
document.getElementById("newsletterForm")?.addEventListener("submit", async event => {
    event.preventDefault();

    const emailInput = document.getElementById("newsletterEmail");
    const message = document.getElementById("newsletterMessage");

    const email = emailInput?.value.trim();

    if (!email) return;

    try {
        const response = await fetch(`${API_URL}/newsletter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Subscription failed");
        }

        if (message) message.textContent = "Thank you for subscribing!";
        emailInput.value = "";

    } catch (error) {
        if (message) message.textContent = error.message;
    }
});

// CHECKOUT
document.getElementById("checkoutBtn")?.addEventListener("click", () => {
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }

    showToast("Checkout will be added next.");
});

// MOBILE MENU
document.getElementById("mobileMenuBtn")?.addEventListener("click", () => {
    document.getElementById("navLinks")?.classList.toggle("active");
});

// CLEAR SEARCH
document.getElementById("clearSearch")?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    filterProducts();
});

// RESET FILTERS
document.getElementById("resetFilters")?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "all";
    if (priceFilter) priceFilter.value = "all";
    if (sortFilter) sortFilter.value = "";

    selectedGender = "All";

    document.querySelectorAll(".gender-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.gender === "All");
    });

    filterProducts();
});

// SEARCH FOCUS
document.getElementById("searchFocusBtn")?.addEventListener("click", () => {
    searchInput?.focus();
});

// INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    updateCartCount();
    updateWishlistCount();
    displayCart();
});
