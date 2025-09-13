// copy-vercel-config.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name equivalent to __dirname in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the dist directory exists
if (!fs.existsSync('dist')) {
  console.error('Error: dist directory does not exist. Run build first.');
  process.exit(1);
}

// Copy vercel.json to dist directory
try {
  fs.copyFileSync(
    path.join(__dirname, 'vercel.json'),
    path.join(__dirname, 'dist', 'vercel.json')
  );
  console.log('Successfully copied vercel.json to dist directory');
} catch (error) {
  console.error('Error copying vercel.json:', error);
  process.exit(1);
}