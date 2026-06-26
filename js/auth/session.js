// ===================== MY ACCOUNT MODAL =====================

function openAccount(tab) {
    document.getElementById('userDropdown').classList.remove('open');
    if (!window.currentUser) { openLogin(); return; }
    populateAccountModal();
    document.getElementById('accountModal').classList.add('open');
    if (tab) switchAccTab(tab);
}

function closeAccount() {
    document.getElementById('accountModal').classList.remove('open');
}

function switchAccTab(tab) {
    ['profile', 'orders', 'addresses'].forEach(t => {
        document.getElementById('acc-' + t).classList.toggle('active', t === tab);
        document.getElementById('an-'  + t).classList.toggle('active', t === tab);
    });
    if (tab === 'orders')    renderMyOrders();
    if (tab === 'addresses') renderMyAddresses();
}

function populateAccountModal() {
    const user = window.currentUser;
    if (!user) return;

    const initials = ((user.firstName || '?')[0] + (user.lastName ? user.lastName[0] : '')).toUpperCase();
    document.getElementById('accAvatarLarge').textContent = initials;
    document.getElementById('accFullName').textContent    = `${user.firstName} ${user.lastName || ''}`.trim();
    document.getElementById('accPhone').textContent       = user.phone  || '—';
    document.getElementById('accEmail').textContent       = user.email  || 'No email added';
    document.getElementById('pfFirst').value              = user.firstName || '';
    document.getElementById('pfLast').value               = user.lastName  || '';
    document.getElementById('pfEmail').value              = user.email     || '';
    document.getElementById('pfDob').value                = user.dob       || '';
    document.getElementById('pfPhone').value              = user.phone     || '';
}

async function saveProfile() {
    const user = window.currentUser;
    if (!user) return;

    user.firstName = document.getElementById('pfFirst').value.trim()  || user.firstName;
    user.lastName  = document.getElementById('pfLast').value.trim()   || user.lastName;
    user.email     = document.getElementById('pfEmail').value.trim();
    user.dob       = document.getElementById('pfDob').value;

    populateAccountModal();
    updateNavForLogin();

    // Persist to Supabase if available
    const supabase = window.supabaseClient?.();
    if (supabase && user.id) {
        const { error } = await supabase.from('profiles').upsert({
            id:         user.id,
            first_name: user.firstName,
            last_name:  user.lastName,
            email:      user.email,
            dob:        user.dob || null,
            updated_at: new Date().toISOString()
        });
        if (error) console.warn('Profile save error:', error);
    }

    showToast('Profile updated!', 'check-circle');
}

// ===================== MY ORDERS =====================

function renderMyOrders() {
    const el     = document.getElementById('myOrdersList');
    const orders = window.currentUser?.myOrders || [];

    if (!orders.length) {
        el.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--gray);">No orders yet. Start ordering!</div>';
        return;
    }

    el.innerHTML = orders.map(o => `
        <div class="my-order-card">
            <div class="moc-header">
                <div class="moc-id">${o.id}</div>
                <span class="moc-status ${o.status}">${capitalize(o.status)}</span>
            </div>
            <div class="moc-items">${o.items}</div>
            <div class="moc-footer">
                <div class="moc-amount">${inrHtml(o.amount)}</div>
                <div class="moc-date">${o.time}, ${o.date}</div>
                <button class="reorder-btn" onclick="reorderItems('${o.id}')">Reorder</button>
            </div>
        </div>`).join('');
}

function reorderItems(id) {
    const user   = window.currentUser;
    const orders = user?.myOrders || [];
    const o      = orders.find(ord => ord.id === id);
    if (!o) { showToast('Order not found', 'alert-triangle'); return; }

    // Re-add each item to cart if menuItems is available
    if (typeof menuItems !== 'undefined' && o.itemIds?.length) {
        o.itemIds.forEach(iid => { if (typeof addToCart === 'function') addToCart(iid); });
    }

    closeAccount();
    showToast('Items added to cart!', 'shopping-cart');
}

// ===================== ADDRESSES =====================

function renderMyAddresses() {
    const el    = document.getElementById('myAddressList');
    const addrs = window.currentUser?.addresses || [];

    if (!addrs.length) {
        el.innerHTML = '<div style="color:var(--gray);font-size:.85rem;margin-bottom:1rem;">No saved addresses yet.</div>';
        return;
    }

    el.innerHTML = addrs.map((a, i) => `
        <div class="address-card">
            <div class="addr-icon">${
                a.label === 'Home' ? iconHtml('home') :
                a.label === 'Work' ? iconHtml('building-2') : iconHtml('map-pin')
            }</div>
            <div class="addr-info">
                <div class="addr-label">${a.label}${a.isDefault ? ' <span class="addr-default-badge">Default</span>' : ''}</div>
                <div class="addr-text">${a.line}${a.area ? ', ' + a.area : ''}, ${a.city} ${a.pin || ''}</div>
                <div class="addr-actions">
                    ${!a.isDefault ? `<button class="addr-btn" onclick="setDefaultAddr(${i})">Set Default</button>` : ''}
                    <button class="addr-btn del" onclick="deleteAddr(${i})">Delete</button>
                </div>
            </div>
        </div>`).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setDefaultAddr(idx) {
    const addrs = window.currentUser?.addresses;
    if (!addrs) return;
    addrs.forEach((a, i) => a.isDefault = (i === idx));
    renderMyAddresses();
    showToast('Default address updated!', 'map-pin');
}

function deleteAddr(idx) {
    const addrs = window.currentUser?.addresses;
    if (!addrs) return;
    addrs.splice(idx, 1);
    renderMyAddresses();
    showToast('Address removed', 'trash-2');
}

// ===================== ADD ADDRESS =====================

function openAddAddress() {
    closeAccount();
    document.getElementById('addAddrModal').classList.add('open');
}

function closeAddAddress() {
    document.getElementById('addAddrModal').classList.remove('open');
    openAccount('addresses');
}

function saveNewAddress() {
    const user = window.currentUser;
    if (!user) return;

    const line = document.getElementById('aLine').value.trim();
    if (!line) { showToast('Please enter an address', 'alert-triangle'); return; }

    const isDefault = document.getElementById('aDefault').checked;
    if (isDefault) (user.addresses || []).forEach(a => a.isDefault = false);

    if (!user.addresses) user.addresses = [];
    user.addresses.push({
        label:     document.getElementById('aLabel').value.trim() || 'Other',
        line,
        area:      document.getElementById('aArea').value.trim(),
        pin:       document.getElementById('aPin').value.trim(),
        city:      document.getElementById('aCity').value.trim() || 'Mumbai',
        isDefault
    });

    document.getElementById('addAddrModal').classList.remove('open');
    openAccount('addresses');
    showToast('Address saved!', 'map-pin');
}

// ===================== EXPORTS =====================
window.openAccount       = openAccount;
window.closeAccount      = closeAccount;
window.switchAccTab      = switchAccTab;
window.populateAccountModal = populateAccountModal;
window.saveProfile       = saveProfile;
window.renderMyOrders    = renderMyOrders;
window.reorderItems      = reorderItems;
window.renderMyAddresses = renderMyAddresses;
window.setDefaultAddr    = setDefaultAddr;
window.deleteAddr        = deleteAddr;
window.openAddAddress    = openAddAddress;
window.closeAddAddress   = closeAddAddress;
window.saveNewAddress    = saveNewAddress;