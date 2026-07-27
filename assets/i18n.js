/**
 * Hakeemi Grocery Store - Internationalization Module
 * Supports Dari (fa), Pashto (ps), English (en) with RTL/LTR support
 */

const I18N = {
    en: {
        dir: 'ltr',
        lang: 'en',
        font: 'Inter',
        labels: {
            // General
            appName: 'Hakeemi Grocery Store',
            loading: 'Loading...',
            offline: 'You\'re offline. Showing cached products.',
            retry: 'Retry',
            close: 'Close',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            search: 'Search',
            noResults: 'No products found',
            confirmDelete: 'Are you sure you want to delete this item?',
            yes: 'Yes',
            no: 'No',

            // Header
            shopName: 'Hakeemi Grocery Store',
            language: 'Language',

            // Product Card
            priceAFN: 'AFN',
            orderWhatsApp: 'Order via WhatsApp',
            productImageAlt: 'Product image',

            // Order Modal
            orderTitle: 'Place Order via WhatsApp',
            customerName: 'Your Name',
            customerPhone: 'Phone Number (optional)',
            customerNotes: 'Notes (optional)',
            placeOrder: 'Send Order',
            orderSuccess: 'Opening WhatsApp...',
            nameRequired: 'Please enter your name',
            phoneInvalid: 'Please enter a valid phone number',

            // Admin Login
            adminTitle: 'Admin Dashboard',
            setPinTitle: 'Set Admin PIN',
            setPinDesc: 'Create a 4-6 digit PIN to secure your dashboard',
            enterPinTitle: 'Enter Admin PIN',
            enterPinDesc: 'Enter your PIN to access the dashboard',
            pinPlaceholder: 'Enter PIN',
            confirmPinPlaceholder: 'Confirm PIN',
            setPinBtn: 'Set PIN',
            loginBtn: 'Login',
            pinMismatch: 'PINs do not match',
            pinTooShort: 'PIN must be 4-6 digits',
            pinInvalid: 'Invalid PIN',
            pinLocked: 'Too many attempts. Try again in 5 minutes.',
            forgotPin: 'Forgot PIN?',
            resetPin: 'Reset PIN',
            resetConfirm: 'This will delete ALL data. Are you sure?',

            // Admin Dashboard
            dashboard: 'Dashboard',
            products: 'Products',
            orders: 'Orders',
            settings: 'Settings',
            logout: 'Logout',

            // Dashboard Stats
            todayRevenue: 'Today\'s Revenue',
            weekRevenue: 'This Week',
            monthRevenue: 'This Month',
            totalOrders: 'Total Orders',
            topProducts: 'Top Products',
            noOrders: 'No orders yet',
            noProducts: 'No products added yet',

            // Product Management
            addProduct: 'Add Product',
            editProduct: 'Edit Product',
            productName: 'Product Name',
            productNameEn: 'Name (English)',
            productNameFa: 'Name (Dari)',
            productNamePs: 'Name (Pashto)',
            productPrice: 'Price (AFN)',
            productImage: 'Product Image',
            uploadImage: 'Upload Image',
            imagePreview: 'Preview',
            removeImage: 'Remove Image',
            productVisible: 'Visible in Catalog',
            saving: 'Saving...',
            productSaved: 'Product saved successfully',
            productDeleted: 'Product deleted successfully',

            // Orders
            orderDate: 'Date',
            orderCustomer: 'Customer',
            orderItems: 'Items',
            orderTotal: 'Total',
            orderStatus: 'Status',
            statusPending: 'Pending',
            statusConfirmed: 'Confirmed',
            statusDelivered: 'Delivered',
            statusCancelled: 'Cancelled',

            // Settings
            shopSettings: 'Shop Settings',
            shopNameEn: 'Shop Name (English)',
            shopNameFa: 'Shop Name (Dari)',
            shopNamePs: 'Shop Name (Pashto)',
            whatsappNumber: 'WhatsApp Number',
            whatsappNumberHint: 'Format: 937xxxxxxxxx (Afghanistan)',
            defaultLanguage: 'Default Language',
            currencySymbol: 'Currency Symbol',
            changePin: 'Change PIN',
            currentPin: 'Current PIN',
            newPin: 'New PIN',
            confirmNewPin: 'Confirm New PIN',
            pinChanged: 'PIN changed successfully',
            currentPinWrong: 'Current PIN is incorrect',
            exportData: 'Export Data',
            importData: 'Import Data',
            importSuccess: 'Data imported successfully',
            importError: 'Invalid data file',

            // Languages
            langEnglish: 'English',
            langDari: 'Dari (دری)',
            langPashto: 'Pashto (پښتو)',

            // Currency
            currencyAFN: 'AFN',
            currencyAFG: 'AFG',
            currencyFa: 'افغانی',

            // Units
            kg: 'kg',
            piece: 'piece',
            pack: 'pack',
            liter: 'L',
        }
    },
    fa: {
        dir: 'rtl',
        lang: 'fa',
        font: 'Noto Sans Arabic',
        labels: {
            // General
            appName: 'فروشگاه مواد غذایی حکیمی',
            loading: 'در حال بارگذاری...',
            offline: 'شما آفلاین هستید. محصولات ذخیره شده نمایش داده می‌شوند.',
            retry: 'تلاش مجدد',
            close: 'بستن',
            save: 'ذخیره',
            cancel: 'لغو',
            delete: 'حذف',
            edit: 'ویرایش',
            add: 'افزودن',
            search: 'جستجو',
            noResults: 'محصولی یافت نشد',
            confirmDelete: 'آیا از حذف این مورد مطمئن هستید؟',
            yes: 'بله',
            no: 'نه',

            // Header
            shopName: 'فروشگاه مواد غذایی حکیمی',
            language: 'زبان',

            // Product Card
            priceAFN: 'افغانی',
            orderWhatsApp: 'سفارش از طریق واتس‌اپ',
            productImageAlt: 'تصویر محصول',

            // Order Modal
            orderTitle: 'ثبت سفارش از طریق واتس‌اپ',
            customerName: 'نام شما',
            customerPhone: 'شماره تلفن (اختیاری)',
            customerNotes: 'یادداشت (اختیاری)',
            placeOrder: 'ارسال سفارش',
            orderSuccess: 'در حال باز کردن واتس‌اپ...',
            nameRequired: 'لطفاً نام خود را وارد کنید',
            phoneInvalid: 'لطفاً شماره تلفن معتبر وارد کنید',

            // Admin Login
            adminTitle: 'پنل مدیریت',
            setPinTitle: 'تنظیم رمز مدیریت',
            setPinDesc: 'یک رمز ۴ تا ۶ رقمی برای امنیت پنل مدیریت تعیین کنید',
            enterPinTitle: 'ورود رمز مدیریت',
            enterPinDesc: 'رمز خود را برای دسترسی به پنل مدیریت وارد کنید',
            pinPlaceholder: 'رمز را وارد کنید',
            confirmPinPlaceholder: 'تأیید رمز',
            setPinBtn: 'تنظیم رمز',
            loginBtn: 'ورود',
            pinMismatch: 'رمزها مطابقت ندارند',
            pinTooShort: 'رمز باید ۴ تا ۶ رقمی باشد',
            pinInvalid: 'رمز نادرست است',
            pinLocked: 'تعداد تلاش‌های بیش از حد. ۵ دقیقه دیگر تلاش کنید.',
            forgotPin: 'رمز را فراموش کرده‌ام؟',
            resetPin: 'بازنشانی رمز',
            resetConfirm: 'این کار تمام داده‌ها را حذف می‌کند. مطمئن هستید؟',

            // Admin Dashboard
            dashboard: 'داشبورد',
            products: 'محصولات',
            orders: 'سفارشات',
            settings: 'تنظیمات',
            logout: 'خروج',

            // Dashboard Stats
            todayRevenue: 'درآمد امروز',
            weekRevenue: 'این هفته',
            monthRevenue: 'این ماه',
            totalOrders: 'کل سفارشات',
            topProducts: 'پرفروش‌ترین محصولات',
            noOrders: 'هنوز سفارشی ثبت نشده',
            noProducts: 'هنوز محصولی اضافه نشده',

            // Product Management
            addProduct: 'افزودن محصول',
            editProduct: 'ویرایش محصول',
            productName: 'نام محصول',
            productNameEn: 'نام (انگلیسی)',
            productNameFa: 'نام (دری)',
            productNamePs: 'نام (پښتو)',
            productPrice: 'قیمت (افغانی)',
            productImage: 'تصویر محصول',
            uploadImage: 'آپلود تصویر',
            imagePreview: 'پیش‌نمایش',
            removeImage: 'حذف تصویر',
            productVisible: 'نمایش در کاتالوگ',
            saving: 'در حال ذخیره...',
            productSaved: 'محصول با موفقیت ذخیره شد',
            productDeleted: 'محصول با موفقیت حذف شد',

            // Orders
            orderDate: 'تاریخ',
            orderCustomer: 'مشتری',
            orderItems: 'اقلام',
            orderTotal: 'مجموع',
            orderStatus: 'وضعیت',
            statusPending: 'در انتظار',
            statusConfirmed: 'تأیید شده',
            statusDelivered: 'تحویل داده شده',
            statusCancelled: 'لغو شده',

            // Settings
            shopSettings: 'تنظیمات فروشگاه',
            shopNameEn: 'نام فروشگاه (انگلیسی)',
            shopNameFa: 'نام فروشگاه (دری)',
            shopNamePs: 'نام فروشگاه (پښتو)',
            whatsappNumber: 'شماره واتس‌اپ',
            whatsappNumberHint: 'فرمت: 937xxxxxxxxx (افغانستان)',
            defaultLanguage: 'زبان پیش‌فرض',
            currencySymbol: 'نماد ارز',
            changePin: 'تغییر رمز',
            currentPin: 'رمز فعلی',
            newPin: 'رمز جدید',
            confirmNewPin: 'تأیید رمز جدید',
            pinChanged: 'رمز با موفقیت تغییر کرد',
            currentPinWrong: 'رمز فعلی نادرست است',
            exportData: 'صادر کردن داده‌ها',
            importData: 'وارد کردن داده‌ها',
            importSuccess: 'داده‌ها با موفقیت وارد شدند',
            importError: 'فایل داده معتبر نیست',

            // Languages
            langEnglish: 'انگلیسی',
            langDari: 'دری',
            langPashto: 'پښتو',

            // Currency
            currencyAFN: 'افغانی',
            currencyAFG: 'افغانی',
            currencyFa: 'افغانی',

            // Units
            kg: 'کیلوگرم',
            piece: 'عدد',
            pack: 'پک',
            liter: 'لیتر',
        }
    },
    ps: {
        dir: 'rtl',
        lang: 'ps',
        font: 'Noto Sans Arabic',
        labels: {
            // General
            appName: 'د حکیمي خوراکه فروشۍ',
            loading: 'لود کیږي...',
            offline: 'تاسو آفلاین یاست. کچې محصولات ښکاره کېدلی.',
            retry: 'دوباره هۀسی',
            close: 'بند کول',
            save: 'ساتل',
            cancel: 'لغو کول',
            delete: ' وا نیول',
            edit: 'سم کول',
            add: 'اضافه کول',
            search: 'لټون',
            noResults: 'هیچ محصول نه موندل شوه',
            confirmDelete: 'ایا تاسو یقین لارئ کولای شی چې دې آیټم وا نهوی؟',
            yes: 'هو',
            no: 'نه',

            // Header
            shopName: 'د حکیمي خوراکه فروشۍ',
            language: 'ژبه',

            // Product Card
            priceAFN: 'افغانی',
            orderWhatsApp: 'د واتس‌اپ له لارې ار гонه کول',
            productImageAlt: 'د محصول انځور',

            // Order Modal
            orderTitle: 'د واتس‌اپ له لارې ار гонه کول',
            customerName: 'ستاسو نوم',
            customerPhone: 'تلفون نومر (اختیاري)',
            customerNotes: 'یادداشتونه (اختیاري)',
            placeOrder: 'ارгонه ولکول',
            orderSuccess: 'واتس‌اپ واز کېږي...',
            nameRequired: 'مهرباني وکړئ ستاسو نوم وکړئ',
            phoneInvalid: 'مهرباني وکړئ معتبر تلیفون نومر وکړئ',

            // Admin Login
            adminTitle: 'پنل مدیریت',
            setPinTitle: 'د مدیریت PIN تنظیم کول',
            setPinDesc: 'د پنل مدیریت لپاره ۴ تا ۶ رقمی PIN جوړه کړئ',
            enterPinTitle: 'د مدیریت PIN ورکول',
            enterPinDesc: 'د نړیوالی لپاره خپله PIN ورکړئ',
            pinPlaceholder: 'PIN ورکړئ',
            confirmPinPlaceholder: 'PIN تایید کړئ',
            setPinBtn: 'PIN تنظیم کړئ',
            loginBtn: 'ورځئ',
            pinMismatch: 'PINونه په توګه نه سمleşت',
            pinTooShort: 'PIN باید ۴ تا ۶ رقمی و باشد',
            pinInvalid: 'PIN ناکام شوی',
            pinLocked: 'ډیر هڅه. ۵ دقیقه مخ کښه وهښته.',
            forgotPin: 'PIN یادم نه غوږ؟',
            resetPin: 'PIN تازه کړئ',
            resetConfirm: 'دا ټول داتا په انحطاط کېږي. یقین یاست؟',

            // Admin Dashboard
            dashboard: 'ډیشبورډ',
            products: 'محصولات',
            orders: 'ارګونه',
            settings: 'تنظیمات',
            logout: 'خروج',

            // Dashboard Stats
            todayRevenue: 'نن يو ايصال',
            weekRevenue: 'د اوسني ہفتې',
            monthRevenue: 'د اوسني مېشتې',
            totalOrders: 'ټول ارګونه',
            topProducts: 'سړی محصولات',
            noOrders: 'هیڅ ارګونې نه شتون لري',
            noProducts: 'هیڅ محصول اضافه نه شوی',

            // Product Management
            addProduct: 'محصول اضافه کړئ',
            editProduct: 'محصول سم کړئ',
            productName: 'د محصول نوم',
            productNameEn: 'نوم (انګلیسي)',
            productNameFa: 'نوم (دري)',
            productNamePs: 'نوم (پښتو)',
            productPrice: 'قیمت (افغانی)',
            productImage: 'د محصول انځور',
            uploadImage: 'انځور اپ لوډ کول',
            imagePreview: 'پریویو',
            removeImage: 'انځور وا نیول',
            productVisible: 'د کاتالوګ کې ښکاره کړئ',
            saving: 'ساتل کیږي...',
            productSaved: 'محصول بریالیتوب سره ساتل شوه',
            productDeleted: 'محصول بریالیتوب سره وا نیول شوه',

            // Orders
            orderDate: 'نیته',
            orderCustomer: 'ست编者',
            orderItems: 'ایټمونه',
            orderTotal: 'ټول',
            orderStatus: 'סטاتوس',
            statusPending: 'چېکات',
            statusConfirmed: 'تایید شوی',
            statusDelivered: 'ورسول شوی',
            statusCancelled: 'منسوخ شوی',

            // Settings
            shopSettings: 'د دوکان تنظیمات',
            shopNameEn: 'د دوکان نوم (انګلیسي)',
            shopNameFa: 'د دوکان نوم (دری)',
            shopNamePs: 'د دوکان نوم (پښتو)',
            whatsappNumber: 'واتس‌اپ نومر',
            whatsappNumberHint: 'فورمټ: 937xxxxxxxxx (افغانستان)',
            defaultLanguage: 'پیش‌فرض ژبه',
            currencySymbol: 'د ارز سمبول',
            changePin: 'PIN بدل کړئ',
            currentPin: 'اوسنی PIN',
            newPin: 'نوی PIN',
            confirmNewPin: 'نوی PIN تایید کړئ',
            pinChanged: 'PIN بریالیتوب سره بدل شوه',
            currentPinWrong: 'اوسنی PIN ناکام شوی',
            exportData: 'داتा برونtákول',
            importData: 'داتा درونtákول',
            importSuccess: 'داتا بریالیتوب سره درونtákل شوه',
            importError: 'د داتو فایل معتبر نه دی',

            // Languages
            langEnglish: 'انګلیسي',
            langDari: 'دری',
            langPashto: 'پښتو',

            // Currency
            currencyAFN: 'افغانی',
            currencyAFG: 'افغانی',
            currencyFa: 'افغانی',

            // Units
            kg: 'کيلوګرام',
            piece: 'تکه',
            pack: 'پکیج',
            liter: 'ليټر',
        }
    }
};

// Current language state
let currentLang = 'fa';

// Initialize language from localStorage
function initI18n() {
    const savedLang = localStorage.getItem('grocery_lang');
    if (savedLang && I18N[savedLang]) {
        currentLang = savedLang;
    }
    applyLanguage(currentLang);
    return currentLang;
}

// Get current language
function getLang() {
    return currentLang;
}

// Get current language config
function getLangConfig() {
    return I18N[currentLang];
}

// Apply language to document
function applyLanguage(lang) {
    if (!I18N[lang]) lang = 'fa';
    currentLang = lang;
    const config = I18N[lang];
    document.documentElement.setAttribute('dir', config.dir);
    document.documentElement.setAttribute('lang', config.lang);
    document.documentElement.classList.toggle('rtl', config.dir === 'rtl');
    localStorage.setItem('grocery_lang', lang);
    // Update font
    updateFont(config.font);
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang, config } }));
}

// Update font based on language
function updateFont(fontFamily) {
    document.documentElement.style.setProperty('--font-primary', `'${fontFamily}', system-ui, sans-serif`);
}

// Translate key
function t(key, params = {}) {
    const keys = key.split('.');
    let value = I18N[currentLang].labels;
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to English
            value = I18N.en.labels;
            for (const k2 of keys) {
                if (value && typeof value === 'object' && k2 in value) {
                    value = value[k2];
                } else {
                    return key; // Return key if not found
                }
            }
            break;
        }
    }
    // Replace parameters
    if (typeof value === 'string') {
        return value.replace(/\{(\w+)\}/g, (match, param) => params[param] || match);
    }
    return value;
}

// Translate multiple keys
function tAll(keys) {
    const result = {};
    for (const key of keys) {
        result[key] = t(key);
    }
    return result;
}

// Format price with currency
function formatPrice(amount) {
    const config = I18N[currentLang];
    const symbol = config.labels.currencyAFN;
    const formatted = Number(amount).toLocaleString(config.lang === 'fa' ? 'fa-AF' : config.lang === 'ps' ? 'ps-AF' : 'en-US');
    return config.dir === 'rtl' ? `${formatted} ${symbol}` : `${symbol} ${formatted}`;
}

// Format date
function formatDate(date) {
    const config = I18N[currentLang];
    const locale = config.lang === 'fa' ? 'fa-AF' : config.lang === 'ps' ? 'ps-AF' : 'en-US';
    return new Date(date).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date time
function formatDateTime(date) {
    const config = I18N[currentLang];
    const locale = config.lang === 'fa' ? 'fa-AF' : config.lang === 'ps' ? 'ps-AF' : 'en-US';
    return new Date(date).toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Language selector options
function getLanguageOptions() {
    return [
        { code: 'en', label: I18N.en.labels.langEnglish, nativeLabel: 'English' },
        { code: 'fa', label: I18N.fa.labels.langDari, nativeLabel: 'دری' },
        { code: 'ps', label: I18N.ps.labels.langPashto, nativeLabel: 'پښتو' }
    ];
}

// Export for ES modules
export { I18N, initI18n, getLang, getLangConfig, applyLanguage, t, tAll, formatPrice, formatDate, formatDateTime, getLanguageOptions };