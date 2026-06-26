// ============================================
// SIMPLE SIGNUP - FIXED VERSION
// ============================================

async function handleSignUp() {
    console.log('🟢 Signup started');
    
    // Get form values
    const firstName = document.getElementById('signupFirstName')?.value?.trim();
    const lastName = document.getElementById('signupLastName')?.value?.trim();
    const email = document.getElementById('signupEmail')?.value?.trim();
    const password = document.getElementById('signupPassword')?.value;
    
    console.log('Values:', { firstName, lastName, email });
    
    // Validate
    if (!firstName || !lastName) {
        alert('Please enter your full name');
        return;
    }
    if (!email) {
        alert('Please enter email');
        return;
    }
    if (!password || password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Get Supabase client
    const supabase = window.supabaseClient;
    if (!supabase) {
        alert('Connecting to server... Please wait and try again');
        return;
    }
    
    alert('Creating account for: ' + email);
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { first_name: firstName, last_name: lastName }
            }
        });
        
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        
        if (data?.user) {
            alert('✅ Account created successfully!');
            
            // Create profile manually
            try {
                await supabase
                    .from('profiles')
                    .upsert({
                        id: data.user.id,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        created_at: new Date()
                    });
            } catch(e) {
                console.log('Profile note:', e);
            }
            
            // Show welcome
            if (typeof showWelcomeScreen === 'function') {
                showWelcomeScreen(firstName);
            } else {
                alert('Welcome ' + firstName + '! Please login.');
                closeLogin();
            }
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

window.handleSignUp = handleSignUp;