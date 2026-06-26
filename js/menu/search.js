// ============================================
// MENU SEARCH
// ============================================

function searchMenu(query) {
    const q = (query || '').trim().toLowerCase();

    if (!q) {
        // Empty query — restore current category filter
        if (typeof renderMenu === 'function') renderMenu();
        return;
    }

    const grid = document.getElementById('menuGrid');
    if (!grid) return;

    const items   = window.menuItems || [];
    const results = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.desc  || '').toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );

    if (!results.length) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gray);">No items found for "<strong>${query}</strong>"</div>`;
        return;
    }

    grid.innerHTML = results.map(item => `
        <div class="food-card">
            <div class="food-card-img">
                <img src="${item.img}" alt="${item.name}" loading="lazy">
                <div class="veg-badge ${item.type}"></div>
                <div class="food-tag">${item.category}</div>
            </div>
            <div class="food-card-body">
                <div class="food-name">${item.name}</div>
                <div class="food-desc">${item.desc || ''}</div>
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

// Wire up to a search input if one exists on the page
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('menuSearchInput');
    if (input) {
        input.addEventListener('input', e => searchMenu(e.target.value));
    }
});

window.searchMenu = searchMenu;