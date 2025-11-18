/* Workflow Automation for Retail - Global JavaScript */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    setupFormHandlers();
    setupDemoAccounts();
    setupNotifications();
});

/**
 * Theme Preferences (system + manual override)
 */
function initializeTheme() {
    const html = document.documentElement;
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    const preferenceKey = 'theme-preference';
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const preferenceOrder = ['system', 'dark', 'light'];
    let currentPreference = localStorage.getItem(preferenceKey) || 'system';

    const getEffectiveTheme = (preference) => {
        if (preference === 'system') {
            return systemPreference.matches ? 'dark' : 'light';
        }
        return preference;
    };

    const updateToggleButton = (button, preference, appliedTheme) => {
        const icon = button.querySelector('i');
        const labelMap = {
            system: 'System theme',
            dark: 'Dark mode',
            light: 'Light mode'
        };
        const iconMap = {
            system: 'fa-desktop',
            dark: 'fa-moon',
            light: 'fa-sun'
        };
        const normalizedPreference = preferenceOrder.includes(preference) ? preference : 'system';
        const currentIndex = Math.max(preferenceOrder.indexOf(normalizedPreference), 0);
        const nextPreference = preferenceOrder[(currentIndex + 1) % preferenceOrder.length];
        if (icon) {
            icon.className = `fas ${iconMap[normalizedPreference]}`;
        }
        button.dataset.themePreference = normalizedPreference;
        button.dataset.themeApplied = appliedTheme;
        button.setAttribute('aria-label', `${labelMap[normalizedPreference]} (click to switch to ${labelMap[nextPreference]})`);
        button.title = `${labelMap[normalizedPreference]} • Currently ${appliedTheme}\nClick to switch to ${labelMap[nextPreference]}`;
    };

    const applyTheme = (preference) => {
        const effectiveTheme = getEffectiveTheme(preference);
        html.setAttribute('data-theme', effectiveTheme);
        html.classList.toggle('theme-dark', effectiveTheme === 'dark');
        document.body.classList.toggle('dark-mode', effectiveTheme === 'dark');
        toggles.forEach((button) => updateToggleButton(button, preference, effectiveTheme));
    };

    const cyclePreference = () => {
        const currentIndex = Math.max(preferenceOrder.indexOf(currentPreference), 0);
        const nextPreference = preferenceOrder[(currentIndex + 1) % preferenceOrder.length];
        currentPreference = nextPreference;
        localStorage.setItem(preferenceKey, currentPreference);
        applyTheme(currentPreference);
    };

    toggles.forEach((button) => {
        button.addEventListener('click', cyclePreference);
    });

    systemPreference.addEventListener('change', () => {
        if (currentPreference === 'system') {
            applyTheme('system');
        }
    });

    applyTheme(currentPreference);
}

/**
 * Form Handlers
 */
function setupFormHandlers() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSignup();
        });
    }
}

/**
 * Login Handler
 */
function handleLogin() {
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Submit form
    const form = document.getElementById('loginForm');
    if (form) {
        form.submit();
    }
}

/**
 * Signup Handler
 */
function handleSignup() {
    const username = document.getElementById('username')?.value;
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    
    if (!username || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // Submit form
    const form = document.getElementById('signupForm');
    if (form) {
        form.submit();
    }
}

/**
 * Demo Account Autofill
 */
function setupDemoAccounts() {
    const demoCards = document.querySelectorAll('.demo-card');
    
    demoCards.forEach(card => {
        card.addEventListener('click', function() {
            const email = this.querySelector('.demo-email').textContent;
            const password = this.querySelector('.demo-password').textContent;
            
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            
            if (emailInput) emailInput.value = email;
            if (passwordInput) passwordInput.value = password;
            
            showNotification(`Demo account loaded: ${email}`, 'info');
        });
    });
}

/**
 * Fill Demo Credentials
 */
function fillDemo(email, password) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) emailInput.value = email;
    if (passwordInput) passwordInput.value = password;
}

/**
 * Email Validation
 */
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Password Strength Checker
 */
function checkPasswordStrength(password) {
    let strength = 'weak';
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;
    
    if (score >= 3) strength = 'strong';
    else if (score >= 2) strength = 'medium';
    
    return strength;
}

/**
 * Notification System
 */
function setupNotifications() {
    const flashNodes = document.querySelectorAll('[data-flash-message]');
    flashNodes.forEach(node => {
        const message = node.dataset.flashMessage;
        const category = node.dataset.flashCategory || 'info';
        const allowed = ['success', 'error', 'warning', 'info'];
        const normalizedType = allowed.includes(category) ? category : 'info';
        if (message) {
            showNotification(message, normalizedType);
        }
        node.remove();
    });
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info') {
    let container = document.querySelector('.notification-container');

    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'notification-icon';
    const iconElement = document.createElement('i');
    iconElement.className = icons[type] || icons.info;
    iconElement.setAttribute('aria-hidden', 'true');
    iconWrapper.appendChild(iconElement);

    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message || '';

    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Dismiss notification');
    closeButton.textContent = '×';

    notification.appendChild(iconWrapper);
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);

    container.appendChild(notification);

    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    const removeNotification = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 250);
    };

    closeButton.addEventListener('click', removeNotification);

    let dismissTimer = setTimeout(removeNotification, 5000);
    notification.addEventListener('mouseenter', () => clearTimeout(dismissTimer));
    notification.addEventListener('mouseleave', () => {
        dismissTimer = setTimeout(removeNotification, 2000);
    });

    return notification;
}

/**
 * Clear All Notifications
 */
function clearNotifications() {
    const container = document.querySelector('.notification-container');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Toggle Password Visibility
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
    }
}

/**
 * Form Input Event Listeners
 */
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.classList.remove('error');
        });
        
        input.addEventListener('blur', function() {
            if (this.id === 'email' && this.value) {
                if (!validateEmail(this.value)) {
                    this.classList.add('error');
                } else {
                    this.classList.remove('error');
                }
            }
        });
    });
});

/**
 * Smooth Scroll
 */
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Session Management
 */
function logout() {
    clearNotifications();
    showNotification('Logging out...', 'info');
    
    setTimeout(() => {
        // Redirect to login
        window.location.href = '/';
    }, 1000);
}

/**
 * Error Handler
 */
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showNotification('An unexpected error occurred', 'error');
});

/**
 * Network Status
 */
window.addEventListener('online', function() {
    showNotification('Connection restored', 'success');
});

window.addEventListener('offline', function() {
    showNotification('Connection lost. Some features may be unavailable', 'warning');
});
