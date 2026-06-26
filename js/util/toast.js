// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, icon = 'check-circle') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');
    
    if (!toast || !toastMsg) return;
    
    toastMsg.textContent = message;
    
    // Update icon
    if (toastIcon) {
        toastIcon.innerHTML = `<span class="ico"><i data-lucide="${icon}"></i></span>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export
window.showToast = showToast;