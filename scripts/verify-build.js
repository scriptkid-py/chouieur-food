#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Next.js build...');

// Check if .next directory exists
const nextDir = path.join(process.cwd(), '.next');
if (!fs.existsSync(nextDir)) {
  console.error('❌ .next directory not found!');
  process.exit(1);
}

// Check if build manifest exists
const buildManifest = path.join(nextDir, 'BUILD_ID');
if (!fs.existsSync(buildManifest)) {
  console.error('❌ BUILD_ID not found! Build may be incomplete.');
  process.exit(1);
}

// Check if static directory exists
const staticDir = path.join(nextDir, 'static');
if (!fs.existsSync(staticDir)) {
  console.error('❌ .next/static directory not found!');
  process.exit(1);
}

// Check if server directory exists
const serverDir = path.join(nextDir, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('❌ .next/server directory not found!');
  process.exit(1);
}

console.log('✅ Build verification successful!');
console.log('📁 .next directory structure:');
console.log('   - BUILD_ID: ✅');
console.log('   - static/: ✅');
console.log('   - server/: ✅');

// List some key files
try {
  const buildId = fs.readFileSync(buildManifest, 'utf8').trim();
  console.log(`🏗️  Build ID: ${buildId}`);
} catch (error) {
  console.warn('⚠️  Could not read BUILD_ID');
}

process.exit(0);
