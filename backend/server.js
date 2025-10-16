const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chouieur Express Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/menu-items', (req, res) => {
  // Placeholder menu items
  const menuItems = [
    {
      id: '1',
      name: 'Chicken Shawarma',
      description: 'Tender chicken with fresh vegetables',
      price: 12.99,
      category: 'main',
      image: '/images/chicken-shawarma.jpg'
    },
    {
      id: '2',
      name: 'Beef Kebab',
      description: 'Grilled beef with herbs and spices',
      price: 15.99,
      category: 'main',
      image: '/images/beef-kebab.jpg'
    }
  ];
  
  res.json(menuItems);
});

app.get('/api/orders', (req, res) => {
  res.json({ message: 'Orders endpoint - implement your logic here' });
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  // Here you would save to your database (Google Sheets, etc.)
  res.json({ 
    message: 'Order received', 
    orderId: Date.now().toString(),
    order 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chouieur Express Backend running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
