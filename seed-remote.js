/**
 * Remote Database Seeder for Vercel
 * This script seeds the MongoDB database via the deployed API
 */

const sampleMenuItems = [
  {
    name: 'Pizza Margherita',
    category: 'Pizza',
    price: 5000,
    megaPrice: 7000,
    description: 'Classic Italian pizza with fresh tomatoes, mozzarella, and basil',
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['tomato sauce', 'mozzarella', 'basil', 'olive oil'],
    preparationTime: 15,
    calories: 250,
    tags: ['vegetarian', 'classic', 'italian']
  },
  {
    name: 'Burger Deluxe',
    category: 'Hamburgers',
    price: 8000,
    megaPrice: 10000,
    description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['beef patty', 'lettuce', 'tomato', 'onion', 'special sauce'],
    preparationTime: 20,
    calories: 650,
    tags: ['beef', 'american']
  },
  {
    name: 'Club Sandwich',
    category: 'Sandwiches',
    price: 6500,
    megaPrice: 8500,
    description: 'Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo',
    imageUrl: 'https://images.unsplash.com/photo-1539252555573-307081e0aa3d?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['turkey', 'bacon', 'lettuce', 'tomato', 'mayo'],
    preparationTime: 15,
    calories: 550,
    tags: ['turkey', 'bacon', 'classic']
  },
  {
    name: 'Caesar Salad',
    category: 'Salads',
    price: 5500,
    description: 'Fresh romaine lettuce with parmesan, croutons, and Caesar dressing',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    isActive: true,
    ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing'],
    preparationTime: 10,
    calories: 300,
    tags: ['vegetarian', 'healthy', 'salad']
  }
];

async function seedViaAPI() {
  const API_URL = 'https://chouieur-express-9t0a0mvlq-scriptkid-pys-projects.vercel.app';
  
  console.log('🌱 Starting remote database seeding...');
  console.log(`📍 API URL: ${API_URL}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const item of sampleMenuItems) {
    try {
      console.log(`📝 Adding: ${item.name}...`);
      
      const response = await fetch(`${API_URL}/api/menu-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`❌ Failed: ${item.name}`, errorData);
        errorCount++;
      } else {
        const data = await response.json();
        console.log(`✅ Added: ${item.name} (ID: ${data.menuItem?._id || 'unknown'})`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Error adding ${item.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n🎉 Seeding complete!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  // Verify by fetching all items
  try {
    const verifyResponse = await fetch(`${API_URL}/api/menu-items`);
    const verifyData = await verifyResponse.json();
    console.log(`\n📊 Total menu items in database: ${verifyData.menuItems?.length || 0}`);
  } catch (error) {
    console.error('Error verifying:', error.message);
  }
}

// Run the seeding
seedViaAPI().catch(console.error);

