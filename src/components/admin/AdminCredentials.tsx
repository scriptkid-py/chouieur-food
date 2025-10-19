'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AdminCredentials() {
  const [showPasswords, setShowPasswords] = useState(false);
  const { toast } = useToast();

  const credentials = [
    {
      role: 'Admin',
      username: 'admin',
      password: 'admin123',
      description: 'Full access to all admin features including menu management',
      color: 'bg-red-500'
    },
    {
      role: 'Kitchen',
      username: 'kitchen', 
      password: 'kitchen123',
      description: 'Access to kitchen dashboard for order management',
      color: 'bg-orange-500'
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Credentials copied to clipboard',
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔐 Admin Access Credentials
        </CardTitle>
        <CardDescription>
          Use these credentials to access the admin panel and manage your restaurant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Click the eye icon to show/hide passwords
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
          >
            {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPasswords ? 'Hide' : 'Show'} Passwords
          </Button>
        </div>

        {credentials.map((cred) => (
          <div key={cred.role} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={cred.color}>
                {cred.role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {cred.description}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                    {cred.username}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(cred.username)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                    {showPasswords ? cred.password : '••••••••'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(cred.password)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 How to Access Admin Panel
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Go to <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">/staff/login</code></li>
            <li>Use the admin credentials above</li>
            <li>You'll be redirected to the admin dashboard</li>
            <li>Click "Menu Items" in the sidebar to manage your menu</li>
          </ol>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            ⚠️ Security Note
          </h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            These are demo credentials. In production, you should:
          </p>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 space-y-1 list-disc list-inside">
            <li>Use strong, unique passwords</li>
            <li>Implement proper user authentication</li>
            <li>Store credentials securely</li>
            <li>Add two-factor authentication</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
