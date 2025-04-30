// Auth State Management
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('auth-modal');
const authButton = document.getElementById('auth-button');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const closeButton = document.querySelector('.close');
const adminLink = document.getElementById('admin-link');

// Check if user is logged in from previous session
function checkAuthState() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForAuth();
    }
}

// Update UI based on auth state
function updateUIForAuth() {
    if (currentUser) {
        authButton.textContent = 'Logout';
        if (currentUser.isAdmin) {
            adminLink.classList.remove('hidden');
        }
    } else {
        authButton.textContent = 'Login';
        adminLink.classList.add('hidden');
    }
}

// Show/Hide auth modal
authButton.addEventListener('click', () => {
    if (currentUser) {
        // Logout
        logout();
    } else {
        // Show login modal
        authModal.classList.remove('hidden');
    }
});

closeButton.addEventListener('click', () => {
    authModal.classList.add('hidden');
});

// Login functionality
loginButton.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const user = StorageService.validateUser(email, password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            authModal.classList.add('hidden');
            updateUIForAuth();
            showNotification('Logged in successfully', 'success');
        } else {
            showNotification('Invalid email or password', 'error');
        }
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Register functionality
registerButton.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        const user = StorageService.createUser(email, password);
        currentUser = { ...user, isAdmin: false };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        authModal.classList.add('hidden');
        updateUIForAuth();
        showNotification('Account created successfully', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Logout functionality
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForAuth();
    showNotification('Logged out successfully', 'success');
    // Redirect to home if on admin page
    if (window.location.hash === '#admin') {
        window.location.hash = '#home';
    }
}

// Notification function
function showNotification(message, type) {
    const banner = document.getElementById('notification-banner');
    banner.textContent = message;
    banner.style.backgroundColor = type === 'error' ? 'var(--danger-color)' : 'var(--success-color)';
    banner.classList.remove('hidden');
    
    setTimeout(() => {
        banner.classList.add('hidden');
    }, 3000);
}

// Initialize auth state
checkAuthState(); 