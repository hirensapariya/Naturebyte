// ==========================================================================
// NATUREBYTE HOMEPAGE LOGIC
// ==========================================================================

// Immediate Theme initialization (prevents flash of incorrect theme)
(function() {
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme');
    } catch (e) {
        console.warn('LocalStorage is blocked:', e.message);
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
})();

// Global state
let cartCount = 0;
let wishlistCount = 0;
let currentHeroSlide = 0;
let heroSliderTimer = null;
let currentTestimonialSlide = 0;

// 12 Products Data Array
const products = [
    {
        id: 1,
        name: "NatureByte Mango Delight",
        category: "Mango",
        desc: "Made with premium Alphonso mangoes. Rich, pulpy, and packed with Vitamin A & C.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.9,
        reviews: 184,
        badge: "Best Seller",
        image: "assets/single.png"
    },
    {
        id: 2,
        name: "NatureByte Tangy Orange",
        category: "Orange",
        desc: "Tangy and sweet Nagpur oranges. A refreshing boost of daily Vitamin C.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.8,
        reviews: 142,
        badge: "Popular",
        image: "assets/single.png"
    },
    {
        id: 3,
        name: "NatureByte Tropical Pineapple",
        category: "Pineapple",
        desc: "Sweet and tart pineapple extract. Promotes digestion and boosts energy levels.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.7,
        reviews: 95,
        badge: "New",
        image: "assets/single.png"
    },
    {
        id: 4,
        name: "NatureByte Refreshing Lemon",
        category: "Lemon",
        desc: "Classic nimbu paani experience. Highly refreshing and rich in active electrolytes.",
        mrp: 349,
        price: 249,
        discount: 28,
        rating: 4.9,
        reviews: 210,
        badge: "Best Seller",
        image: "assets/single.png"
    },
    {
        id: 5,
        name: "NatureByte Strawberry Blast",
        category: "Strawberry",
        desc: "Juicy handpicked strawberries. Loaded with antioxidants and natural minerals.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.8,
        reviews: 118,
        badge: "Popular",
        image: "assets/single.png"
    },
    {
        id: 6,
        name: "NatureByte Mixed Fruit Punch",
        category: "Mixed Fruit",
        desc: "A nutrient-dense blend of 8 summer fruits. Perfect daily nutrition for families.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.9,
        reviews: 320,
        badge: "Best Seller",
        image: "assets/single.png"
    },
    {
        id: 7,
        name: "NatureByte Sweet Guava",
        category: "Guava",
        desc: "Authentic pink guava taste with a pinch of salt. Extremely rich in dietary fibers.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.6,
        reviews: 88,
        badge: "New",
        image: "assets/single.png"
    },
    {
        id: 8,
        name: "NatureByte Royal Lychee",
        category: "Lychee",
        desc: "Sweet and aromatic Muzaffarpur lychees. Deeply hydrating and rejuvenating.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.7,
        reviews: 104,
        badge: "Popular",
        image: "assets/single.png"
    },
    {
        id: 9,
        name: "NatureByte Watermelon Cooler",
        category: "Watermelon",
        desc: "Summer absolute favorite. Made with organic watermelons for rapid hydration.",
        mrp: 349,
        price: 249,
        discount: 28,
        rating: 4.8,
        reviews: 125,
        badge: "New",
        image: "assets/single.png"
    },
    {
        id: 10,
        name: "NatureByte Chatpata Kala Khatta",
        category: "Kala Khatta",
        desc: "Tangy, sweet and spicy Jamun flavor. Classic Indian street-style taste.",
        mrp: 349,
        price: 249,
        discount: 28,
        rating: 4.9,
        reviews: 196,
        badge: "Best Seller",
        image: "assets/single.png"
    },
    {
        id: 11,
        name: "NatureByte Crispy Green Apple",
        category: "Green Apple",
        desc: "Fresh, tart green apple blend. Loaded with active enzymes for gut wellness.",
        mrp: 399,
        price: 299,
        discount: 25,
        rating: 4.5,
        reviews: 64,
        badge: "New",
        image: "assets/single.png"
    },
    {
        id: 12,
        name: "NatureByte Zesty Mosambi",
        category: "Mosambi",
        desc: "Fresh sweet lime flavour. Ideal energy booster post workout or run.",
        mrp: 349,
        price: 249,
        discount: 28,
        rating: 4.8,
        reviews: 150,
        badge: "Popular",
        image: "assets/single.png"
    }
];

// Map containing quantities selected by users per product id
const selectedQuantities = {};
products.forEach(p => {
    selectedQuantities[p.id] = 1;
});

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    // Populate products grid
    renderProducts("all");

    // Setup Sticky Header scroll listener
    window.addEventListener("scroll", handleHeaderScroll);

    // Setup Mobile Navigation toggle
    setupMobileNav();

    // Setup Search Overlay events
    setupSearchOverlay();

    // Initialize Hero Slider auto rotation if present
    if (document.getElementById("heroSlider")) {
        startHeroSliderTimer();
        setupHeroSliderControls();
    }

    // Setup Product filter tab clicks
    setupFilterTabs();

    // Setup Testimonials slider controls
    setupTestimonialsControls();

    // Setup Become Partner B2B form
    setupPartnerForm();

    // Setup Customer Review Reels Slider
    setupReelsSlider();

    // Setup Wishlist mock clicks
    setupWishlistClicks();

    // Setup combo pack add-to-carts
    setupComboClicks();

    // Setup Theme Toggle switcher
    setupThemeToggle();

    // Hero buttons cart listeners
    document.querySelectorAll(".addToCartHero").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const name = e.target.getAttribute("data-name") || "NatureByte Juice Powder";
            updateCart(1);
            showToast(`🎉 Added ${name} to your Cart!`);
        });
    });
});

// ==========================================================================
// RENDER & FILTER PRODUCTS
// ==========================================================================
function renderProducts(filterCategory) {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = filterCategory === "all"
        ? products
        : products.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="no-products">No products found for "${filterCategory}".</p>`;
        return;
    }

    filtered.forEach(p => {
        const qty = selectedQuantities[p.id] || 1;
        const badgeHTML = p.badge ? `<div class="product-badge ${p.badge.toLowerCase().replace(" ", "-")}">${p.badge}</div>` : '';

        // Generate Star rating markup
        let starsHTML = '';
        const fullStars = Math.floor(p.rating);
        for (let i = 0; i < 5; i++) {
            starsHTML += i < fullStars ? '★' : '☆';
        }

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            ${badgeHTML}
            <div class="product-image-box bg-flavor-${p.category.toLowerCase().replace(" ", "-")}">
                <img src="${p.image}" alt="${p.name}">
            </div>
            <h3>${p.name}</h3>
            <div class="rating-row">
                <span class="stars">${starsHTML}</span>
                <span class="rating-count">(${p.reviews} reviews)</span>
            </div>
            <div class="price-row">
                <span class="offer-price">₹${p.price}</span>
                <span class="mrp">₹${p.mrp}</span>
                <span class="discount-percent">${p.discount}% OFF</span>
            </div>
            <div class="qty-selector">
                <button class="qty-btn minus" data-id="${p.id}">-</button>
                <span class="qty-val" id="qty-val-${p.id}">${qty}</span>
                <button class="qty-btn plus" data-id="${p.id}">+</button>
            </div>
            <div class="product-actions">
                <button class="btn btn-outline add-to-cart-btn" data-id="${p.id}">Add to Cart</button>
                <button class="btn btn-primary buy-now-btn" data-id="${p.id}">Buy Now</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Attach quantity and action button event listeners inside grid
    setupGridEvents();
}

function setupGridEvents() {
    // Plus buttons
    document.querySelectorAll(".qty-btn.plus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            selectedQuantities[id] = (selectedQuantities[id] || 1) + 1;
            document.getElementById(`qty-val-${id}`).innerText = selectedQuantities[id];
        });
    });

    // Minus buttons
    document.querySelectorAll(".qty-btn.minus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            if (selectedQuantities[id] > 1) {
                selectedQuantities[id]--;
                document.getElementById(`qty-val-${id}`).innerText = selectedQuantities[id];
            }
        });
    });

    // Add to Cart Buttons
    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            const prod = products.find(p => p.id === id);
            const qty = selectedQuantities[id];
            updateCart(qty);
            showToast(`🛒 Added ${qty}x ${prod.name} to Cart!`);
        });
    });

    // Buy Now Buttons
    document.querySelectorAll(".buy-now-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.getAttribute("data-id"));
            const prod = products.find(p => p.id === id);
            const qty = selectedQuantities[id];
            updateCart(qty);
            showToast(`⚡ Proceeding to checkout with ${qty}x ${prod.name}!`);
            setTimeout(() => {
                alert(`Redirecting you to secure payment page for ${qty}x ${prod.name} totaling ₹${prod.price * qty}!`);
            }, 500);
        });
    });
}

function setupFilterTabs() {
    const tabs = document.querySelectorAll("#filterTabs .tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            tabs.forEach(t => t.classList.remove("active"));
            e.target.classList.add("active");
            const filter = e.target.getAttribute("data-filter");
            renderProducts(filter);
        });
    });
}

// Allows navbar flavour links to click through to appropriate filter tab
window.selectFlavourTab = function (flavourName) {
    const tabs = document.querySelectorAll("#filterTabs .tab-btn");
    let matched = false;
    tabs.forEach(tab => {
        if (tab.getAttribute("data-filter").toLowerCase() === flavourName.toLowerCase()) {
            tab.click();
            matched = true;
        }
    });
    if (!matched) {
        // Fallback to all if not matched
        tabs[0].click();
    }
};

// ==========================================================================
// HERO SLIDER LOGIC
// ==========================================================================
function startHeroSliderTimer() {
    if (!document.getElementById("heroSlider")) return;
    stopHeroSliderTimer();
    heroSliderTimer = setInterval(() => {
        changeHeroSlide(1);
    }, 5000);
}

function stopHeroSliderTimer() {
    if (heroSliderTimer) {
        clearInterval(heroSliderTimer);
    }
}

function changeHeroSlide(direction) {
    const slides = document.querySelectorAll("#heroSlider .hero-slide");
    const dots = document.querySelectorAll("#sliderDots .dot");
    if (!slides.length) return;

    slides[currentHeroSlide].classList.remove("active");
    if (dots[currentHeroSlide]) dots[currentHeroSlide].classList.remove("active");

    currentHeroSlide = (currentHeroSlide + direction + slides.length) % slides.length;

    slides[currentHeroSlide].classList.add("active");
    if (dots[currentHeroSlide]) dots[currentHeroSlide].classList.add("active");
}

function setupHeroSliderControls() {
    const nextBtn = document.getElementById("sliderNext");
    const prevBtn = document.getElementById("sliderPrev");
    const dots = document.querySelectorAll("#sliderDots .dot");

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            changeHeroSlide(1);
            startHeroSliderTimer(); // reset timer
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            changeHeroSlide(-1);
            startHeroSliderTimer(); // reset timer
        });
    }

    dots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            const index = parseInt(e.target.getAttribute("data-slide"));
            const slides = document.querySelectorAll("#heroSlider .hero-slide");
            const currentDots = document.querySelectorAll("#sliderDots .dot");
            if (!slides.length) return;

            slides[currentHeroSlide].classList.remove("active");
            if (currentDots[currentHeroSlide]) currentDots[currentHeroSlide].classList.remove("active");

            currentHeroSlide = index;

            slides[currentHeroSlide].classList.add("active");
            if (currentDots[currentHeroSlide]) currentDots[currentHeroSlide].classList.add("active");

            startHeroSliderTimer();
        });
    });
}

// ==========================================================================
// STICKY HEADER & MOBILE MENU
// ==========================================================================
function handleHeaderScroll() {
    const header = document.getElementById("mainHeader");
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }
}

function setupMobileNav() {
    const mobileToggle = document.getElementById("mobileToggle");
    const navMenu = document.getElementById("navMenu");

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            mobileToggle.classList.toggle("active");
        });

        // Close menu on navigation link clicks
        document.querySelectorAll("#navMenu .nav-link").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                mobileToggle.classList.remove("active");
            });
        });
    }
}

// ==========================================================================
// SEARCH OVERLAY LOGIC
// ==========================================================================
function setupSearchOverlay() {
    const searchBtn = document.getElementById("searchBtn");
    const searchOverlay = document.getElementById("searchOverlay");
    const closeSearch = document.getElementById("closeSearch");
    const searchSubmit = document.getElementById("searchSubmit");
    const searchInput = document.getElementById("searchInput");

    if (searchBtn && searchOverlay && closeSearch) {
        searchBtn.addEventListener("click", () => {
            searchOverlay.classList.add("active");
            searchInput.focus();
        });

        closeSearch.addEventListener("click", () => {
            searchOverlay.classList.remove("active");
        });

        searchOverlay.addEventListener("click", (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove("active");
            }
        });

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query !== "") {
                searchOverlay.classList.remove("active");
                showToast(`🔍 Searching for "${query}"...`);
                // Auto filter if name matches a tab
                window.selectFlavourTab(query);
                searchInput.value = "";
            }
        };

        if (searchSubmit) {
            searchSubmit.addEventListener("click", performSearch);
        }

        if (searchInput) {
            searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    performSearch();
                }
            });
        }
    }
}

// ==========================================================================
// TESTIMONIAL CAROUSEL
// ==========================================================================
function setupTestimonialsControls() {
    const prev = document.getElementById("testPrev");
    const next = document.getElementById("testNext");
    const slider = document.getElementById("testimonialSlider");

    if (prev && next && slider) {
        const getCardsPerView = () => {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        };

        const slide = (direction) => {
            const cards = document.querySelectorAll("#testimonialSlider .testimonial-card");
            const cardsPerView = getCardsPerView();
            const maxIndex = cards.length - cardsPerView;

            currentTestimonialSlide = currentTestimonialSlide + direction;
            if (currentTestimonialSlide < 0) currentTestimonialSlide = maxIndex;
            if (currentTestimonialSlide > maxIndex) currentTestimonialSlide = 0;

            const cardWidth = cards[0].clientWidth + 30; // card width + margin gap
            slider.style.transform = `translateX(-${currentTestimonialSlide * cardWidth}px)`;
        };

        next.addEventListener("click", () => slide(1));
        prev.addEventListener("click", () => slide(-1));

        window.addEventListener("resize", () => {
            slider.style.transform = "translateX(0px)";
            currentTestimonialSlide = 0;
        });
    }
}

// ==========================================================================
// WISHLIST INTERACTIONS
// ==========================================================================
function setupWishlistClicks() {
    const wishlistBtn = document.getElementById("wishlistBtn");
    if (wishlistBtn) {
        wishlistBtn.addEventListener("click", () => {
            showToast(`💖 Your Wishlist contains ${wishlistCount} items!`);
        });
    }
}

// ==========================================================================
// COMBO ACTIONS
// ==========================================================================
function setupComboClicks() {
    // Add to Cart
    document.querySelectorAll(".addComboToCart").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const name = e.target.getAttribute("data-name");
            updateCart(1);
            showToast(`🎁 Combo: ${name} added to Cart!`);
        });
    });

    // Buy Now
    document.querySelectorAll(".buyComboNow").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const name = e.target.getAttribute("data-name");
            const price = e.target.getAttribute("data-price");
            updateCart(1);
            showToast(`⚡ Processing order for ${name}!`);
            setTimeout(() => {
                alert(`Redirecting to secure checkout for ${name} (Offer Price: ₹${price}). Free shipping applied!`);
            }, 500);
        });
    });
}

// ==========================================================================
// B2B FRANCHISE FORM VALIDATION
// ==========================================================================
function setupPartnerForm() {
    const form = document.getElementById("partnerForm");
    const nameInput = document.getElementById("partnerName");
    const mobileInput = document.getElementById("partnerMobile");
    const cityInput = document.getElementById("partnerCity");
    const typeSelect = document.getElementById("partnerType");

    const modal = document.getElementById("partnerModal");
    const closeModal = document.getElementById("closeModal");
    const modalOkBtn = document.getElementById("modalOkBtn");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            let isValid = true;

            // Name check
            if (nameInput.value.trim() === "") {
                nameInput.classList.add("invalid");
                isValid = false;
            } else {
                nameInput.classList.remove("invalid");
            }

            // Mobile check (10 digits numeric)
            const mobileRegex = /^[6-9]\d{9}$/;
            if (!mobileRegex.test(mobileInput.value.trim())) {
                mobileInput.classList.add("invalid");
                isValid = false;
            } else {
                mobileInput.classList.remove("invalid");
            }

            // City check
            if (cityInput.value.trim() === "") {
                cityInput.classList.add("invalid");
                isValid = false;
            } else {
                cityInput.classList.remove("invalid");
            }

            // Business Type check
            if (typeSelect.value === "") {
                typeSelect.classList.add("invalid");
                isValid = false;
            } else {
                typeSelect.classList.remove("invalid");
            }

            if (isValid) {
                // Success modal trigger
                if (modal) {
                    modal.classList.add("active");
                }
                form.reset();
            } else {
                showToast("⚠️ Please correct form errors before submitting.");
            }
        });

        // Instant validation removals on input changes
        [nameInput, mobileInput, cityInput, typeSelect].forEach(input => {
            if (input) {
                input.addEventListener("input", () => {
                    if (input.value.trim() !== "") {
                        input.classList.remove("invalid");
                    }
                });
            }
        });

        // Modal triggers
        if (closeModal) {
            closeModal.addEventListener("click", () => {
                modal.classList.remove("active");
            });
        }
        if (modalOkBtn) {
            modalOkBtn.addEventListener("click", () => {
                modal.classList.remove("active");
            });
        }
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) {
                    modal.classList.remove("active");
                }
            });
        }
    }
}

// ==========================================================================
// CUSTOMER REELS SLIDER CONTROLS
// ==========================================================================
function setupReelsSlider() {
    const track = document.getElementById("reelsTrack");
    const prevBtn = document.getElementById("reelsPrev");
    const nextBtn = document.getElementById("reelsNext");
    if (!track || !prevBtn || !nextBtn) return;

    // Scroll amount per click: card width (240px) + gap (20px) = 260px
    const scrollAmount = 260;

    prevBtn.addEventListener("click", () => {
        track.scrollBy({
            left: -scrollAmount,
            behavior: "smooth"
        });
    });

    nextBtn.addEventListener("click", () => {
        track.scrollBy({
            left: scrollAmount,
            behavior: "smooth"
        });
    });

    // Reels interactive click handler (play/pause and volume/mute toggle)
    const cards = track.querySelectorAll(".reel-card");
    cards.forEach(card => {
        const video = card.querySelector(".reel-video");
        const playBtn = card.querySelector(".reel-play-btn");

        if (video) {
            // Click to toggle mute/unmute
            card.addEventListener("click", (e) => {
                e.stopPropagation();

                if (video.muted) {
                    video.muted = false;
                    video.play().catch(() => { });
                    playBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                    `;
                    showToast("🔊 Customer video unmuted");
                } else {
                    video.muted = true;
                    playBtn.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"></polygon>
                            <line x1="23" y1="9" x2="17" y2="15"></line>
                            <line x1="17" y1="9" x2="23" y2="15"></line>
                        </svg>
                    `;
                    showToast("🔇 Customer video muted");
                }
            });
        }
    });
}

// ==========================================================================
// TOAST NOTIFICATIONS & CART STATE UTILS
// ==========================================================================
function updateCart(qty) {
    cartCount += qty;
    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) {
        cartBadge.innerText = cartCount;
        cartBadge.classList.add("pulse");
        setTimeout(() => {
            cartBadge.classList.remove("pulse");
        }, 300);
    }
}

function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    // Remove toast after animation completes (3 seconds)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Newsletter subscription response
window.handleNewsletter = function () {
    const emailInput = document.getElementById("newsletterEmail");
    if (emailInput && emailInput.value.trim() !== "") {
        showToast("📧 Subscribed successfully! Check your inbox for exclusive codes.");
        emailInput.value = "";
    }
};

// Draw glass container outline
function drawGlass(x, y, w, h) {
    ctx.save();
    ctx.translate(x, y);

    // Glass backing shape
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2);
    ctx.lineTo(-w / 2 * 0.84, h / 2 - 10);
    ctx.quadraticCurveTo(0, h / 2 + 20, w / 2 * 0.84, h / 2 - 10);
    ctx.lineTo(w / 2, -h / 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.fill();

// Glass side walls and bottom base
ctx.beginPath();
ctx.moveTo(-w / 2, -h / 2);
ctx.lineTo(-w / 2 * 0.84, h / 2 - 10);
ctx.quadraticCurveTo(0, h / 2 + 20, w / 2 * 0.84, h / 2 - 10);
ctx.lineTo(w / 2, -h / 2);

ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
ctx.lineWidth = 6;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.stroke();

// Solid heavy glass base shine
ctx.beginPath();
ctx.moveTo(-w / 2 * 0.80, h / 2 - 20);
ctx.quadraticCurveTo(0, h / 2 + 6, w / 2 * 0.80, h / 2 - 20);
ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
ctx.lineWidth = 14;
ctx.stroke();

// Top glass rim ellipse
ctx.beginPath();
ctx.ellipse(0, -h / 2, w / 2, 16, 0, 0, Math.PI * 2);
ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
ctx.lineWidth = 4;
ctx.stroke();

// Side specularity/reflection lines (real glass reflections)
ctx.beginPath();
ctx.moveTo(-w / 2 + 5, -h / 2 + 40);
ctx.lineTo(-w / 2 * 0.84 + 5, h / 2 - 30);
ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
ctx.lineWidth = 6;
ctx.stroke();

ctx.restore();
    }

// Draw scaled juice liquid volume
function drawJuiceLiquid(x, y, w, h, fillPercent, waveT) {
    const colors = getThemeColors();
    ctx.save();
    ctx.translate(x, y);

    // Glass interior clipping region
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, -h / 2);
    ctx.lineTo(-w / 2 * 0.84 + 8, h / 2 - 10);
    ctx.quadraticCurveTo(0, h / 2 + 12, w / 2 * 0.84 - 8, h / 2 - 10);
    ctx.lineTo(w / 2 - 8, -h / 2);
    ctx.closePath();
    ctx.clip();

    // Calculate surface Y (liquid level starts at 65%)
    const liquidY = h / 2 - h * fillPercent;

    // Draw liquid body
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 20, h / 2 + 20);
    ctx.lineTo(-w / 2 - 20, liquidY);

    // Undulating wave segments
    const segments = 24;
    for (let i = 0; i <= segments; i++) {
        const ratio = i / segments;
        const px = -w / 2 + w * ratio;
        const py = liquidY + Math.sin(ratio * Math.PI * 2.5 + waveT) * 10;
        ctx.lineTo(px, py);
    }
    ctx.lineTo(w / 2 + 20, h / 2 + 20);
    ctx.closePath();

    // Theme juice gradient fill
    const fillGrad = ctx.createLinearGradient(0, liquidY, 0, h / 2);
    fillGrad.addColorStop(0, `rgba(${colors.primary}, 0.88)`);
    fillGrad.addColorStop(0.6, `rgba(${colors.secondary}, 0.65)`);
    fillGrad.addColorStop(1, `rgba(${colors.accent}, 0.35)`);
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Surface reflection highlight ellipse
    ctx.beginPath();
    ctx.ellipse(0, liquidY, w / 2 * (1 - fillPercent * 0.16), 10, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, 0.45)`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

// Draw energy vector icon (Pulsing Shield & Lightning Bolt) - Scaled up 1.5x
function drawEnergyVector(x, y, scale) {
    const colors = getThemeColors();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale * 1.5, scale * 1.5); // 1.5x bigger

    // Outer vector circle
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    const circleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 36);
    circleGrad.addColorStop(0, `rgba(${colors.accent}, 0.25)`);
    circleGrad.addColorStop(0.6, `rgba(${colors.primary}, 0.1)`);
    circleGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = circleGrad;
    ctx.fill();

    // Shield Outline
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.quadraticCurveTo(18, -22, 18, -6);
    ctx.quadraticCurveTo(18, 12, 0, 24);
    ctx.quadraticCurveTo(-18, 12, -18, -6);
    ctx.quadraticCurveTo(-18, -22, 0, -22);
    ctx.closePath();
    ctx.strokeStyle = `rgba(${colors.accent}, 0.85)`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.fill();

    // Lightning Bolt
    ctx.beginPath();
    ctx.moveTo(-3, -12);
    ctx.lineTo(8, -2);
    ctx.lineTo(1, -2);
    ctx.lineTo(5, 14);
    ctx.lineTo(-7, 2);
    ctx.lineTo(0, 2);
    ctx.closePath();

    const boltGrad = ctx.createLinearGradient(0, -12, 0, 14);
    boltGrad.addColorStop(0, "#ffffff");
    boltGrad.addColorStop(1, `rgba(${colors.accent}, 1)`);
    ctx.fillStyle = boltGrad;

    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(${colors.accent}, 1)`;
    ctx.fill();

    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update target position
    if (width < 768) {
        targetX = width * 0.5;
        targetY = height * 0.62;
    } else {
        targetX = width * 0.72;
        targetY = height * 0.52;
    }

    // Update Bezier curves coordinates dynamically
    p0_water.x = -50;
    p0_water.y = height * 0.3;
    p1_water.x = width * 0.25;
    p1_water.y = height * 0.1;
    p2_water.x = targetX - glassW * 0.6;
    p2_water.y = targetY - glassH * 0.7;
    p3_water.x = targetX - 50;
    p3_water.y = targetY - glassH * 0.5 + 40;

    p0_powder.x = width + 50;
    p0_powder.y = height * 0.3;
    p1_powder.x = width * 0.75;
    p1_powder.y = height * 0.1;
    p2_powder.x = targetX + glassW * 0.6;
    p2_powder.y = targetY - glassH * 0.7;
    p3_powder.x = targetX + 50;
    p3_powder.y = targetY - glassH * 0.5 + 40;

    // 1. Draw Liquid inside Glass
    waveTime += 0.08; // faster undulation
    drawJuiceLiquid(targetX, targetY, glassW, glassH, 0.65, waveTime);

    // 2. Draw Translucent Glass outline
    drawGlass(targetX, targetY, glassW, glassH);

    // 3. Draw Churning foam splash zones
    drawFoamSplash();

    // 4. Draw Running streams (fluid ribbons & powder clouds)
    drawRealWaterStream();
    drawRealPowderStream();

    // 5. Maintain particle count for massive flows (120 particles each)
    const targetWaterCount = 120;
    const targetPowderCount = 120;
    let currentWater = particles.filter(p => p.type === "water").length;
    let currentPowder = particles.filter(p => p.type === "powder").length;

    for (let i = currentWater; i < targetWaterCount; i++) {
        particles.push(new Particle("water"));
    }
    for (let i = currentPowder; i < targetPowderCount; i++) {
        particles.push(new Particle("powder"));
    }

    // 6. Update and Draw active flow grains/bubbles/sparks
    particles = particles.filter(p => p.life > 0 || p.type === "water" || p.type === "powder");
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }

    // 7. Draw Energy Vector Icon hovering above the 3x larger glass
    pulseTime += 0.07;
    const pulseScale = 1.0 + Math.sin(pulseTime) * 0.08;
    drawEnergyVector(targetX, targetY - glassH / 2 - 45, pulseScale);

    requestAnimationFrame(animate);
}

if (typeof ctx !== 'undefined') {
    animate();
}

// ==========================================================================
// THEME SWITCHER CONTROLLER
// ==========================================================================
function setupThemeToggle() {
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (!themeToggleBtn) return;

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
        const newTheme = currentTheme === "light" ? "dark" : "light";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        try {
            localStorage.setItem("theme", newTheme);
        } catch (e) {
            console.warn('LocalStorage write is blocked:', e.message);
        }
    });
}
