// ============================================
// CATEGORIES
// ============================================

const categories = [
    { id: 'all',      label: 'All' },
    { id: 'chinese',  label: 'Chinese' },
    { id: 'sichuan',  label: 'Sichuan' },
    { id: 'street',   label: 'Street Food' },
    { id: 'starters', label: 'Starters' },
];

function renderCategoryTabs() {
    const container = document.querySelector('.category-tabs');
    if (!container) return;

    container.innerHTML = categories.map(c => `
        <button class="cat-tab ${c.id === 'all' ? 'active' : ''}"
                onclick="filterMenu('${c.id}', this)">
            ${c.label}
        </button>
    `).join('');
}

function setActiveCategory(categoryId) {
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.trim() ===
            (categories.find(c => c.id === categoryId)?.label || ''));
    });
}

// Export
window.categories         = categories;
window.renderCategoryTabs = renderCategoryTabs;
window.setActiveCategory  = setActiveCategory;