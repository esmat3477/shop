/**
 * Hakeemi Grocery Store - LocalStorage Management Module
 * Handles all data persistence for products, orders, settings, and auth
 */

// Storage keys
const KEYS = {
    PRODUCTS: 'grocery_products',
    ORDERS: 'grocery_orders',
    SETTINGS: 'grocery_settings',
    PIN_HASH: 'grocery_pin_hash',
    PIN_SALT: 'grocery_pin_salt',
    PIN_ATTEMPTS: 'grocery_pin_attempts',
    PIN_LOCKOUT: 'grocery_pin_lockout',
    LANG: 'grocery_lang'
};

// Default settings
const DEFAULT_SETTINGS = {
    shopName: {
        en: 'Hakeemi Grocery Store',
        fa: 'فروشگاه مواد غذایی حکیمی',
        ps: 'د حکیمي خوراکه فروشۍ'
    },
    whatsappNumber: '93791897790',
    defaultLanguage: 'fa',
    currencySymbol: 'AFN',
    orderMessageTemplate: `🛒 *New Order from {{shopName}}*

📦 *Order Details:*
{{items}}

💰 *Total: {{total}} {{currency}}
📍 *Delivery: Anaba District, Panjshir*
📞 *Customer: {{customerName}}*
📱 *Phone: {{customerPhone}}*

_Order placed via {{shopName}} App_`
};

// Default products (sample data for demo)
const DEFAULT_PRODUCTS = [
    {
        id: 'prod_1',
        name: { en: 'Premium Wheat Flour', fa: 'آرد گندم ممتاز', ps: 'لوی ګندم آرد' },
        price: 450,
        image: null,
        visible: true,
        createdAt: Date.now() - 86400000 * 10
    },
    {
        id: 'prod_2',
        name: { en: 'Sunflower Oil 5L', fa: 'روغن آفتابگردان ۵ لیتری', ps: 'د لمری روغن ۵ لتری' },
        price: 680,
        image: null,
        visible: true,
        createdAt: Date.now() - 86400000 * 8
    },
    {
        id: 'prod_3',
        name: { en: 'Red Kidney Beans', fa: 'لوبیا قرمز', ps: 'سور لوبیا' },
        price: 320,
        image: null,
        visible: true,
        createdAt: Date.now() - 86400000 * 5
    },
    {
        id: 'prod_4',
        name: { en: 'Basmati Rice 10kg', fa: 'برنج بسمتی ۱۰ کیلو', ps: 'بسمتي برنج ۱۰ کګ' },
        price: 1200,
        image: null,
        visible: true,
        createdAt: Date.now() - 86400000 * 3
    },
    {
        id: 'prod_5',
        name: { en: 'Granulated Sugar 1kg', fa: 'شکر قندی ۱ کیلو', ps: 'شکر ۱ کګ' },
        price: 95,
        image: null,
        visible: true,
        createdAt: Date.now() - 86400000 * 1
    },
    {
        id: 'prod_6',
        name: { en: 'Green Tea Box', fa: 'چای سبز جعبه‌دار', ps: 'سبز چای بکس' },
        price: 280,
        image: null,
        visible: true,
        createdAt: Date.now()
    }
];

/**
 * Initialize storage with defaults if empty
 */
function initStorage() {
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
        localStorage.setItem(KEYS.ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
}

/**
 * Generic getter/setter for localStorage
 */
function get(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function set(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Storage error:', e);
        return false;
    }
}

// ===== Products =====
function getProducts() {
    return get(KEYS.PRODUCTS, []);
}

function getVisibleProducts() {
    return getProducts().filter(p => p.visible !== false);
}

function getProduct(id) {
    return getProducts().find(p => p.id === id);
}

function saveProduct(product) {
    const products = getProducts();
    const existingIndex = products.findIndex(p => p.id === product.id);
    
    if (existingIndex >= 0) {
        products[existingIndex] = { ...products[existingIndex], ...product, updatedAt: Date.now() };
    } else {
        products.push({ ...product, id: product.id || `prod_${Date.now()}`, createdAt: Date.now() });
    }
    
    return set(KEYS.PRODUCTS, products);
}

function deleteProduct(id) {
    const products = getProducts().filter(p => p.id !== id);
    return set(KEYS.PRODUCTS, products);
}

function toggleProductVisibility(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
        product.visible = !product.visible;
        return set(KEYS.PRODUCTS, products);
    }
    return false;
}

// ===== Orders =====
function getOrders() {
    return get(KEYS.ORDERS, []).sort((a, b) => b.createdAt - a.createdAt);
}

function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    // Keep only last 500 orders
    if (orders.length > 500) orders.length = 500;
    return set(KEYS.ORDERS, orders);
}

function getOrder(id) {
    return getOrders().find(o => o.id === id);
}

function updateOrderStatus(id, status) {
    const orders = getOrders();
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = status;
        order.updatedAt = Date.now();
        return set(KEYS.ORDERS, orders);
    }
    return false;
}

function getOrdersByDateRange(start, end) {
    return getOrders().filter(o => o.createdAt >= start && o.createdAt <= end);
}

function getTodayOrders() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = start + 86400000;
    return getOrdersByDateRange(start, end);
}

function getWeekOrders() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
    const end = start + 7 * 86400000;
    return getOrdersByDateRange(start, end);
}

function getMonthOrders() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();
    return getOrdersByDateRange(start, end);
}

// ===== Settings =====
function getSettings() {
    return get(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

function saveSettings(settings) {
    const current = getSettings();
    const merged = { ...current, ...settings };
    return set(KEYS.SETTINGS, merged);
}

function getShopName(lang) {
    const settings = getSettings();
    return settings.shopName?.[lang] || settings.shopName?.en || 'Hakeemi Grocery Store';
}

function getWhatsAppNumber() {
    return getSettings().whatsappNumber || '93791897790';
}

function getDefaultLanguage() {
    return getSettings().defaultLanguage || 'fa';
}

function getCurrencySymbol() {
    return getSettings().currencySymbol || 'AFN';
}

function getOrderMessageTemplate() {
    return getSettings().orderMessageTemplate || DEFAULT_SETTINGS.orderMessageTemplate;
}

// ===== PIN Auth =====
function getPinHash() {
    return get(KEYS.PIN_HASH);
}

function getPinSalt() {
    return get(KEYS.PIN_SALT);
}

function savePinHash(hash, salt) {
    set(KEYS.PIN_HASH, hash);
    set(KEYS.PIN_SALT, salt);
}

function clearPin() {
    localStorage.removeItem(KEYS.PIN_HASH);
    localStorage.removeItem(KEYS.PIN_SALT);
}

// ===== PIN Attempts/Lockout =====
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

function getPinAttempts() {
    return get(KEYS.PIN_ATTEMPTS, 0);
}

function incrementPinAttempts() {
    const attempts = getPinAttempts() + 1;
    set(KEYS.PIN_ATTEMPTS, attempts);
    if (attempts >= MAX_ATTEMPTS) {
        set(KEYS.PIN_LOCKOUT, Date.now() + LOCKOUT_DURATION);
    }
    return attempts;
}

function resetPinAttempts() {
    localStorage.removeItem(KEYS.PIN_ATTEMPTS);
    localStorage.removeItem(KEYS.PIN_LOCKOUT);
}

function isPinLocked() {
    const lockout = get(KEYS.PIN_LOCKOUT);
    if (lockout && Date.now() < lockout) {
        return Math.ceil((lockout - Date.now()) / 1000 / 60);
    }
    if (lockout) {
        // Lockout expired
        resetPinAttempts();
    }
    return false;
}

function getLockoutRemainingMinutes() {
    const lockout = get(KEYS.PIN_LOCKOUT);
    if (lockout && Date.now() < lockout) {
        return Math.ceil((lockout - Date.now()) / 1000 / 60);
    }
    return 0;
}

// ===== Language =====
function getLanguage() {
    return get(KEYS.LANG, 'fa');
}

function setLanguage(lang) {
    return set(KEYS.LANG, lang);
}

// ===== Data Export/Import =====
function exportAllData() {
    return {
        products: getProducts(),
        orders: getOrders(),
        settings: getSettings(),
        exportedAt: Date.now(),
        version: '1.0'
    };
}

function importAllData(data) {
    if (!data || typeof data !== 'object') return false;
    
    try {
        if (data.products) set(KEYS.PRODUCTS, data.products);
        if (data.orders) set(KEYS.ORDERS, data.orders);
        if (data.settings) set(KEYS.SETTINGS, data.settings);
        return true;
    } catch {
        return false;
    }
}

function clearAllData() {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}

// ===== Stats =====
function getStats() {
    const orders = getOrders();
    const todayOrders = getTodayOrders();
    const weekOrders = getWeekOrders();
    const monthOrders = getMonthOrders();
    
    const calcRevenue = (orderList) => orderList.reduce((sum, o) => sum + (o.total || 0), 0);
    
    // Top products
    const productSales = {};
    orders.forEach(order => {
        order.items?.forEach(item => {
            const key = item.id;
            if (!productSales[key]) {
                productSales[key] = { id: key, name: item.name, count: 0, revenue: 0 };
            }
            productSales[key].count += item.quantity || 1;
            productSales[key].revenue += (item.price || 0) * (item.quantity || 1);
        });
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    
    return {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        monthOrders: monthOrders.length,
        totalRevenue: calcRevenue(orders),
        todayRevenue: calcRevenue(todayOrders),
        weekRevenue: calcRevenue(weekOrders),
        monthRevenue: calcRevenue(monthOrders),
        topProducts
    };
}

// Initialize on load
initStorage();

// Export for ES modules
export {
    KEYS,
    DEFAULT_SETTINGS,
    DEFAULT_PRODUCTS,
    initStorage,
    get, set,
    getProducts, getVisibleProducts, getProduct, saveProduct, deleteProduct, toggleProductVisibility,
    getOrders, saveOrder, getOrder, updateOrderStatus, getTodayOrders, getTodayOrders, getWeekOrders, getMonthOrders,
    getSettings, saveSettings, getShopName, getWhatsAppNumber, getDefaultLanguage, getCurrencySymbol, getOrderMessageTemplate,
    getPinHash, getPinSalt, savePinHash, clearPin,
    getPinAttempts, incrementPinAttempts, resetPinAttempts, isPinLocked, getLockoutRemainingMinutes,
    MAX_ATTEMPTS, LOCKOUT_DURATION,
    getLanguage, setLanguage,
    exportAllData, importAllData, clearAllData,
    getStats
};