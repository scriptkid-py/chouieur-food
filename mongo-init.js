// =============================================================================
// MONGODB INITIALIZATION SCRIPT
// =============================================================================
// 
// This script initializes the MongoDB database with required collections
// and sample data for local development.
// 

// Switch to the application database
db = db.getSiblingDB('myapp_db');

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'myapp_db'
    }
  ]
});

// Create collections with validation
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['customerName', 'items', 'total', 'status', 'createdAt'],
      properties: {
        customerName: {
          bsonType: 'string',
          description: 'Customer name is required and must be a string'
        },
        items: {
          bsonType: 'array',
          description: 'Order items must be an array'
        },
        total: {
          bsonType: 'number',
          description: 'Total amount must be a number'
        },
        status: {
          bsonType: 'string',
          enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
          description: 'Status must be one of the enum values'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date is required'
        }
      }
    }
  }
});

db.createCollection('menu_items', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'price', 'category', 'available'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Menu item name is required'
        },
        price: {
          bsonType: 'number',
          description: 'Price must be a number'
        },
        category: {
          bsonType: 'string',
          description: 'Category is required'
        },
        available: {
          bsonType: 'bool',
          description: 'Availability must be a boolean'
        }
      }
    }
  }
});

// Insert sample menu items
db.menu_items.insertMany([
  {
    name: 'Margherita Pizza',
    price: 12.99,
    category: 'Pizza',
    description: 'Classic tomato and mozzarella pizza',
    available: true,
    createdAt: new Date()
  },
  {
    name: 'Pepperoni Pizza',
    price: 14.99,
    category: 'Pizza',
    description: 'Pepperoni with mozzarella cheese',
    available: true,
    createdAt: new Date()
  },
  {
    name: 'Caesar Salad',
    price: 8.99,
    category: 'Salad',
    description: 'Fresh romaine lettuce with caesar dressing',
    available: true,
    createdAt: new Date()
  },
  {
    name: 'Chicken Burger',
    price: 11.99,
    category: 'Burger',
    description: 'Grilled chicken breast with lettuce and tomato',
    available: true,
    createdAt: new Date()
  }
]);

// Insert sample order
db.orders.insertOne({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+1234567890',
  items: [
    {
      menuItemId: ObjectId(),
      name: 'Margherita Pizza',
      quantity: 2,
      price: 12.99
    },
    {
      menuItemId: ObjectId(),
      name: 'Caesar Salad',
      quantity: 1,
      price: 8.99
    }
  ],
  total: 34.97,
  status: 'pending',
  deliveryAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345'
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ MongoDB initialization completed successfully!');
print('📊 Created collections: orders, menu_items');
print('👤 Created user: app_user');
print('🍕 Inserted sample menu items and orders');
