'use client';

import { useRealtimeOrders } from '@/hooks/use-realtime-orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LiveOrdersTest() {
  const { orders, isLoading, error } = useRealtimeOrders();
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (error) {
      setConnectionStatus('error');
    } else if (!isLoading && orders !== undefined) {
      setConnectionStatus('connected');
      setLastUpdate(new Date());
    }
  }, [orders, isLoading, error]);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live Connection Active';
      case 'error':
        return 'Connection Error';
      default:
        return 'Connecting...';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getConnectionIcon()}
          Live Orders Status
        </CardTitle>
        <CardDescription>
          Real-time order monitoring and connection status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getConnectionColor()}>
              {getConnectionText()}
            </Badge>
            {connectionStatus === 'connected' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            {connectionStatus === 'error' && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Orders Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : orders?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 
               orders?.filter(order => order.status === 'pending').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Pending Orders</div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Connection Error</span>
            </div>
            <div className="text-sm text-red-700 mt-1">
              {error.message || 'Failed to connect to real-time orders'}
            </div>
            <div className="text-xs text-red-600 mt-2">
              Please check Firebase security rules and connection
            </div>
          </div>
        )}

        {/* Success Message */}
        {connectionStatus === 'connected' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Live Updates Active</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              Orders will appear instantly without page refresh
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• New orders appear automatically</div>
          <div>• Status changes update in real-time</div>
          <div>• No page refresh needed</div>
          <div>• Works across all admin interfaces</div>
        </div>
      </CardContent>
    </Card>
  );
}
