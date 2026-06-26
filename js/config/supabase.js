// ============================================
// SUPABASE CLIENT - GLOBAL
// ============================================

const SUPABASE_URL = 'https://pnqengnkjmbqiauuzdbw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucWVuZ25ram1icWlhdXV6ZGJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzQ0NzgsImV4cCI6MjA5NjY1MDQ3OH0.Qlwzwhozi0z20PzcVHDRtQxq3JsfX3BpZdEdW-_4XPM';

// Use a different variable name to avoid clashing with the Supabase library
let _sbClient = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        _sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = _sbClient;
        console.log('✅ Supabase client initialized');
        checkSession();
    } else {
        console.log('⏳ Waiting for Supabase library...');
        setTimeout(initSupabase, 500);
    }
}

async function checkSession() {
    if (!_sbClient) return;
    const { data: { session } } = await _sbClient.auth.getSession();
    if (session?.user) {
        console.log('✅ User already logged in:', session.user.email);
        window.currentUser = { id: session.user.id, email: session.user.email };
    }
}

initSupabase();
window.initSupabase = initSupabase;