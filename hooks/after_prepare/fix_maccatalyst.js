#!/usr/bin/env node

// Xcode 26+ requires macCatalyst minimum version 13.0.
// cordova-ios@8.1.x generates Package.swift with .macCatalyst(.v11), causing build failure.
// This hook patches the generated file after `cordova prepare ios`.

const fs = require('fs');
const path = require('path');

module.exports = function (ctx) {
  const projectRoot = ctx.opts.projectRoot;
  const targets = [
    path.join(projectRoot, 'platforms/ios/CordovaLib/Package.swift'),
    path.join(projectRoot, 'platforms/ios/App/Package.swift'),
  ];

  targets.forEach((filePath) => {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('.macCatalyst(.v11)')) return;

    content = content.replace(/\.macCatalyst\(\.v11\)/g, '.macCatalyst(.v13)');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[fix_maccatalyst] Patched macCatalyst version in: ${filePath}`);
  });
};
