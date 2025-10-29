'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMenuItems } from '@/hooks/use-menu-items';
import { Loader2, PlusCircle, Edit, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { MenuItemForm } from '@/components/admin/MenuItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api-config';
import type { MenuItem } from '@/lib/types';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function AdminMenuItemsPage() {
  const { menuItems, isLoading, refetch } = useMenuItems();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    await refetch();
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast({
      title: "Success",
      description: "Menu item saved successfully!",
    });
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const response = await apiRequest<{ success: boolean; message?: string }>(`/api/menu-items/${item.id}`, {
        method: 'DELETE',
      });

      if (response && response.success !== false) {
        await refetch();
        toast({
          title: "Success",
          description: "Menu item deleted successfully!",
        });
      } else {
        throw new Error(response?.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu item. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'appetizers': return 'bg-green-500';
      case 'mains': return 'bg-blue-500';
      case 'desserts': return 'bg-purple-500';
      case 'beverages': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getImageUrl = (item: MenuItem) => {
    if (item.imageUrl) {
      return item.imageUrl;
    }
    const placeholder = PlaceHolderImages.find(p => p.id === item.imageId);
    return placeholder?.imageUrl;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant's menu items and images.</p>
        </div>
        <Badge variant="outline" className="text-sm">
            ADMIN ACCESS
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Menu items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menuItems.filter(item => item.imageUrl).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items with photos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {menuItems.filter(item => item.isActive !== false).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently visible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <ImageIcon className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(menuItems.map(item => item.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Item Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <MenuItemForm
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Mega Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No menu items found. Add your first item to get started!
                  </TableCell>
                </TableRow>
              ) : (
                menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden">
                        {getImageUrl(item) ? (
                          <Image
                            src={getImageUrl(item)!}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {item.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.price.toLocaleString()} FCFA
                    </TableCell>
                    <TableCell>
                      {item.megaPrice ? (
                        <span className="font-medium">
                          {item.megaPrice.toLocaleString()} FCFA
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isActive !== false ? "default" : "secondary"}>
                        {item.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <MenuItemForm
              initialData={editingItem}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}