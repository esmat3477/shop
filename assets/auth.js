/**
 * Hakeemi Grocery Store - Authentication Module
 * PIN-based auth with SHA-256 hashing, salt, and lockout protection
 */

import { STORAGE_KEYS } from './store.js';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple SHA-256 implementation using Web Crypto API
async function hashPin(pin, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pin + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Check if PIN is locked out
function isLockedOut() {
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.PIN_LOCKOUT) || '0', 10);
    return Date.now() < lockoutUntil;
}

// Get remaining lockout time in seconds
function getLockoutRemaining() {
    const lockoutUntil = parseInt(localStorage.getItem(STORAGE_KEYS.PIN_LOCKOUT) || '0', 10);
    return Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
}

// Record failed attempt
function recordFailedAttempt() {
    const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.PIN_ATTEMPTS) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.PIN_ATTEMPTS, attempts.toString());
    
    if (attempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem(STORAGE_KEYS.PIN_LOCKOUT, lockoutUntil.toString());
    }
    
    return attempts;
}

// Clear failed attempts (on successful login)
function clearFailedAttempts() {
    localStorage.removeItem(STORAGE_KEYS.PIN_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.PIN_LOCKOUT);
}

// Check if PIN is set
function isPinSet() {
    return !!localStorage.getItem(STORAGE_KEYS.PIN_HASH);
}

// Set PIN (first time or change)
async function setPin(pin) {
    if (!pin || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
        throw new Error('PIN must be 4-6 digits');
    }
    
    const salt = generateSalt();
    const hash = await hashPin(pin, salt);
    
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
    localStorage.setItem(STORAGE_KEYS.PIN_SALT, salt);
    clearFailedAttempts();
    
    return true;
}

// Verify PIN
async function verifyPin(pin) {
    if (isLockedOut()) {
        const remaining = getLockoutRemaining();
        throw new Error(`locked:${remaining}`);
    }
    
    const storedHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    const salt = localStorage.getItem(STORAGE_KEYS.PIN_SALT);
    
    if (!storedHash || !salt) {
        throw new Error('not_set');
    }
    
    const hash = await hashPin(pin, salt);
    
    if (hash === storedHash) {
        clearFailedAttempts();
        // Create session
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        return { success: true };
    } else {
        const attempts = recordFailedAttempt();
        if (attempts >= MAX_ATTEMPTS) {
            throw new Error(`locked:${getLockoutRemaining()}`);
        }
        throw new Error(`invalid:${MAX_ATTEMPTS - attempts}`);
    }
}

// Check if admin session is valid
function checkSession() {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
}

// Logout (clear session)
function logout() {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
}

// Reset PIN (clears all data, requires confirmation)
async function resetPin(newPin) {
    if (!newPin || newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
        throw new Error('PIN must be 4-6 digits');
    }
    
    // Clear all data except language
    Object.values(STORAGE_KEYS).forEach(key => {
        if (key !== STORAGE_KEYS.LANG) {
            localStorage.removeItem(key);
        }
    });
    
    // Set new PIN
    const salt = generateSalt();
    const hash = await hashPin(newPin, salt);
    
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
    localStorage.setItem(STORAGE_KEYS.PIN_SALT, salt);
    clearFailedAttempts();
    
    // Create session
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    
    return true;
}

// Change PIN (requires current PIN)
async function changePin(currentPin, newPin) {
    if (!currentPin || !newPin) {
        throw new Error('Both current and new PIN required');
    }
    
    if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
        throw new Error('PIN must be 4-6 digits');
    }
    
    // Verify current PIN first
    const verified = await verifyPin(currentPin);
    if (!verified.success) {
        throw new Error('current_wrong');
    }
    
    // Set new PIN
    const salt = generateSalt();
    const hash = await hashPin(newPin, salt);
    
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, hash);
    localStorage.setItem(STORAGE_KEYS.PIN_SALT, salt);
    
    return true;
}

// Get remaining attempts
function getRemainingAttempts() {
    const attempts = parseInt(localStorage.getItem(STORAGE_KEYS.PIN_ATTEMPTS) || '0', 10);
    return Math.max(0, MAX_ATTEMPTS - attempts);
}

// Export for ES modules
export {
    isPinSet,
    setPin,
    verifyPin,
    checkSession,
    logout,
    resetPin,
    changePin,
    isLockedOut,
    getLockoutRemaining,
    getRemainingAttempts,
    MAX_ATTEMPTS,
    LOCKOUT_DURATION
};