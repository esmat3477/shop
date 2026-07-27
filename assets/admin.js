/**
 * Hakeemi Grocery Store - Admin Dashboard
 * Product management, analytics, and settings
 */

import { initI18n, getLang, t, formatPrice, applyLanguage, getLanguageOptions, formatDate } from './i18n.js';
import { getProducts, getOrders, getStats, getSettings, saveSettings, getShopName, saveProduct, deleteProduct, toggleProductVisibility, exportAllData, importAllData, clearAllData } from './store.js';
import { isPinSet, setPin, verifyPin, checkSession, logout, changePin } from './auth.js';

// App state
let currentTab = 'dashboard';
let editingProduct = null;
let isAdmin = false;

// Initialize admin app
function init() {
    initI18n();
    
    // Check if admin session exists
    if (checkSession()) {
        isAdmin = true;
        showDashboard();
    } else {
        showLoginScreen();
    }
    
    setupEventListeners();
    
    // Listen for language changes
    window.addEventListener('languagechange', () => {
        if (isAdmin) {
            renderCurrentTab();
        }
    });
}

// Show login screen
function showLoginScreen() {
    const app = document.getElementById('app');
    app.innerHTML = renderLoginScreen();
    
    // Re-attach event listeners
    setTimeout(() => attachLoginListeners(), 100);
}

// Render login screen
function renderLoginScreen() {
    const lang = getLang();
    const pinExists = isPinSet();
    const locked = isLockedOut();
    
    return `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
            <div class="w-full max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-800">${pinExists ? t('enterPinTitle') : t('setPinTitle')}</h1>
                        <p class="text-gray-500 mt-2">${pinExists ? t('enterPinDesc') : t('setPinDesc')}</p>
                    </div>
                    
                    ${locked ? `
                        <div class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p class="text-red-600 text-sm text-center">${t('pinLocked')}</p>
                        </div>
                    ` : ''}
                    
                    <form id="pin-form" class="space-y-4">
                        <div>
                            <input type="password" id="pin-input" maxlength="6" pattern="[0-9]{4,6}" required
                                class="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder="${t('pinPlaceholder')}" ${locked ? 'disabled' : ''}>
                        </div>
                        ${!pinExists ? `
                            <div>
                                <input type="password" id="pin-confirm" maxlength="6" pattern="[0-9]{4,6}" required
                                    class="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    placeholder="${t('confirmPinPlaceholder')}" ${locked ? 'disabled' : ''}>
                            </div>
                        ` : ''}
                        
                        <div id="pin-error" class="hidden text-red-500 text-sm text-center"></div>
                        
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" ${locked ? 'disabled' : ''}>
                            ${pinExists ? t('loginBtn') : t('setPinBtn')}
                        </button>
                    </form>
                    
                    ${pinExists ? `
                        <div class="mt-6 text-center">
                            <button id="reset-pin-btn" class="text-red-500 hover:text-red-600 text-sm font-medium">
                                ${t('forgotPin')}
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="text-center mt-6">
                    <a href="index.html" class="text-gray-500 hover:text-gray-700 text-sm">
                        &larr; Back to Store
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Check if PIN is locked
function isLockedOut() {
    const lockout = localStorage.getItem('grocery_pin_lockout');
    if (lockout && Date.now() < parseInt(lockout)) {
        return true;
    }
    if (lockout) {
        localStorage.removeItem('grocery_pin_lockout');
        localStorage.removeItem('grocery_pin_attempts');
    }
    return false;
}

// Attach login event listeners
function attachLoginListeners() {
    const form = document.getElementById('pin-form');
    if (form) {
        form.addEventListener('submit', handlePinSubmit);
    }
    
    const resetBtn = document.getElementById('reset-pin-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handlePinReset);
    }
}

// Handle PIN submission
async function handlePinSubmit(e) {
    e.preventDefault();
    
    const pinInput = document.getElementById('pin-input');
    const pinConfirm = document.getElementById('pin-confirm');
    const errorEl = document.getElementById('pin-error');
    
    const pin = pinInput?.value;
    const pinExists = isPinSet();
    
    if (!pin || pin.length < 4 || pin.length > 6) {
        showError(errorEl, t('pinTooShort'));
        return;
    }
    
    try {
        if (!pinExists) {
            // Set new PIN
            if (!pinConfirm || pin !== pinConfirm.value) {
                showError(errorEl, t('pinMismatch'));
                return;
            }
            await setPin(pin);
            isAdmin = true;
            showDashboard();
        } else {
            // Verify PIN
            const result = await verifyPin(pin);
            if (result.success) {
                isAdmin = true;
                showDashboard();
            }
        }
    } catch (err) {
        const message = err.message;
        if (message === 'locked:' + message.split(':')[1]) {
            showError(errorEl, t('pinLocked'));
        } else if (message.startsWith('invalid:')) {
            const remaining = message.split(':')[1];
            showError(errorEl, `${t('pinInvalid')} ${remaining}`);
        } else if (message === 'not_set') {
            showError(errorEl, t('pinTooShort'));
        } else {
            showError(errorEl, t('pinInvalid'));
        }
    }
}

// Handle PIN reset
async function handlePinReset() {
    if (confirm(t('resetConfirm'))) {
        const newPin = prompt(t('setPinDesc'));
        if (newPin) {
            try {
                clearAllData();
                await setPin(newPin);
                isAdmin = true;
                showDashboard();
            } catch (err) {
                alert(err.message);
            }
        }
    }
}

// Show error message
function showError(el, message) {
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
    }
}

// Show dashboard
function showDashboard() {
    const app = document.getElementById('app');
    app.innerHTML = renderDashboard();
    renderCurrentTab();
    
    // Attach tab listeners
    setTimeout(() => attachTabListeners(), 100);
}

// Render main dashboard layout
function renderDashboard() {
    const lang = getLang();
    const shopName = getShopName(lang);
    
    return `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div class="max-w-7xl mx-auto px-4 py-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-lg font-bold text-gray-800">${t('adminTitle')}</h1>
                                <p class="text-xs text-gray-500">${shopName}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="lang-toggle" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <svg class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                                </svg>
                            </button>
                            <button id="logout-btn" class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            
            <!-- Tab Navigation -->
            <nav class="bg-white border-b border-gray-200 sticky top-[60px] z-30">
                <div class="max-w-7xl mx-auto px-4">
                    <div class="flex gap-1 overflow-x-auto scrollbar-hide">
                        <button data-tab="dashboard" class="tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors text-emerald-600 border-emerald-600">
                            ${t('dashboard')}
                        </button>
                        <button data-tab="products" class="tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors text-gray-500 border-transparent hover:text-gray-700">
                            ${t('products')}
                        </button>
                        <button data-tab="orders" class="tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors text-gray-500 border-transparent hover:text-gray-700">
                            ${t('orders')}
                        </button>
                        <button data-tab="settings" class="tab-btn px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors text-gray-500 border-transparent hover:text-gray-700">
                            ${t('settings')}
                        </button>
                    </div>
                </div>
            </nav>
            
            <!-- Tab Content -->
            <main class="max-w-7xl mx-auto px-4 py-6">
                <div id="tab-content">
                    <!-- Content will be rendered here -->
                </div>
            </main>
        </div>
    `;
}

// Render current tab content
function renderCurrentTab() {
    const content = document.getElementById('tab-content');
    if (!content) return;
    
    switch (currentTab) {
        case 'dashboard':
            content.innerHTML = renderDashboardTab();
            break;
        case 'products':
            content.innerHTML = renderProductsTab();
            break;
        case 'orders':
            content.innerHTML = renderOrdersTab();
            break;
        case 'settings':
            content.innerHTML = renderSettingsTab();
            break;
    }
    
    // Attach tab-specific listeners
    setTimeout(() => attachTabSpecificListeners(), 100);
}

// Render Dashboard tab
function renderDashboardTab() {
    const stats = getStats();
    const lang = getLang();
    
    return `
        <div class="space-y-6">
            <!-- Revenue Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white rounded-xl p-4 border border-gray-200">
                    <p class="text-sm text-gray-500">${t('todayRevenue')}</p>
                    <p class="text-2xl font-bold text-emerald-600 mt-1">${formatPrice(stats.todayRevenue)}</p>
                    <p class="text-xs text-gray-400 mt-2">${stats.todayOrders} ${t('orders')}</p>
                </div>
                <div class="bg-white rounded-xl p-4 border border-gray-200">
                    <p class="text-sm text-gray-500">${t('weekRevenue')}</p>
                    <p class="text-2xl font-bold text-blue-600 mt-1">${formatPrice(stats.weekRevenue)}</p>
                    <p class="text-xs text-gray-400 mt-2">${stats.weekOrders} ${t('orders')}</p>
                </div>
                <div class="bg-white rounded-xl p-4 border border-gray-200">
                    <p class="text-sm text-gray-500">${t('monthRevenue')}</p>
                    <p class="text-2xl font-bold text-purple-600 mt-1">${formatPrice(stats.monthRevenue)}</p>
                    <p class="text-xs text-gray-400 mt-2">${stats.monthOrders} ${t('orders')}</p>
                </div>
            </div>
            
            <!-- Top Products -->
            <div class="bg-white rounded-xl p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-800 mb-4">${t('topProducts')}</h3>
                ${stats.topProducts.length > 0 ? `
                    <div class="space-y-3">
                        ${stats.topProducts.map((product, index) => `
                            <div class="flex items-center justify-between py-2 ${index < stats.topProducts.length - 1 ? 'border-b border-gray-100' : ''}">
                                <div class="flex items-center gap-3">
                                    <span class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                                        ${index + 1}
                                    </span>
                                    <div>
                                        <p class="font-medium text-gray-800">${product.name?.[lang] || product.name?.en || 'Product'}</p>
                                        <p class="text-xs text-gray-500">${product.count} ${t('orders')}</p>
                                    </div>
                                </div>
                                <p class="font-semibold text-emerald-600">${formatPrice(product.revenue)}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p class="text-gray-500 text-center py-4">${t('noOrders')}</p>
                `}
            </div>
            
            <!-- Recent Orders -->
            <div class="bg-white rounded-xl p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-800 mb-4">${t('orders')}</h3>
                ${getOrders().length > 0 ? `
                    <div class="space-y-3">
                        ${getOrders().slice(0, 5).map(order => `
                            <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                <div>
                                    <p class="font-medium text-gray-800">${order.customerName || 'Customer'}</p>
                                    <p class="text-xs text-gray-500">${formatDate(order.createdAt)}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-semibold text-emerald-600">${formatPrice(order.total)}</p>
                                    <p class="text-xs ${getStatusColor(order.status)}">${getStatusText(order.status)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p class="text-gray-500 text-center py-4">${t('noOrders')}</p>
                `}
            </div>
        </div>
    `;
}

// Render Products tab
function renderProductsTab() {
    const products = getProducts();
    
    return `
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-800">${t('products')}</h2>
                <button id="add-product-btn" class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    ${t('addProduct')}
                </button>
            </div>
            
            ${products.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${products.map(product => renderProductCard(product)).join('')}
                </div>
            ` : `
                <div class="bg-white rounded-xl p-8 border border-gray-200 text-center">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-600 mb-2">${t('noProducts')}</h3>
                    <p class="text-gray-500 mb-4">${t('addProduct')}</p>
                    <button class="add-product-empty bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        ${t('addProduct')}
                    </button>
                </div>
            `}
            
            <!-- Product Modal -->
            <div id="product-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                        <div class="flex items-center justify-between">
                            <h2 id="product-modal-title" class="text-lg font-bold text-gray-800">${t('addProduct')}</h2>
                            <button id="close-product-modal" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                                <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="p-6">
                        <form id="product-form" class="space-y-4">
                            <input type="hidden" id="product-id">
                            
                            <!-- Product Name (3 languages) -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">${t('productNameEn')}</label>
                                <input type="text" id="product-name-en" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${t('productNameFa')}</label>
                                    <input type="text" id="product-name-fa" required dir="rtl"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">${t('productNamePs')}</label>
                                    <input type="text" id="product-name-ps" required dir="rtl"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                                </div>
                            </div>
                            
                            <!-- Price -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">${t('productPrice')}</label>
                                <div class="relative">
                                    <input type="number" id="product-price" required min="1" step="1"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors pr-16">
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">AFN</span>
                                </div>
                            </div>
                            
                            <!-- Image Upload -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">${t('productImage')}</label>
                                <div class="flex items-center gap-4">
                                    <label for="product-image-input" class="flex-1 cursor-pointer">
                                        <div id="image-upload-area" class="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-emerald-400 transition-colors">
                                            <svg class="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                            </svg>
                                            <p class="text-sm text-gray-500">${t('uploadImage')}</p>
                                        </div>
                                    </label>
                                    <input type="file" id="product-image-input" accept="image/*" class="hidden">
                                    <div id="image-preview" class="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 hidden">
                                        <img id="image-preview-img" class="w-full h-full object-cover" alt="">
                                    </div>
                                </div>
                                <button type="button" id="remove-image" class="hidden mt-2 text-red-500 hover:text-red-600 text-sm font-medium">
                                    ${t('removeImage')}
                                </button>
                            </div>
                            
                            <!-- Visibility -->
                            <div class="flex items-center gap-3">
                                <input type="checkbox" id="product-visible" checked class="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500">
                                <label for="product-visible" class="text-sm font-medium text-gray-700">${t('productVisible')}</label>
                            </div>
                            
                            <!-- Actions -->
                            <div class="flex gap-3 pt-4">
                                <button type="button" id="cancel-product" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors">
                                    ${t('cancel')}
                                </button>
                                <button type="submit" class="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg">
                                    ${t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render product card in admin
function renderProductCard(product) {
    const lang = getLang();
    const name = product.name?.[lang] || product.name?.en || 'Product';
    const price = formatPrice(product.price);
    const image = product.image || null;
    const placeholder = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" rx="16" fill="#f3f4f6"/><rect x="140" y="120" width="120" height="100" rx="12" stroke="#9ca3af" stroke-width="3" fill="none"/><path d="M170 200 L190 180 L210 200 L230 160 L260 200" stroke="#9ca3af" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="168" cy="145" r="10" stroke="#9ca3af" stroke-width="3" fill="none"/></svg>`);
    
    return `
        <div class="bg-white rounded-xl p-4 border border-gray-200 ${!product.visible ? 'opacity-60' : ''}">
            <div class="flex items-start gap-4">
                <img src="${image || placeholder}" alt="${name}" class="w-16 h-16 rounded-lg object-cover bg-gray-100" onerror="this.src='${placeholder}'">
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-gray-800 truncate">${name}</h3>
                    <p class="text-emerald-600 font-bold">${price}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs px-2 py-1 rounded-full ${product.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}">
                            ${product.visible ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2 mt-4">
                <button class="edit-product flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors" data-id="${product.id}">
                    ${t('edit')}
                </button>
                <button class="toggle-visibility bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg text-sm transition-colors" data-id="${product.id}">
                    ${product.visible ? 'Hide' : 'Show'}
                </button>
                <button class="delete-product bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg text-sm transition-colors" data-id="${product.id}">
                    ${t('delete')}
                </button>
            </div>
        </div>
    `;
}

// Render Orders tab
function renderOrdersTab() {
    const orders = getOrders();
    const lang = getLang();
    
    return `
        <div class="space-y-6">
            <h2 class="text-xl font-bold text-gray-800">${t('orders')}</h2>
            
            ${orders.length > 0 ? `
                <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">${t('orderDate')}</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">${t('orderCustomer')}</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">${t('orderItems')}</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">${t('orderTotal')}</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">${t('orderStatus')}</th>
                                    <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                ${orders.map(order => `
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3 text-sm text-gray-600">${formatDate(order.createdAt)}</td>
                                        <td class="px-4 py-3">
                                            <p class="text-sm font-medium text-gray-800">${order.customerName || 'N/A'}</p>
                                            <p class="text-xs text-gray-500">${order.customerPhone || ''}</p>
                                        </td>
                                        <td class="px-4 py-3">
                                            <p class="text-sm text-gray-600">${order.items?.length || 0} items</p>
                                            <p class="text-xs text-gray-500 truncate max-w-[150px]">${order.items?.map(i => i.name?.[lang] || i.name?.en).join(', ') || ''}</p>
                                        </td>
                                        <td class="px-4 py-3 text-sm font-semibold text-emerald-600">${formatPrice(order.total)}</td>
                                        <td class="px-4 py-3">
                                            <span class="text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}">
                                                ${getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3">
                                            <select class="order-status-select text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-500" data-id="${order.id}">
                                                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>${t('statusPending')}</option>
                                                <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>${t('statusConfirmed')}</option>
                                                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>${t('statusDelivered')}</option>
                                                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>${t('statusCancelled')}</option>
                                            </select>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : `
                <div class="bg-white rounded-xl p-8 border border-gray-200 text-center">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-600">${t('noOrders')}</h3>
                </div>
            `}
        </div>
    `;
}

// Render Settings tab
function renderSettingsTab() {
    const settings = getSettings();
    const lang = getLang();
    
    return `
        <div class="space-y-6">
            <h2 class="text-xl font-bold text-gray-800">${t('settings')}</h2>
            
            <!-- Shop Settings -->
            <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-semibold text-gray-800 mb-4">${t('shopSettings')}</h3>
                <form id="settings-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t('shopNameEn')}</label>
                        <input type="text" id="settings-shopname-en" value="${settings.shopName?.en || ''}"
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">${t('shopNameFa')}</label>
                            <input type="text" id="settings-shopname-fa" value="${settings.shopName?.fa || ''}" dir="rtl"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">${t('shopNamePs')}</label>
                            <input type="text" id="settings-shopname-ps" value="${settings.shopName?.ps || ''}" dir="rtl"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t('whatsappNumber')}</label>
                        <input type="text" id="settings-whatsapp" value="${settings.whatsappNumber || ''}"
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="${t('whatsappNumberHint')}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t('defaultLanguage')}</label>
                        <select id="settings-lang" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                            <option value="en" ${settings.defaultLanguage === 'en' ? 'selected' : ''}>English</option>
                            <option value="fa" ${settings.defaultLanguage === 'fa' ? 'selected' : ''}>Dari (دری)</option>
                            <option value="ps" ${settings.defaultLanguage === 'ps' ? 'selected' : ''}>Pashto (پښتو)</option>
                        </select>
                    </div>
                    <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                        ${t('save')}
                    </button>
                </form>
            </div>
            
            <!-- Change PIN -->
            <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-semibold text-gray-800 mb-4">${t('changePin')}</h3>
                <form id="pin-change-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t('currentPin')}</label>
                        <input type="password" id="current-pin" maxlength="6" pattern="[0-9]{4,6}" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t('newPin')}</label>
                        <input type="password" id="new-pin" maxlength="6" pattern="[0-9]{4,6}" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">${t('confirmNewPin')}</label>
                        <input type="password" id="confirm-new-pin" maxlength="6" pattern="[0-9]{4,6}" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors">
                    </div>
                    <div id="pin-change-error" class="hidden text-red-500 text-sm"></div>
                    <button type="submit" class="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                        ${t('changePin')}
                    </button>
                </form>
            </div>
            
            <!-- Data Management -->
            <div class="bg-white rounded-xl p-6 border border-gray-200">
                <h3 class="font-semibold text-gray-800 mb-4">Data Management</h3>
                <div class="flex gap-4">
                    <button id="export-btn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        ${t('exportData')}
                    </button>
                    <label class="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                        </svg>
                        ${t('importData')}
                        <input type="file" id="import-file" accept=".json" class="hidden">
                    </label>
                </div>
            </div>
        </div>
    `;
}

// Get status color
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-700';
        case 'confirmed': return 'bg-blue-100 text-blue-700';
        case 'delivered': return 'bg-green-100 text-green-700';
        case 'cancelled': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

// Get status text
function getStatusText(status) {
    switch (status) {
        case 'pending': return t('statusPending');
        case 'confirmed': return t('statusConfirmed');
        case 'delivered': return t('statusDelivered');
        case 'cancelled': return t('statusCancelled');
        default: return status;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Language toggle
    document.addEventListener('click', (e) => {
        const langBtn = e.target.closest('#lang-toggle');
        if (langBtn) {
            e.stopPropagation();
            const dropdown = document.getElementById('lang-dropdown');
            dropdown?.classList.toggle('hidden');
        } else {
            document.getElementById('lang-dropdown')?.classList.add('hidden');
        }
        
        // Language selection
        const langOption = e.target.closest('[data-lang]');
        if (langOption) {
            const lang = langOption.dataset.lang;
            applyLanguage(lang);
            document.getElementById('lang-dropdown')?.classList.add('hidden');
        }
    });
}

// Attach tab listeners
function attachTabListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => {
                b.classList.remove('text-emerald-600', 'border-emerald-600');
                b.classList.add('text-gray-500', 'border-transparent');
            });
            btn.classList.remove('text-gray-500', 'border-transparent');
            btn.classList.add('text-emerald-600', 'border-emerald-600');
            currentTab = btn.dataset.tab;
            renderCurrentTab();
        });
    });
    
    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        logout();
        isAdmin = false;
        showLoginScreen();
    });
    
    // Language toggle in dashboard
    document.getElementById('lang-toggle')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const options = getLanguageOptions();
        const lang = getLang();
        const dropdown = document.createElement('div');
        dropdown.id = 'lang-dropdown';
        dropdown.className = 'absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50';
        dropdown.innerHTML = options.map(opt => `
            <button data-lang="${opt.code}" class="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 ${lang === opt.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'}">
                <span class="w-2 h-2 rounded-full ${lang === opt.code ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
                <span class="text-sm font-medium">${opt.label}</span>
            </button>
        `).join('');
        
        const existing = document.getElementById('lang-dropdown');
        if (existing) existing.remove();
        
        document.getElementById('lang-toggle').parentElement.appendChild(dropdown);
        
        // Close on click outside
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        setTimeout(() => document.addEventListener('click', closeDropdown), 100);
    });
}

// Attach tab-specific listeners
function attachTabSpecificListeners() {
    // Add product button
    document.getElementById('add-product-btn')?.addEventListener('click', () => openProductModal());
    document.querySelector('.add-product-empty')?.addEventListener('click', () => openProductModal());
    
    // Edit product buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    
    // Delete product buttons
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteProduct(btn.dataset.id));
    });
    
    // Toggle visibility buttons
    document.querySelectorAll('.toggle-visibility').forEach(btn => {
        btn.addEventListener('click', () => handleToggleVisibility(btn.dataset.id));
    });
    
    // Order status changes
    document.querySelectorAll('.order-status-select').forEach(select => {
        select.addEventListener('change', (e) => {
            import('./store.js').then(({ updateOrderStatus }) => {
                updateOrderStatus(select.dataset.id, select.value);
                renderCurrentTab();
            });
        });
    });
    
    // Product form
    document.getElementById('product-form')?.addEventListener('submit', handleProductFormSubmit);
    
    // Close product modal
    document.getElementById('close-product-modal')?.addEventListener('click', closeProductModal);
    document.getElementById('cancel-product')?.addEventListener('click', closeProductModal);
    
    // Image upload
    document.getElementById('product-image-input')?.addEventListener('change', handleImageUpload);
    document.getElementById('remove-image')?.addEventListener('click', handleRemoveImage);
    
    // Settings form
    document.getElementById('settings-form')?.addEventListener('submit', handleSettingsSubmit);
    
    // PIN change form
    document.getElementById('pin-change-form')?.addEventListener('submit', handlePinChange);
    
    // Export/Import
    document.getElementById('export-btn')?.addEventListener('click', handleExport);
    document.getElementById('import-file')?.addEventListener('change', handleImport);
}

// Open product modal
function openProductModal(product = null) {
    editingProduct = product;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    
    if (product) {
        title.textContent = t('editProduct');
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name-en').value = product.name?.en || '';
        document.getElementById('product-name-fa').value = product.name?.fa || '';
        document.getElementById('product-name-ps').value = product.name?.ps || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-visible').checked = product.visible !== false;
        
        if (product.image) {
            document.getElementById('image-preview').classList.remove('hidden');
            document.getElementById('image-preview-img').src = product.image;
            document.getElementById('remove-image').classList.remove('hidden');
        }
    } else {
        title.textContent = t('addProduct');
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('image-preview').classList.add('hidden');
        document.getElementById('remove-image').classList.add('hidden');
    }
    
    modal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal')?.classList.add('hidden');
    document.body.style.overflow = '';
    editingProduct = null;
}

// Edit product
function editProduct(id) {
    const product = getProducts().find(p => p.id === id);
    if (product) {
        openProductModal(product);
    }
}

// Handle delete product
function handleDeleteProduct(id) {
    if (confirm(t('confirmDelete'))) {
        deleteProduct(id);
        renderCurrentTab();
    }
}

// Handle toggle visibility
function handleToggleVisibility(id) {
    toggleProductVisibility(id);
    renderCurrentTab();
}

// Handle product form submit
function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value || `prod_${Date.now()}`;
    const name = {
        en: document.getElementById('product-name-en').value.trim(),
        fa: document.getElementById('product-name-fa').value.trim(),
        ps: document.getElementById('product-name-ps').value.trim()
    };
    const price = parseInt(document.getElementById('product-price').value, 10);
    const visible = document.getElementById('product-visible').checked;
    
    // Get image from preview
    const imagePreview = document.getElementById('image-preview-img');
    const image = imagePreview?.src || null;
    
    const product = { id, name, price, visible, image };
    
    saveProduct(product);
    closeProductModal();
    renderCurrentTab();
}

// Handle image upload
function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) return;
    
    // Compress and resize image
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 800;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            
            // Show preview
            document.getElementById('image-preview').classList.remove('hidden');
            document.getElementById('image-preview-img').src = compressed;
            document.getElementById('remove-image').classList.remove('hidden');
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

// Handle remove image
function handleRemoveImage() {
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('image-preview-img').src = '';
    document.getElementById('remove-image').classList.add('hidden');
    document.getElementById('product-image-input').value = '';
}

// Handle settings submit
function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const settings = {
        shopName: {
            en: document.getElementById('settings-shopname-en').value.trim(),
            fa: document.getElementById('settings-shopname-fa').value.trim(),
            ps: document.getElementById('settings-shopname-ps').value.trim()
        },
        whatsappNumber: document.getElementById('settings-whatsapp').value.trim(),
        defaultLanguage: document.getElementById('settings-lang').value
    };
    
    saveSettings(settings);
    alert(t('productSaved')); // Reuse success message
}

// Handle PIN change
async function handlePinChange(e) {
    e.preventDefault();
    
    const currentPin = document.getElementById('current-pin').value;
    const newPin = document.getElementById('new-pin').value;
    const confirmNewPin = document.getElementById('confirm-new-pin').value;
    const errorEl = document.getElementById('pin-change-error');
    
    if (newPin !== confirmNewPin) {
        showError(errorEl, t('pinMismatch'));
        return;
    }
    
    if (newPin.length < 4 || newPin.length > 6) {
        showError(errorEl, t('pinTooShort'));
        return;
    }
    
    try {
        await changePin(currentPin, newPin);
        alert(t('pinChanged'));
        document.getElementById('pin-change-form').reset();
    } catch (err) {
        if (err.message === 'current_wrong') {
            showError(errorEl, t('currentPinWrong'));
        } else {
            showError(errorEl, err.message);
        }
    }
}

// Handle export
function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hakeemi-grocery-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Handle import
function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (importAllData(data)) {
                alert(t('importSuccess'));
                renderCurrentTab();
            } else {
                alert(t('importError'));
            }
        } catch {
            alert(t('importError'));
        }
    };
    reader.readAsText(file);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);