// ============================================
// MENU DATA
// ============================================

if (typeof window.menuItems === 'undefined') {
    window.menuItems = [
        { id:1, name:'Schezwan Fried Rice', category:'chinese', price:140, type:'veg',    img:'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400', rating:4.7, reviews:89,  desc:'Spicy Schezwan sauce with fresh veggies' },
        { id:2, name:'Veg Crispy',          category:'sichuan', price:160, type:'veg',    img:'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', rating:4.5, reviews:65,  desc:'Crispy battered vegetables in Sichuan sauce' },
        { id:3, name:'Triple Fried Rice',   category:'chinese', price:160, type:'nonveg', img:'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400', rating:4.8, reviews:112, desc:'Mix of egg, paneer and vegetables' },
        { id:4, name:'Veg Chowmein',        category:'chinese', price:120, type:'veg',    img:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', rating:4.5, reviews:95,  desc:'Classic noodles with vegetables' },
        { id:5, name:'Masala Papad',        category:'starters', price:45, type:'veg',   img:'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400', rating:4.3, reviews:45,  desc:'Crispy papad with toppings' },
    ];
}

// ============================================
// MENU RENDER
// ============================================

let currentFilter = 'all';

function renderMenu() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    const items = window.menuItems || [];
    const filtered = currentFilter === 'all'
        ? items
        : items.filter(i => i.category === currentFilter);

    if (!filtered.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gray);">No items in this category yet.</div>';
        return;
    }

    grid.innerHTML = filtered.map(item => `
        <div class="food-card">
            <div class="food-card-img">
                <img src="${item.img}" alt="${item.name}" loading="lazy">
                <div class="veg-badge ${item.type}"></div>
                <div class="food-tag">${item.category}</div>
            </div>
            <div class="food-card-body">
                <div class="food-name">${item.name}</div>
                <div class="food-desc">${item.desc || 'Delicious ' + item.name}</div>
                <div class="food-rating">
                    <span style="color:var(--orange);font-weight:700;">★ ${item.rating}</span>
                    <span style="color:var(--gray);font-size:.75rem;">(${item.reviews})</span>
                </div>
                <div class="food-footer">
                    <div class="food-price">₹${item.price}</div>
                    <button class="add-btn" onclick="addToCart(${item.id})">+ Add</button>
                </div>
            </div>
        </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function filterMenu(category, btn) {
    currentFilter = category;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderMenu();
    if (typeof setActiveCategory === 'function') setActiveCategory(category);
}

// ============================================
// SPECIALS RENDER
// ============================================

function renderSpecials() {
    const grid = document.getElementById('specialGrid');
    if (!grid) return;

    const items = window.menuItems || [];

    // Pick specials by ID so we use real data (not a separate hardcoded list)
    const specialIds  = [1, 2, 3];
    const labelMap    = { 1: 'Chinese Special', 2: 'Sichuan Special', 3: "Chef's Choice" };
    const specials    = specialIds.map(id => items.find(i => i.id === id)).filter(Boolean);

    if (!specials.length) {
        grid.innerHTML = '';
        return;
    }

    grid.innerHTML = specials.map(s => `
        <div class="special-item">
            <div class="special-img-wrap"><img src="${s.img}" alt="${s.name}" loading="lazy"></div>
            <div class="special-cuisine">${labelMap[s.id] || s.category}</div>
            <div class="special-name">${s.name}</div>
            <div class="special-price">₹${s.price}</div>
            <button class="buy-btn" onclick="addToCart(${s.id})">Buy Now</button>
        </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================
// EXPORTS
// ============================================
window.renderMenu    = renderMenu;
window.filterMenu    = filterMenu;
window.renderSpecials = renderSpecials;