# Hakeemi Grocery Store - Online Catalog

A mobile-first, lightweight web application for a local grocery store in Anaba District, Panjshir Province, Afghanistan.

## Features

- **Multilingual Support**: Dari (دری), Pashto (پښتو), and English with RTL/LTR toggle
- **Customer Catalog**: Responsive product grid with images, names, and prices in AFN
- **WhatsApp Ordering**: One-click order via WhatsApp with pre-filled message
- **Admin Dashboard**: Secure PIN-based login with product management and analytics
- **Offline Support**: Service Worker for offline browsing
- **Mobile-First**: Optimized for low-bandwidth networks (3G/rural areas)

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript (ES Modules)
- **Storage**: localStorage (single-device persistence)
- **Auth**: SHA-256 PIN hashing with salt
- **PWA**: Service Worker for offline support

## File Structure

```
/grocery-app/
├── index.html          # Customer catalog view
├── admin.html          # Shopkeeper admin dashboard
├── sw.js               # Service Worker for offline caching
├── assets/
│   ├── i18n.js         # Translations (Dari/Pashto/English)
│   ├── store.js        # localStorage wrapper
│   ├── auth.js         # PIN-based authentication
│   ├── whatsapp.js     # WhatsApp integration
│   ├── app.js          # Customer view logic
│   ├── admin.js        # Admin dashboard logic
│   ├── manifest.json   # PWA manifest
│   └── placeholder.svg # Product placeholder image
└── README.md           # This file
```

## Quick Start

1. **Deploy**: Upload the entire folder to any static hosting (GitHub Pages, Netlify, Apache, Nginx)
2. **Access**: Open `index.html` for customer catalog or `admin.html` for admin dashboard
3. **First Admin Login**: Set a 4-6 digit PIN when prompted
4. **Add Products**: Use the admin dashboard to add your products with names (3 languages), prices, and images
5. **Configure Settings**: Set shop name, WhatsApp number, and default language in admin settings

## Usage

### Customer View (`index.html`)
- Browse products in a responsive grid
- Switch languages using the floating language selector
- Click "Order via WhatsApp" to send order to shopkeeper

### Admin Dashboard (`admin.html`)
- Login with your PIN (set on first visit)
- **Dashboard Tab**: View revenue stats and top products
- **Products Tab**: Add, edit, or delete products
- **Orders Tab**: View and manage customer orders
- **Settings Tab**: Configure shop name, WhatsApp number, and change PIN

## Configuration

### Default Settings
- **Shop Name**: Hakeemi Grocery Store / فروشگاه مواد غذایی حکیمی
- **WhatsApp Number**: +93 79 189 7790
- **Default Language**: Dari (RTL)
- **Currency**: AFN (Afghan Afghani)

### Customization
1. Edit `assets/store.js` to change default products
2. Edit `assets/i18n.js` to modify translations
3. Edit `assets/whatsapp.js` to customize order message template

## Performance Optimizations

- **Lazy Loading**: Images load only when visible
- **Image Compression**: Client-side compression (800px max, 80% quality)
- **Service Worker**: Offline caching for static assets
- **Minimal Bundle**: ~15KB gzipped total (HTML + JS + CSS)
- **CDN**: Tailwind CSS and Google Fonts via CDN

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Android Browser 6+

## Deployment Options

### GitHub Pages (Free)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```
Enable GitHub Pages in repository settings.

### Netlify (Free)
Drag and drop the folder to [Netlify Drop](https://app.netlify.com/drop).

### VPS (Nginx/Apache)
1. Install Nginx or Apache
2. Upload files to `/var/www/grocery`
3. Configure virtual host with SSL (Let's Encrypt)
4. Enable HTTPS for Service Worker support

## Security Notes

- PIN is hashed with SHA-256 + salt
- Lockout after 5 failed attempts (5 minutes)
- Session stored in sessionStorage (cleared on tab close)
- Service Worker requires HTTPS or localhost

## Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS or localhost
- Check browser console for errors
- Try clearing browser cache

### Images Not Loading
- Ensure images are compressed (< 1MB)
- Check localStorage quota (5MB limit)
- Try reducing image dimensions

### RTL Not Working
- Ensure `dir="rtl"` is set on `<html>` tag
- Check that Noto Sans Arabic font is loaded
- Verify RTL CSS styles are applied

## License

MIT License - Free to use and modify

## Support

For issues or questions, please contact:
- **Store**: Hakeemi Grocery Store, Anaba District, Panjshir Province
- **WhatsApp**: +93 79 189 7790