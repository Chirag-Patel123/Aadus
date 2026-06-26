// ============================================
// LOGIN FUNCTIONS
// ============================================

// ── Helpers ──────────────────────────────────
// Single source of truth: always call supabase this way
function getSupabase() {
    return window.supabaseClient?.() || null;
}

// ── Modal open / close ────────────────────────
function openLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('open');
        showLoginForm();   // always reset to login tab when opening
    }
}

function closeLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) modal.classList.remove('open');
}

// ── Form switchers ────────────────────────────
// Uses the loginForm / signupForm / welcomeScreen ID convention
function showLoginForm() {
    const loginForm    = document.getElementById('loginForm');
    const signupForm   = document.getElementById('signupForm');
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (loginForm)     loginForm.style.display    = 'block';
    if (signupForm)    signupForm.style.display   = 'none';
    if (welcomeScreen) welcomeScreen.style.display = 'none';
}

function showSignupForm() {
    const loginForm    = document.getElementById('loginForm');
    const signupForm   = document.getElementById('signupForm');
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (loginForm)     loginForm.style.display    = 'none';
    if (signupForm)    signupForm.style.display   = 'block';
    if (welcomeScreen) welcomeScreen.style.display = 'none';
}

function showWelcomeScreen(firstName) {
    const loginForm    = document.getElementById('loginForm');
    const signupForm   = document.getElementById('signupForm');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const welcomeMsg   = document.getElementById('welcomeMsg');
    if (loginForm)     loginForm.style.display    = 'none';
    if (signupForm)    signupForm.style.display   = 'none';
    if (welcomeScreen) welcomeScreen.style.display = 'block';
    if (welcomeMsg)    welcomeMsg.textContent      = `Welcome, ${firstName}!`;
}

// ── Email login ───────────────────────────────
async function handleEmailLogin() {
    const email    = document.getElementById('loginEmail')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showToast('Please enter email and password', 'alert-triangle');
        return;
    }

    const supabase = getSupabase();
    if (!supabase) {
        showToast('Connecting to server…', 'loader');
        return;
    }

    showToast('Logging in…', 'loader');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showToast(error.message, 'alert-triangle');
        return;
    }

    await window.loadUserProfile?.(data.user);
    updateNavForLogin();
    showToast('Welcome back!', 'check-circle');
    closeLogin();

    if (typeof renderMenu === 'function') renderMenu();
    if (typeof renderCart === 'function') renderCart();
}

// ── Sign up ───────────────────────────────────
async function handleSignUp() {
    console.log('🟢 Signup started');

    const firstName    = document.getElementById('signupFirstName')?.value?.trim();
    const lastName     = document.getElementById('signupLastName')?.value?.trim();
    const email        = document.getElementById('signupEmail')?.value?.trim();
    const phone        = document.getElementById('signupPhone')?.value?.trim();
    const password     = document.getElementById('signupPassword')?.value;
    const addressLine  = document.getElementById('signupAddressLine')?.value?.trim();
    const area         = document.getElementById('signupArea')?.value?.trim();
    const landmark     = document.getElementById('signupLandmark')?.value?.trim();
    const city         = document.getElementById('signupCity')?.value?.trim() || 'Mumbai';
    const pinCode      = document.getElementById('signupPin')?.value?.trim();
    const receiveOffers = document.getElementById('signupOffers')?.checked || false;

    // Validation
    if (!firstName || !lastName) { showToast('Please enter your full name', 'alert-triangle'); return; }
    if (!email)                   { showToast('Please enter your email address', 'alert-triangle'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email address', 'alert-triangle'); return; }
    if (!password || password.length < 6) { showToast('Password must be at least 6 characters', 'alert-triangle'); return; }
    if (!addressLine)             { showToast('Please enter your delivery address', 'alert-triangle'); return; }
    if (phone && !/^\d{10}$/.test(phone)) { showToast('Please enter a valid 10-digit phone number', 'alert-triangle'); return; }

    const fullAddress = [addressLine, area, landmark, `${city}${pinCode ? ' - ' + pinCode : ''}`]
        .filter(p => p && p.trim()).join(', ');

    const supabase = getSupabase();
    if (!supabase) {
        showToast('Connecting to server… Please try again', 'loader');
        return;
    }

    showToast('Creating account…', 'loader');

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name:  lastName,
                    phone,
                    address:       fullAddress,
                    city,
                    pincode:       pinCode,
                    landmark,
                    receive_offers: receiveOffers,
                    created_at:    new Date().toISOString()
                }
            }
        });

        if (error) {
            const msg = error.message.includes('already registered')
                ? 'This email is already registered. Please login instead.'
                : 'Signup error: ' + error.message;
            showToast(msg, 'alert-triangle');
            return;
        }

        if (data?.user) {
            // Save full profile to DB
            try {
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id:              data.user.id,
                    email,
                    first_name:      firstName,
                    last_name:       lastName,
                    phone,
                    address:         fullAddress,
                    city,
                    pincode:         pinCode,
                    receive_offers:  receiveOffers,
                    created_at:      new Date().toISOString(),
                    updated_at:      new Date().toISOString()
                });
                if (profileError) console.warn('Profile upsert note:', profileError);
                else console.log('✅ Profile saved');
            } catch (e) {
                console.warn('Profile creation note:', e);
            }

            if (receiveOffers) {
                localStorage.setItem('aadus_offers_consent', 'true');
                localStorage.setItem('aadus_user_email', email);
                trackOfferSignup(email, firstName);
            }

            // Clear form
            ['signupFirstName','signupLastName','signupEmail','signupPhone',
             'signupPassword','signupAddressLine','signupArea','signupLandmark','signupPin']
                .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            const offersEl = document.getElementById('signupOffers');
            if (offersEl) offersEl.checked = false;

            showWelcomeScreen(firstName);
            showToast('Account created! Please verify your email.', 'check-circle');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'alert-triangle');
        console.error('Signup error:', err);
    }
}

// ── Nav update ────────────────────────────────
function updateNavForLogin() {
    const user = window.currentUser;
    if (!user) return;

    const guestBtn  = document.getElementById('guestLoginBtn');
    const userArea  = document.getElementById('userNavArea');
    const avatarBtn = document.getElementById('userAvatarBtn');
    const ddName    = document.getElementById('ddName');
    const ddPhone   = document.getElementById('ddPhone');

    if (guestBtn)  guestBtn.style.display  = 'none';
    if (userArea)  userArea.style.display  = 'flex';

    const initials = ((user.firstName || '?')[0] + (user.lastName || '')[0]).toUpperCase();
    if (avatarBtn) avatarBtn.textContent = initials;
    if (ddName)    ddName.textContent    = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer';
    if (ddPhone)   ddPhone.textContent   = user.email || user.phone || '';
}

// ── Logout ────────────────────────────────────
async function logoutUser() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();

    window.currentUser = null;

    const guestBtn = document.getElementById('guestLoginBtn');
    const userArea = document.getElementById('userNavArea');
    const dropdown = document.getElementById('userDropdown');

    if (guestBtn)  guestBtn.style.display = '';
    if (userArea)  userArea.style.display = 'none';
    if (dropdown)  dropdown.classList.remove('open');

    showToast('Logged out successfully', 'log-out');

    if (typeof renderMenu === 'function') renderMenu();
}

// ── Dropdown ──────────────────────────────────
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('open');
}

document.addEventListener('click', (e) => {
    const area     = document.getElementById('userNavArea');
    const dropdown = document.getElementById('userDropdown');
    if (area && dropdown && !area.contains(e.target)) {
        dropdown.classList.remove('open');
    }
});

// ── Password visibility ───────────────────────
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
}

// ── Offer tracking (GA4) ──────────────────────
function trackOfferSignup(email, firstName) {
    console.log('📧 Email offer signup tracked:', email, firstName);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'signup_for_offers', {
            event_category: 'engagement',
            event_label:    email,
            value:          1
        });
    }
}

// ── Exports ───────────────────────────────────
window.openLogin          = openLogin;
window.closeLogin         = closeLogin;
window.showLoginForm      = showLoginForm;
window.showSignupForm     = showSignupForm;
window.showWelcomeScreen  = showWelcomeScreen;
window.handleEmailLogin   = handleEmailLogin;
window.handleSignUp       = handleSignUp;
window.updateNavForLogin  = updateNavForLogin;
window.logoutUser         = logoutUser;
window.toggleUserDropdown = toggleUserDropdown;
window.togglePassword     = togglePassword;
window.trackOfferSignup   = trackOfferSignup;