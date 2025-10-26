'use client';

import { AdminCredentials } from '@/components/admin/AdminCredentials';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Utensils, 
  Package, 
  Users,
  ArrowRight,
  Shield,
  ChefHat
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLandingPage() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-headline font-bold">Admin Portal</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to the Chouieur Express Admin Portal. Manage your restaurant operations, 
            menu items, and orders from this centralized dashboard.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <LayoutDashboard className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">Dashboard</CardTitle>
              <CardDescription>Overview of your restaurant operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/dashboard">
                  Access Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Utensils className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">Menu Management</CardTitle>
              <CardDescription>Add, edit, and manage menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/menu">
                  Manage Menu
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Package className="h-12 w-12 mx-auto text-orange-500 mb-2" />
              <CardTitle className="text-lg">Order Management</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/orders">
                  View Orders
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <ChefHat className="h-12 w-12 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">Kitchen View</CardTitle>
              <CardDescription>Kitchen staff order preparation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/kitchen">
                  Kitchen Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Full Access</Badge>
                <span className="text-sm">Complete restaurant management</span>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Add and edit menu items with images</li>
                <li>• Manage order status and delivery</li>
                <li>• View sales analytics and reports</li>
                <li>• Configure restaurant settings</li>
                <li>• Access to all admin functions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Kitchen Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Kitchen Access</Badge>
                <span className="text-sm">Order preparation management</span>
              </div>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• View confirmed orders</li>
                <li>• Update order preparation status</li>
                <li>• Mark orders as ready for pickup</li>
                <li>• Track order timing</li>
                <li>• Kitchen workflow management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Direct Access Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Direct Access</CardTitle>
            <CardDescription className="text-center">
              All admin features are now accessible without authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button asChild size="lg">
                <Link href="/admin/dashboard">
                  <Shield className="mr-2 h-5 w-5" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credentials */}
        <AdminCredentials />
      </div>
    </div>
  );
}
