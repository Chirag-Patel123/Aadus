// ===================== TRACK ORDER =====================

async function trackOrder() {
    const val = document.getElementById('trackInput')?.value?.trim().toUpperCase();
    if (!val) { showToast('Please enter an order ID', 'alert-triangle'); return; }

    // 1. Try local orders first (already loaded in session)
    const localOrder = window.currentUser?.myOrders?.find(o =>
        String(o.id).toUpperCase() === val
    );

    if (localOrder) {
        displayTrackResult(localOrder);
        return;
    }

    // 2. Fallback: query Supabase
    const supabase = window.supabaseClient?.();
    if (!supabase) {
        showToast('Please login or wait for connection', 'alert-triangle');
        return;
    }

    showToast('Looking up order…', 'loader');

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .ilike('id::text', val)   // works for UUID; adjust if using custom IDs
        .single();

    if (error || !data) {
        showToast('Order not found. Check the ID and try again.', 'alert-triangle');
        document.getElementById('trackResult').style.display = 'none';
        return;
    }

    displayTrackResult({
        id:     data.id,
        items:  data.items_summary,
        amount: data.total,
        status: data.status,
        time:   new Date(data.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date:   new Date(data.created_at).toLocaleDateString('en-IN')
    });
}

function displayTrackResult(order) {
    const idEl     = document.getElementById('trackOrderId');
    const statusEl = document.getElementById('trackOrderStatus');
    const itemsEl  = document.getElementById('trackOrderItems');
    const resultEl = document.getElementById('trackResult');

    if (idEl)     idEl.textContent     = order.id;
    if (statusEl) statusEl.textContent = capitalize(order.status || 'Unknown');
    if (itemsEl)  itemsEl.textContent  = order.items || '—';
    if (resultEl) resultEl.style.display = 'block';
}

window.trackOrder = trackOrder;