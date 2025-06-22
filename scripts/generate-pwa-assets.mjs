import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const SIZES = [
  { size: 16, name: 'favicon.ico' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 1024, name: 'splash-1024x1024.png' },
];

const INPUT_ICON = 'public/icons/stats.jpg';

const OUTPUT_DIR = 'public/icons';

async function generateAssets() {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Generate all icon sizes
    for (const { size, name } of SIZES) {
      const outputPath = path.join(OUTPUT_DIR, name);
      await sharp(INPUT_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toFile(outputPath);
      console.log(`Generated: ${outputPath}`);
    }

    // Generate favicon.ico with multiple sizes
    const faviconSizes = [16, 32, 48];
    await sharp(INPUT_ICON)
      .resize(Math.max(...faviconSizes), Math.max(...faviconSizes), {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .toFile(path.join(OUTPUT_DIR, 'favicon.ico'));

    console.log('\n✅ All PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
}

generateAssets();
