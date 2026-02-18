// Simple script to create ESM version and copy assets
const fs = require('fs');
const path = require('path');

// Create ESM version manually with proper export syntax
const esmContent = `/**
 * Public API Surface of @ngx-tools/dual-datepicker
 */

export { DualDatepickerComponent } from './dual-datepicker.component.js';
`;

// Write the ESM version
fs.writeFileSync(path.join(__dirname, 'dist', 'index.esm.js'), esmContent);

// Copy HTML and SCSS files to dist
fs.copyFileSync(
  path.join(__dirname, 'src', 'dual-datepicker.component.html'),
  path.join(__dirname, 'dist', 'dual-datepicker.component.html')
);

fs.copyFileSync(
  path.join(__dirname, 'src', 'dual-datepicker.component.scss'),
  path.join(__dirname, 'dist', 'dual-datepicker.component.scss')
);

console.log('✅ ESM version created successfully');
console.log('✅ Component assets copied to dist');
