// ============================================
// CART FUNCTIONS
// ============================================

let cart = [];

// ── Add / Remove ──────────────────────────────

function addToCart(id) {
    const item = menuItems.find(i => i.id === id);
    if (!item) return;

    const existing = cart.find(i => i.id === id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }

    updateCart();
    showToast(`${item.name} added to cart!`, 'shopping-cart');
}

function removeFromCart(id) {
    const index = cart.findIndex(i => i.id === id);
    if (index === -1) return;

    if (cart[index].qty > 1) {
        cart[index].qty--;
    } else {
        cart.splice(index, 1);
    }

    updateCart();
}

// ── Render ────────────────────────────────────

function updateCart() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const cartCount    = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal    = document.getElementById('cartTotal');
    const cartItemsDiv = document.getElementById('cartItems');
    const cartFooter   = document.getElementById('cartFooter');

    if (cartCount)    cartCount.textContent    = count;
    if (cartSubtotal) cartSubtotal.innerHTML   = `₹${total}`;
    if (cartTotal)    cartTotal.innerHTML      = `₹${total}`;

    if (!cart.length) {
        if (cartItemsDiv) cartItemsDiv.innerHTML = `<div class="cart-empty"><p>Your cart is empty</p></div>`;
        if (cartFooter)   cartFooter.style.display = 'none';
    } else {
        if (cartItemsDiv) {
            cartItemsDiv.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price * item.qty}</div>
                    </div>
                    <div class="cart-qty">
                        <button class="qty-btn" onclick="removeFromCart(${item.id})">−</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="addToCart(${item.id})">+</button>
                    </div>
                </div>
            `).join('');
        }
        if (cartFooter) cartFooter.style.display = 'block';
    }
}

// ── Sidebar ───────────────────────────────────

function openCart() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
}

function closeCart() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
}

// ── Exports ───────────────────────────────────
window.cart           = cart;   // expose so placeOrder.js can read it
window.addToCart      = addToCart;
window.removeFromCart = removeFromCart;
window.updateCart     = updateCart;
window.openCart       = openCart;
window.closeCart      = closeCart;