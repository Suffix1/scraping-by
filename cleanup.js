const fs = require('fs');
const path = require('path');

// List of diagnostic files to remove
const filesToRemove = [
    'check-prices-custom.js',
    'check-third-product.js',
    'check-third-product-updated.js',
    'check-third-product-fixed.js',
    'direct-product-check.js',
    'debug-screenshot.png',
    'product-page.png',
    'product-after-interaction.png',
    'product-before-interaction.png',
    'third-product-page.html',
    'third-product-updated.png',
    'third-product-screenshot.png',
    'page-content.html',
    'json-ld-data.json',
    'cleanup.js' // Remove self
];

console.log('Cleaning up diagnostic files...');

let removed = 0;
let skipped = 0;

// Remove each file
filesToRemove.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✓ Removed: ${file}`);
            removed++;
        } else {
            console.log(`⚠ Skipped: ${file} (not found)`);
            skipped++;
        }
    } catch (error) {
        console.error(`✗ Error removing ${file}:`, error.message);
        skipped++;
    }
});

console.log(`\nCleanup complete: ${removed} files removed, ${skipped} files skipped.`); 