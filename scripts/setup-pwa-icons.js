import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple favicon.ico if it doesn't exist
const faviconPath = path.join(publicDir, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  fs.writeFileSync(faviconPath, '');
  console.log('Created empty favicon.ico');
}

// Create robots.txt if it doesn't exist
const robotsPath = path.join(publicDir, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  fs.writeFileSync(robotsPath, 'User-agent: *\nDisallow:');
  console.log('Created robots.txt');
}

// Create placeholder icons
const iconSizes = [192, 512];
iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  if (!fs.existsSync(iconPath)) {
    fs.writeFileSync(iconPath, '');
    console.log(`Created placeholder icon at ${iconPath}`);
  }
});

console.log('PWA icon setup complete. Please replace the placeholder icons with your actual app icons.');
