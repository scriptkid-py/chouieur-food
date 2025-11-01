'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api-config';
import type { NavigationItem } from '@/lib/types';
import { NavigationItemForm } from '@/components/admin/NavigationItemForm';
import { useNavigation } from '@/hooks/use-navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminNavigationPage() {
  const { navigationItems: allItems, isLoading: isLoadingPublic, refetch: refetchPublic } = useNavigation({
    menuType: 'public',
    visible: true,
  });
  
  // Also fetch admin menu items
  const { navigationItems: adminItems, isLoading: isLoadingAdmin, refetch: refetchAdmin } = useNavigation({
    menuType: 'admin',
    visible: true,
  });
  
  const isLoading = isLoadingPublic || isLoadingAdmin;
  
  const refetch = async () => {
    await Promise.all([refetchPublic(), refetchAdmin()]);
  };
  
  const [menuTypeFilter, setMenuTypeFilter] = useState<'all' | 'public' | 'admin'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Combine items and filter
  const allNavigationItems = [...allItems, ...adminItems];
  const filteredItems = menuTypeFilter === 'all' 
    ? allNavigationItems 
    : allNavigationItems.filter(item => item.menuType === menuTypeFilter);

  const handleSave = async () => {
    await refetch();
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
    toast({
      title: "Success",
      description: "Navigation item saved successfully!",
    });
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (item: NavigationItem) => {
    if (!confirm(`Are you sure you want to delete "${item.label}"?`)) {
      return;
    }

    try {
      const response = await apiRequest<{ success: boolean; message?: string; error?: string }>(`/api/navigation/${item.id}`, {
        method: 'DELETE',
      });

      if (response && response.success !== false && !response.error) {
        await refetch();
        toast({
          title: "Success",
          description: "Navigation item deleted successfully!",
        });
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to delete navigation item';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error deleting navigation item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete navigation item. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const toggleVisibility = async (item: NavigationItem) => {
    try {
      const response = await apiRequest<{ success: boolean; data: NavigationItem }>(`/api/navigation/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...item,
          visible: !item.visible,
        }),
      });

      if (response && response.success) {
        await refetch();
        toast({
          title: "Success",
          description: `Navigation item ${!item.visible ? 'shown' : 'hidden'} successfully!`,
        });
      }
    } catch (error) {
      console.error('❌ Error toggling visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Navigation Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage navigation menu items for public and admin sections
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Navigation Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Navigation Item</DialogTitle>
            </DialogHeader>
            <NavigationItemForm
              onSuccess={handleSave}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Navigation Items</CardTitle>
              <CardDescription>
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Select value={menuTypeFilter} onValueChange={(value: any) => setMenuTypeFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public Menu</SelectItem>
                <SelectItem value="admin">Admin Menu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No navigation items found. Create your first navigation item!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Requires Auth</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.order}</TableCell>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{item.path}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.menuType === 'admin' ? 'default' : 'secondary'}>
                          {item.menuType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.requiresAuth ? (
                          <Badge variant="outline" className="bg-yellow-50">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.visible ? 'default' : 'secondary'}>
                            {item.visible ? 'Visible' : 'Hidden'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVisibility(item)}
                            title={item.visible ? 'Hide' : 'Show'}
                          >
                            {item.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Navigation Item</DialogTitle>
            </DialogHeader>
            <NavigationItemForm
              navigationItem={editingItem}
              onSuccess={handleSave}
              onCancel={handleCancel}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

