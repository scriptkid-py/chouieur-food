# Socket.io Real-Time Live Updates Implementation

## Overview

This document explains how real-time live updates are implemented using Socket.io in the Chouieur Express restaurant web application. The system provides instant updates across Admin and Kitchen pages without page reloads.

## Architecture

### Backend (Node.js + Express + Socket.io)
- **File**: `api/index.js`
- **Port**: 3001 (default)
- **Technology**: Socket.io server integrated with Express HTTP server

### Frontend (React/Next.js + Socket.io Client)
- **Hook**: `src/hooks/use-socket-orders.ts`
- **Pages**: 
  - `src/app/admin/orders/page.tsx` (Admin Orders Page)
  - `src/app/kitchen/page.tsx` (Kitchen Page)
  - `src/app/admin/kitchen/page.tsx` (Admin Kitchen Page)

## How It Works

### 1. Backend Setup

```javascript
// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling']
});

// Listen for connections
io.on('connection', (socket) => {
  // Send initial orders when client connects
  // Handle disconnections
});
```

### 2. Socket Events

#### Server Emits:

1. **`connected`** - Sent when client first connects
   ```javascript
   socket.emit('connected', { message, socketId, timestamp })
   ```

2. **`initialOrders`** - Sent immediately after connection with all current orders
   ```javascript
   socket.emit('initialOrders', { orders: [...], count: 12, timestamp })
   ```

3. **`newOrder`** - Broadcasted when a new order is created
   ```javascript
   io.emit('newOrder', { type: 'newOrder', order: {...}, timestamp })
   ```

4. **`updateOrderStatus`** - Broadcasted when an order status is updated
   ```javascript
   io.emit('updateOrderStatus', { type: 'updateOrderStatus', order: {...}, timestamp })
   ```

#### Client Can Emit:

- **`disconnect`** - Automatically handled by Socket.io client

### 3. Frontend Hook (`useSocketOrders`)

The `useSocketOrders` hook provides:

```typescript
const {
  orders,           // Array of current orders
  isLoading,        // Loading state
  error,            // Error message if any
  isConnected,      // Socket.io connection status
  refetch,          // Manual refresh function
  updateOrderStatus // Update order status function
} = useSocketOrders({ enableSound: true });
```

**Features:**
- ✅ Automatic reconnection on disconnect
- ✅ Notification sound for new orders (optional)
- ✅ Initial orders loading
- ✅ Real-time order updates
- ✅ Connection status tracking

### 4. Order Data Structure

```typescript
interface HybridOrder {
  id: string;                    // MongoDB _id
  orderid: string;               // Custom order ID (ORD-xxx)
  userid: string;                // User ID
  customerName: string;           // Customer name
  customerPhone: string;          // Customer phone
  customerAddress: string;        // Delivery address
  items: Array<{                 // Order items
    menuItemId: string;
    quantity: number;
    name?: string;
  }>;
  total: number;                 // Total price
  status: string;                // Order status
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
  email?: string;                // Customer email
  notes?: string;                // Order notes
  deliveryTime?: string;         // Estimated delivery time
  paymentMethod: string;          // Payment method
  orderType: 'delivery' | 'pickup'; // Order type
}
```

## Real-Time Flow

### New Order Flow

```
1. Customer places order → POST /api/orders
2. Backend saves order to MongoDB
3. Backend broadcasts: io.emit('newOrder', order)
4. All connected clients receive event instantly
5. Frontend updates UI automatically
6. Notification sound plays (if enabled)
```

### Order Status Update Flow

```
1. Admin updates status → PUT /api/orders/:id
2. Backend updates MongoDB
3. Backend broadcasts: io.emit('updateOrderStatus', order)
4. All connected clients (Admin + Kitchen) receive update
5. UI updates automatically on both pages
```

## Connection Handling

### Automatic Reconnection

The hook automatically handles:
- **Network disconnections** - Reconnects after 1-5 seconds
- **Server restarts** - Reconnects with exponential backoff
- **Connection errors** - Up to 5 reconnection attempts
- **Manual reconnection** - Via `refetch()` function

### Connection Status Indicator

Both Admin and Kitchen pages show:
- 🟢 **LIVE** (green, pulsing) - Connected
- 🔴 **DISCONNECTED** (red) - Not connected

## Notification Sound

When `enableSound: true` is set:
- Plays a beep sound (800Hz sine wave) when a new order arrives
- Uses Web Audio API for cross-browser compatibility
- Gracefully handles browsers without AudioContext support

## Code Examples

### Backend: Broadcasting New Order

```javascript
// In POST /api/orders endpoint
const savedOrder = await newOrder.save();
broadcastOrderUpdate('newOrder', savedOrder);

function broadcastOrderUpdate(eventName, order) {
  const orderData = order.toObject ? order.toObject() : order;
  io.emit(eventName, {
    type: eventName,
    order: orderData,
    timestamp: new Date().toISOString()
  });
}
```

### Frontend: Using the Hook

```typescript
import { useSocketOrders } from "@/hooks/use-socket-orders";

export default function OrdersPage() {
  const { orders, isLoading, error, isConnected, updateOrderStatus } = 
    useSocketOrders({ enableSound: true });

  return (
    <div>
      {isConnected ? (
        <Badge>🟢 LIVE</Badge>
      ) : (
        <Badge>🔴 DISCONNECTED</Badge>
      )}
      
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

## Deployment Notes

### Render Backend

Socket.io works on Render.com:
- ✅ Persistent connections supported
- ✅ WebSocket support enabled by default
- ✅ No special configuration needed

### Vercel Frontend

Frontend on Vercel works perfectly:
- ✅ Socket.io client connects to Render backend
- ✅ CORS configured properly
- ✅ WebSocket connections work across domains

## Testing

### Local Development

1. Start backend: `cd api && npm run dev`
2. Start frontend: `npm run dev`
3. Open Admin page: http://localhost:3000/admin/orders
4. Open Kitchen page: http://localhost:3000/kitchen
5. Place a test order
6. Watch orders appear instantly on both pages

### Production

1. Backend: https://chouieur-express-backend-h74v.onrender.com
2. Frontend: https://chouieur-express-*.vercel.app
3. Socket.io automatically connects via WebSocket

## Advantages Over SSE/Polling

✅ **Bidirectional Communication** - Can send data both ways  
✅ **Lower Latency** - WebSocket is faster than HTTP polling  
✅ **Better Reconnection** - Built-in reconnection logic  
✅ **Scalability** - Efficient for many concurrent connections  
✅ **Event-Based** - Clean event names (`newOrder`, `updateOrderStatus`)  
✅ **Automatic Fallback** - Falls back to polling if WebSocket fails

## Troubleshooting

### Connection Issues

- Check browser console for Socket.io connection errors
- Verify backend is running and accessible
- Check CORS configuration in backend
- Ensure WebSocket is not blocked by firewall

### Orders Not Updating

- Verify Socket.io connection status badge
- Check browser console for event logs
- Confirm backend is broadcasting events
- Try manual refresh via `refetch()` function

### Notification Sound Not Working

- Check browser supports Web Audio API
- Verify `enableSound: true` is passed to hook
- Check browser console for AudioContext errors

## Future Enhancements

- [ ] Add authentication for Socket.io connections
- [ ] Implement room-based connections (separate rooms for Admin/Kitchen)
- [ ] Add typing indicators for order updates
- [ ] Implement order comments/chat via Socket.io
- [ ] Add presence indicators (who's online)

