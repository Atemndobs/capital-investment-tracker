# Progressive Web App (PWA) Setup

The Capital Investment Tracker is now a fully functional Progressive Web App (PWA) that can be installed on desktop and mobile devices.

## Features

### 🚀 **Installable App**
- Install directly from the browser using the install button in the navbar
- Works on desktop (Chrome, Edge, Safari) and mobile (iOS Safari, Android Chrome)
- Appears in app drawer/start menu like a native app

### 📱 **Mobile-First Design**
- Responsive design that works perfectly on all screen sizes
- Touch-friendly interface optimized for mobile devices
- Adaptive layouts for different screen orientations

### 🔄 **Offline Capability**
- Service worker caches app resources for offline use
- Works without internet connection once installed
- Automatic updates when new versions are available

### 🎨 **Native App Experience**
- Custom app icon using the graph.png design
- Splash screen with brand colors
- Standalone display mode (no browser UI)
- Theme color integration with system UI

## Installation

### Desktop (Chrome/Edge/Safari)
1. Visit the app in your browser
2. Look for the install button (⬇️) in the navbar
3. Click the install button and follow the prompts
4. The app will be added to your applications folder

### Mobile (iOS Safari)
1. Open the app in Safari
2. Tap the Share button (□↗)
3. Select "Add to Home Screen"
4. Customize the name and tap "Add"

### Mobile (Android Chrome)
1. Open the app in Chrome
2. Look for the install banner or tap the menu (⋮)
3. Select "Install app" or "Add to Home screen"
4. Follow the installation prompts

## Technical Details

### PWA Configuration
- **Manifest**: `/manifest.webmanifest` with app metadata
- **Service Worker**: Workbox-powered caching strategy
- **Icons**: Multiple sizes generated from `graph.png`
- **Theme**: Brand purple (#6A4DF3) with dark mode support

### Generated Assets
- `favicon.ico` (16x16, 32x32, 48x48)
- `apple-touch-icon.png` (180x180)
- `icon-192x192.png` (Android)
- `icon-384x384.png` (Android)
- `icon-512x512.png` (Android, maskable)
- `splash-1024x1024.png` (Splash screen)

### Caching Strategy
- **App Shell**: Cached for instant loading
- **Google Fonts**: Cached for 1 year
- **Static Assets**: Precached during installation
- **API Data**: Fresh data with fallback to cache

## Development

### Building PWA Assets
```bash
# Generate all PWA icons from graph.png
npm run generate-pwa-assets

# Build the PWA
npm run build

# Preview the PWA locally
npm run preview
```

### Testing PWA Features
1. Build and serve the app (`npm run build && npm run preview`)
2. Open Chrome DevTools → Application tab
3. Check "Manifest" and "Service Workers" sections
4. Use "Add to homescreen" to test installation
5. Test offline functionality by going offline in DevTools

### Updating Icons
1. Replace `public/icons/graph.png` with your new icon
2. Run `npm run generate-pwa-assets`
3. Rebuild the app with `npm run build`

## Browser Support

### Full PWA Support
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile iOS 11.3+)
- ✅ Firefox (Desktop, limited mobile support)

### Install Prompt Support
- ✅ Chrome/Edge: Automatic install banner + manual button
- ✅ Safari iOS: Manual "Add to Home Screen"
- ✅ Safari Desktop: Manual installation via menu
- ⚠️ Firefox: Limited PWA installation support

## Troubleshooting

### Install Button Not Showing
- Ensure you're using HTTPS (or localhost for development)
- Check that the manifest is valid in DevTools
- Verify service worker is registered successfully
- Some browsers require user engagement before showing install prompt

### Offline Not Working
- Check service worker registration in DevTools
- Verify network requests are being cached
- Clear browser cache and reinstall if needed

### Icons Not Displaying
- Ensure all icon files are present in `/public/icons/`
- Check manifest.webmanifest for correct icon paths
- Verify icon files are properly sized and formatted

## Performance

The PWA is optimized for performance with:
- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Separate chunks for better caching
- **Asset Optimization**: Compressed images and minified code
- **Caching Strategy**: Smart caching for instant subsequent loads

## Security

- **HTTPS Required**: PWAs require secure connections
- **Service Worker Scope**: Limited to app origin
- **Content Security Policy**: Prevents XSS attacks
- **Secure Headers**: Implemented for production deployment
