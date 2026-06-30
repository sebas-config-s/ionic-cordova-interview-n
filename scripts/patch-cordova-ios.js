#!/usr/bin/env node

// Xcode 16+ rejects macCatalyst < 13.0.
// cordova-ios@8.1.x Package.swift sets .iOS(.v11), which Xcode 16 treats as macCatalyst 11 — invalid.
// This script patches all Package.swift files in node_modules/cordova-ios, searching recursively.

const fs = require('fs');
const path = require('path');

const cordovaIosRoot = path.join(__dirname, '..', 'node_modules', 'cordova-ios');

function findPackageSwift(dir) {
  const results = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPackageSwift(fullPath));
    } else if (entry.name === 'Package.swift') {
      results.push(fullPath);
    }
  }
  return results;
}

if (!fs.existsSync(cordovaIosRoot)) {
  console.log('[patch-cordova-ios] node_modules/cordova-ios not found — skipping.');
  process.exit(0);
}

const files = findPackageSwift(cordovaIosRoot);

if (files.length === 0) {
  console.log('[patch-cordova-ios] No Package.swift files found in node_modules/cordova-ios.');
  process.exit(0);
}

console.log(`[patch-cordova-ios] Found ${files.length} Package.swift file(s):`);
files.forEach(f => console.log('  -', f));

let patchedCount = 0;

files.forEach((filePath) => {
  const original = fs.readFileSync(filePath, 'utf8');

  const updated = original
    // Fix explicit macCatalyst declarations with version 11
    .replace(/\.macCatalyst\(\.v11[_\d]*\)/g, '.macCatalyst(.v13)')
    .replace(/macCatalyst\("11\.[^"]*"\)/g, 'macCatalyst("13.0")')
    // Fix iOS .v11 (Xcode 16 infers macCatalyst 11 from iOS 11)
    .replace(/\.iOS\(\.v11[_\d]*\)/g, '.iOS(.v13)')
    .replace(/\.iOS\("11\.[^"]*"\)/g, '.iOS("13.0")');

  if (original === updated) {
    console.log('[patch-cordova-ios] No changes needed in:', path.relative(process.cwd(), filePath));
    return;
  }

  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('[patch-cordova-ios] Patched:', path.relative(process.cwd(), filePath));
  patchedCount++;
});

console.log(`[patch-cordova-ios] Done. ${patchedCount} file(s) patched.`);
