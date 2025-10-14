/**
 * =============================================================================
 * ORDERS API ROUTE
 * =============================================================================
 * 
 * This API route handles CRUD operations for orders using MongoDB.
 * It demonstrates how to use the MongoDB connection and models.
 * 
 * DATABASE CONFIGURATION:
 * =======================
 * The MongoDB connection is configured via the MONGO_URI environment variable.
 * 
 * TO CHANGE MONGODB LOCATION:
 * ===========================
 * Update the MONGO_URI environment variable in your .env file or Render dashboard.
 * 
 * FOR RENDER DEPLOYMENT:
 * ======================
 * In production, Render should connect to a remote MongoDB instance (MongoDB Atlas).
 * Update the MONGO_URI environment variable in Render dashboard to point to your
 * production MongoDB instance instead of localhost.
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongodb';
import Order from '@/lib/models/Order';
import type { IOrder } from '@/lib/models/Order';

// =============================================================================
// GET /api/orders - Get all orders for a user
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Query orders for the user
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/orders - Create a new order
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    const body = await request.json();
    const { 
      userId, 
      customerName, 
      customerPhone, 
      customerAddress, 
      items, 
      total 
    } = body;

    // Validate required fields
    if (!userId || !customerName || !customerPhone || !customerAddress || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new order
    const order = new Order({
      userId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      total,
      status: 'pending',
    });

    const savedOrder = await order.save();

    return NextResponse.json({
      success: true,
      order: savedOrder,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/orders - Update order status
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();
    
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
