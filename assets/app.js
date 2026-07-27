/**
 * Hakeemi Grocery Store - Customer Catalog App
 * Mobile-first product catalog with WhatsApp ordering
 */

import { initI18n, getLang, t, formatPrice, applyLanguage, getLanguageOptions } from './i18n.js';
import { getVisibleProducts, getShopName, getWhatsAppNumber, saveOrder, getSettings } from './store.js';
import { openWhatsAppOrder, validateAfghanPhone, createOrderFromCart } from './whatsapp.js';

// App state
let cart = [];
let selectedProduct = null;

// Initialize app
function init() {
    initI18n();
    renderApp();
    setupEventListeners();
    
    // Listen for language changes
    window.addEventListener('languagechange', () => {
        renderApp();
    });
    
    // Online/offline detection
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    updateOfflineStatus();
}

// Update offline status
function updateOfflineStatus() {
    const banner = document.getElementById('offline-banner');
    if (banner) {
        banner.classList.toggle('hidden', navigator.onLine);
    }
}

// Render the entire app
function renderApp() {
    const lang = getLang();
    const products = getVisibleProducts();
    const shopName = getShopName(lang);
    const isRTL = document.documentElement.dir === 'rtl';
    
    document.title = shopName;
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
            ${renderOfflineBanner()}
            ${renderHeader(shopName)}
            ${renderLanguageSelector()}
            ${products.length > 0 ? renderProductGrid(products) : renderEmptyState()}
            ${renderOrderModal()}
            ${renderFooter()}
        </div>
    `;
    
    // Re-attach event listeners
    attachProductListeners();
}

// Render offline banner
function renderOfflineBanner() {
    return `
        <div id="offline-banner" class="hidden bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium sticky top-0 z-50">
            ${t('offline')}
        </div>
    `;
}

// Render header
function renderHeader(shopName) {
    return `
        <header class="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-lg md:text-xl font-bold leading-tight">${shopName}</h1>
                            <p class="text-xs text-emerald-100">${t('appName') === shopName ? '' : t('appName')}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <a href="admin.html" class="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                            ${t('adminTitle')}
                        </a>
                    </div>
                </div>
            </div>
        </header>
    `;
}

// Render language selector
function renderLanguageSelector() {
    const currentLang = getLang();
    const options = getLanguageOptions();
    const isRTL = document.documentElement.dir === 'rtl';
    
    return `
        <div class="fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50">
            <div class="relative">
                <button id="lang-toggle" class="bg-white shadow-lg rounded-full p-3 hover:shadow-xl transition-all duration-200 border border-gray-200 flex items-center gap-2" aria-label="${t('language')}">
                    <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
                    </svg>
                    <span class="text-sm font-medium text-gray-700">${options.find(o => o.code === currentLang)?.nativeLabel || 'FA'}</span>
                </button>
                <div id="lang-dropdown" class="hidden absolute bottom-14 ${isRTL ? 'left-0' : 'right-0'} bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
                    ${options.map(opt => `
                        <button data-lang="${opt.code}" class="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors flex items-center gap-3 ${currentLang === opt.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'}">
                            <span class="w-2 h-2 rounded-full ${currentLang === opt.code ? 'bg-emerald-500' : 'bg-gray-300'}"></span>
                            <span class="text-sm font-medium">${opt.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Render product grid
function renderProductGrid(products) {
    return `
        <main class="max-w-7xl mx-auto px-4 py-6 pb-24">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                ${products.map(product => renderProductCard(product)).join('')}
            </div>
        </main>
    `;
}

// Render single product card
function renderProductCard(product) {
    const lang = getLang();
    const name = product.name?.[lang] || product.name?.en || 'Product';
    const price = formatPrice(product.price);
    const image = product.image || null;
    const placeholder = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" rx="16" fill="#f3f4f6"/><rect x="140" y="120" width="120" height="100" rx="12" stroke="#9ca3af" stroke-width="3" fill="none"/><path d="M170 200 L190 180 L210 200 L230 160 L260 200" stroke="#9ca3af" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="168" cy="145" r="10" stroke="#9ca3af" stroke-width="3" fill="none"/><rect x="120" y="240" width="160" height="8" rx="4" fill="#d1d5db"/><rect x="150" y="260" width="100" height="8" rx="4" fill="#d1d5db"/></svg>`);
    
    return `
        <div class="product-card bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group" data-product-id="${product.id}">
            <div class="relative aspect-square bg-gray-50 overflow-hidden">
                <img 
                    src="${image || placeholder}" 
                    alt="${name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    onerror="this.src='${placeholder}'"
                >
                <div class="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    ${price}
                </div>
            </div>
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 text-base mb-3 line-clamp-2 min-h-[2.5rem]">${name}</h3>
                <button 
                    class="order-btn w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                    data-product-id="${product.id}"
                >
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    ${t('orderWhatsApp')}
                </button>
            </div>
        </div>
    `;
}

// Render empty state
function renderEmptyState() {
    return `
        <main class="max-w-7xl mx-auto px-4 py-12 pb-24">
            <div class="text-center py-12">
                <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-600 mb-2">${t('noResults')}</h2>
                <p class="text-gray-500">${t('noProducts')}</p>
            </div>
        </main>
    `;
}

// Render order modal
function renderOrderModal() {
    return `
        <div id="order-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div class="flex items-center justify-between">
                        <h2 class="text-lg font-bold text-gray-800">${t('orderTitle')}</h2>
                        <button id="close-modal" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                            <svg class="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="order-product-info" class="bg-gray-50 rounded-xl p-4 mb-6">
                        <!-- Product info will be inserted here -->
                    </div>
                    <form id="order-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">${t('customerName')} *</label>
                            <input type="text" id="customer-name" required class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="${t('customerName')}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">${t('customerPhone')}</label>
                            <input type="tel" id="customer-phone" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors" placeholder="0791897790">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">${t('customerNotes')}</label>
                            <textarea id="customer-notes" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none" placeholder="${t('customerNotes')}"></textarea>
                        </div>
                        <div class="flex gap-3 pt-2">
                            <button type="button" id="cancel-order" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors">
                                ${t('cancel')}
                            </button>
                            <button type="submit" class="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                ${t('placeOrder')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
}

// Render footer
function renderFooter() {
    const lang = getLang();
    const shopName = getShopName(lang);
    return `
        <footer class="bg-gray-800 text-white py-6 mt-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
                <p class="text-sm text-gray-400">&copy; ${new Date().getFullYear()} ${shopName}</p>
                <p class="text-xs text-gray-500 mt-1">Anaba District, Panjshir Province, Afghanistan</p>
            </div>
        </footer>
    `;
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
    
    // Order button click
    document.addEventListener('click', (e) => {
        const orderBtn = e.target.closest('.order-btn');
        if (orderBtn) {
            const productId = orderBtn.dataset.productId;
            openOrderModal(productId);
        }
    });
    
    // Modal close
    document.addEventListener('click', (e) => {
        if (e.target.closest('#close-modal') || e.target.closest('#cancel-order')) {
            closeOrderModal();
        }
        if (e.target.id === 'order-modal') {
            closeOrderModal();
        }
    });
    
    // Order form submission
    document.addEventListener('submit', (e) => {
        if (e.target.id === 'order-form') {
            e.preventDefault();
            handleOrderSubmission();
        }
    });
}

// Attach product card event listeners
function attachProductListeners() {
    // Already handled by event delegation
}

// Open order modal
function openOrderModal(productId) {
    const lang = getLang();
    const products = getVisibleProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    selectedProduct = product;
    const name = product.name?.[lang] || product.name?.en || 'Product';
    const price = formatPrice(product.price);
    const image = product.image || null;
    const placeholder = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" rx="16" fill="#f3f4f6"/><rect x="140" y="120" width="120" height="100" rx="12" stroke="#9ca3af" stroke-width="3" fill="none"/><path d="M170 200 L190 180 L210 200 L230 160 L260 200" stroke="#9ca3af" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="168" cy="145" r="10" stroke="#9ca3af" stroke-width="3" fill="none"/><rect x="120" y="240" width="160" height="8" rx="4" fill="#d1d5db"/><rect x="150" y="260" width="100" height="8" rx="4" fill="#d1d5db"/></svg>`);
    
    const productInfo = document.getElementById('order-product-info');
    if (productInfo) {
        productInfo.innerHTML = `
            <div class="flex items-center gap-4">
                <img src="${image || placeholder}" alt="${name}" class="w-16 h-16 rounded-xl object-cover bg-gray-200" onerror="this.src='${placeholder}'">
                <div>
                    <h3 class="font-semibold text-gray-800">${name}</h3>
                    <p class="text-emerald-600 font-bold">${price}</p>
                </div>
            </div>
        `;
    }
    
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.getElementById('customer-name')?.focus();
    }
}

// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
    selectedProduct = null;
    document.getElementById('order-form')?.reset();
}

// Handle order submission
function handleOrderSubmission() {
    if (!selectedProduct) return;
    
    const name = document.getElementById('customer-name')?.value?.trim();
    const phone = document.getElementById('customer-phone')?.value?.trim();
    const notes = document.getElementById('customer-notes')?.value?.trim();
    
    if (!name) {
        alert(t('nameRequired'));
        return;
    }
    
    if (phone && !validateAfghanPhone(phone)) {
        alert(t('phoneInvalid'));
        return;
    }
    
    // Create order
    const order = createOrderFromCart(
        [{ ...selectedProduct, quantity: 1 }],
        { name, phone, notes }
    );
    
    // Save order to local storage
    saveOrder(order);
    
    // Open WhatsApp
    openWhatsAppOrder(order);
    
    // Close modal
    closeOrderModal();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('../sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}