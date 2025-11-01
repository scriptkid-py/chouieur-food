/**
 * =============================================================================
 * TEST PHOTO UPLOAD FUNCTIONALITY
 * =============================================================================
 * 
 * This script tests the menu item photo upload endpoint to verify:
 * 1. FormData is correctly parsed by multer
 * 2. All text fields (name, description, price) are received
 * 3. Image file is uploaded correctly
 * 4. Response is successful
 * 
 * Run with: node scripts/test-photo-upload.js
 */

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

async function testPhotoUpload() {
  console.log('🧪 Testing Photo Upload Functionality\n');
  console.log(`📍 API URL: ${API_BASE_URL}/api/menu-items\n`);

  // Create a simple test image if it doesn't exist
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('📝 Creating test image...');
    // Create a minimal 1x1 PNG in memory
    const { createCanvas } = require('canvas');
    const canvas = createCanvas(1, 1);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(TEST_IMAGE_PATH, buffer);
    console.log('✅ Test image created\n');
  }

  try {
    // Create FormData
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', 'Test Menu Item');
    formData.append('description', 'This is a test menu item for photo upload');
    formData.append('price', '15.99');
    formData.append('category', 'Sandwiches');
    formData.append('isActive', 'true');

    // Add image file
    const imageStream = fs.createReadStream(TEST_IMAGE_PATH);
    formData.append('image', imageStream, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });

    console.log('📤 Sending FormData request...');
    console.log('  Fields:');
    for (const [key, value] of formData._streams) {
      if (typeof value === 'object' && value.filename) {
        console.log(`    ${key}: [File] ${value.filename}`);
      } else if (typeof value !== 'function') {
        console.log(`    ${key}: "${value}"`);
      }
    }
    console.log();

    // Send request
    const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(), // Important: Let FormData set Content-Type with boundary
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📥 Response Body:`, responseText);
    console.log();

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          console.log('✅ SUCCESS! Photo upload worked correctly!');
          console.log(`   Created menu item: ${data.data.name}`);
          console.log(`   Image URL: ${data.data.imageUrl || 'N/A'}`);
          return true;
        } else {
          console.error('❌ FAILED: Response indicates failure');
          console.error(`   Error: ${data.error || data.message}`);
          return false;
        }
      } catch (parseError) {
        console.error('❌ FAILED: Could not parse response as JSON');
        return false;
      }
    } else {
      console.error(`❌ FAILED: HTTP ${response.status}`);
      try {
        const errorData = JSON.parse(responseText);
        console.error(`   Error: ${errorData.error || errorData.message}`);
        if (errorData.missingFields) {
          console.error(`   Missing fields: ${errorData.missingFields.join(', ')}`);
        }
      } catch (e) {
        console.error(`   Response: ${responseText}`);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run test
testPhotoUpload()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test crashed:', error);
    process.exit(1);
  });

