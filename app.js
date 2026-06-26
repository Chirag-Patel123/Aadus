// ===================== COPY CODE =====================
function copyCode(code) {
    navigator.clipboard.writeText(code).catch(() => {});
    showToast(`Code "${code}" copied!`, 'clipboard');
}

// ===================== TOAST =====================
function iconHtml(name) {
    return `<span class="ico"><i data-lucide="${name}"></i></span>`;
}

function showToast(msg, icon = 'check-circle') {
    const t  = document.getElementById('toast');
    const ti = document.getElementById('toastIcon');
    document.getElementById('toastMsg').textContent = msg;
    ti.innerHTML = iconHtml(icon);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2800);
}

// ===================== SCROLL & REVEAL =====================
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

function observeReveal() {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

// ===================== HELPERS =====================
function capitalize(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function inrText(amount) {
    const n   = Number(amount);
    const val = Number.isFinite(n) ? n.toLocaleString('en-IN') : String(amount);
    return '\u20B9' + val;
}

function inrHtml(amount, opts = {}) {
    const prefix = opts.negative ? '−' : '';
    const n      = Number(amount);
    const val    = Number.isFinite(n) ? n.toLocaleString('en-IN') : String(amount);
    return `<span class="inr">${prefix}<span class="inr-sym">\u20B9</span>${val}</span>`;
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof renderMenu     === 'function') renderMenu();
    if (typeof renderSpecials === 'function') renderSpecials();
    observeReveal();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});