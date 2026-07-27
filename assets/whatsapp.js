/**
 * Hakeemi Grocery Store - WhatsApp Integration Module
 * Generates wa.me deep links with formatted order messages
 */

import { getSettings, getShopName, getWhatsAppNumber, getOrderMessageTemplate } from './store.js';
import { formatPrice, getLang } from './i18n.js';

const WHATSAPP_BASE_URL = 'https://wa.me/';

/**
 * Format order items for WhatsApp message
 */
function formatOrderItems(items, lang) {
    return items.map((item, index) => {
        const name = item.name[lang] || item.name.en || 'Unknown';
        const price = formatPrice(item.price);
        const qty = item.quantity || 1;
        const total = formatPrice(item.price * qty);
        return `${index + 1}. ${name} × ${qty} = ${total}`;
    }).join('\n');
}

/**
 * Build WhatsApp message from order data
 */
function buildOrderMessage(order) {
    const settings = getSettings();
    const lang = getLang();
    const shopName = getShopName(lang);
    const currency = settings.currencySymbol || 'AFN';
    
    const itemsText = formatOrderItems(order.items, lang);
    const total = formatPrice(order.total);
    
    const template = getOrderMessageTemplate();
    
    return template
        .replace(/{{shopName}}/g, shopName)
        .replace(/{{items}}/g, itemsText)
        .replace(/{{total}}/g, total)
        .replace(/{{currency}}/g, currency)
        .replace(/{{customerName}}/g, order.customerName || '')
        .replace(/{{customerPhone}}/g, order.customerPhone || 'Not provided');
}

/**
 * Generate WhatsApp deep link
 */
function generateWhatsAppLink(message) {
    const phone = getWhatsAppNumber().replace(/\D/g, ''); // Remove non-digits
    const encodedMessage = encodeURIComponent(message);
    return `${WHATSAPP_BASE_URL}${phone}?text=${encodedMessage}`;
}

/**
 * Open WhatsApp with order
 */
function openWhatsAppOrder(order) {
    const message = buildOrderMessage(order);
    const url = generateWhatsAppLink(message);
    
    // Track event
    window.dispatchEvent(new CustomEvent('whatsapp:open', { 
        detail: { order, url } 
    }));
    
    // Open in new tab/window
    window.open(url, '_blank', 'noopener,noreferrer');
    
    return url;
}

/**
 * Validate phone number (Afghanistan format)
 */
function validateAfghanPhone(phone) {
    if (!phone) return true; // Optional
    const cleaned = phone.replace(/\D/g, '');
    // Afghanistan numbers: 93 + 9 digits (mobile starts with 7)
    return /^93[0-9]{9}$/.test(cleaned);
}

/**
 * Format phone for display
 */
function formatPhoneDisplay(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('93') && cleaned.length === 11) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
}

/**
 * Create order object from cart items
 */
function createOrderFromCart(cart, customerInfo) {
    const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    return {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image
        })),
        total,
        customerName: customerInfo.name?.trim() || '',
        customerPhone: customerInfo.phone?.trim() || '',
        customerNotes: customerInfo.notes?.trim() || '',
        status: 'pending',
        createdAt: Date.now()
    };
}

/**
 * Pre-fill WhatsApp message for testing
 */
function getTestMessage() {
    const lang = getLang();
    const shopName = getShopName(lang);
    return `🛒 *Test Order from ${shopName}*

📦 *Order Details:*
1. Test Product × 2 = ${formatPrice(200)}

💰 *Total: ${formatPrice(200)}
📍 *Delivery: Anaba District, Panjshir*
📞 *Customer: Test User*
📱 *Phone: +93 79 189 7790*

_Order placed via ${shopName} App_`;
}

// Export for ES modules
export {
    WHATSAPP_BASE_URL,
    formatOrderItems,
    buildOrderMessage,
    generateWhatsAppLink,
    openWhatsAppOrder,
    validateAfghanPhone,
    formatPhoneDisplay,
    createOrderFromCart,
    getTestMessage
};