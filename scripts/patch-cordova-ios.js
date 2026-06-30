#!/usr/bin/env node

// Xcode 26+ rejects macCatalyst < 13.0 in Package.swift files.
// cordova-ios@8.1.x ships with .macCatalyst(.v11) which breaks Swift Package resolution.
// This script patches the CordovaLib Package.swift in node_modules after npm install.

const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '..', 'node_modules', 'cordova-ios', 'CordovaLib', 'Package.swift'),
  path.join(__dirname, '..', 'node_modules', 'cordova-ios', 'Package.swift'),
];

let patched = false;

targets.forEach((filePath) => {
  if (!fs.existsSync(filePath)) return;

  const original = fs.readFileSync(filePath, 'utf8');
  const updated = original
    .replace(/\.macCatalyst\(\.v11\)/g, '.macCatalyst(.v13)')
    .replace(/macCatalyst\("11\.0"\)/g, 'macCatalyst("13.0")');

  if (original === updated) return;

  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('[patch-cordova-ios] Patched macCatalyst 11 -> 13 in:', filePath);
  patched = true;
});

if (!patched) {
  console.log('[patch-cordova-ios] No Package.swift with macCatalyst(.v11) found — skipping.');
}
