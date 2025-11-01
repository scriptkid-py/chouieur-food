'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api-config';
import type { NavigationItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';

type FormData = {
  id: string;
  label: string;
  path: string;
  menuType: 'public' | 'admin';
  order: number;
  requiresAuth: boolean;
  visible: boolean;
  icon?: string;
  target: '_blank' | '_self';
  onClick?: string;
};

type NavigationItemFormProps = {
  navigationItem?: NavigationItem;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function NavigationItemForm({ navigationItem, onSuccess, onCancel }: NavigationItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      id: navigationItem?.id || '',
      label: navigationItem?.label || '',
      path: navigationItem?.path || '',
      menuType: navigationItem?.menuType || 'public',
      order: navigationItem?.order ?? 0,
      requiresAuth: navigationItem?.requiresAuth || false,
      visible: navigationItem?.visible !== false,
      icon: navigationItem?.icon || '',
      target: navigationItem?.target || '_self',
      onClick: navigationItem?.onClick || '',
    }
  });

  const menuType = watch('menuType');
  const requiresAuth = watch('requiresAuth');
  const visible = watch('visible');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setIsSubmitting(true);

      const navigationItemData = {
        id: data.id.trim().toLowerCase().replace(/\s+/g, '-'),
        label: data.label.trim(),
        path: data.path.trim(),
        menuType: data.menuType,
        order: Number(data.order) || 0,
        requiresAuth: data.requiresAuth,
        visible: data.visible,
        icon: data.icon?.trim() || '',
        target: data.target,
        onClick: data.onClick?.trim() || '',
        isActive: true,
      };

      console.log('📤 Saving navigation item:', navigationItemData);

      const endpoint = navigationItem 
        ? `/api/navigation/${navigationItem.id}` 
        : '/api/navigation';
      const method = navigationItem ? 'PUT' : 'POST';

      const response = await apiRequest(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(navigationItemData),
      });

      console.log('📥 Response received:', response);

      if (response && (response.success !== false) && !response.error) {
        toast({
          title: navigationItem ? 'Navigation item updated' : 'Navigation item created',
          description: `${navigationItemData.label} has been ${navigationItem ? 'updated' : 'added'} successfully.`,
        });
        onSuccess?.();
      } else {
        const errorMsg = response?.message || response?.error || 'Failed to save navigation item';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Error saving navigation item:', error);
      const errorMessage = error?.message || 'Failed to save navigation item. Please check all fields are filled correctly.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="id">ID *</Label>
          <Input
            id="id"
            {...register('id', { required: 'ID is required' })}
            placeholder="home, menu, about"
            disabled={!!navigationItem} // Can't change ID after creation
          />
          {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
          <p className="text-xs text-muted-foreground">
            Unique identifier (lowercase, no spaces)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label *</Label>
          <Input
            id="label"
            {...register('label', { required: 'Label is required' })}
            placeholder="Home, Menu, About"
          />
          {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="path">Path *</Label>
        <Input
          id="path"
          {...register('path', { required: 'Path is required' })}
          placeholder="/, /menu, /about"
        />
        {errors.path && <p className="text-sm text-destructive">{errors.path.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="menuType">Menu Type *</Label>
          <Select
            value={menuType}
            onValueChange={(value: 'public' | 'admin') => setValue('menuType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select menu type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order *</Label>
          <Input
            id="order"
            type="number"
            {...register('order', { 
              required: 'Order is required',
              valueAsNumber: true,
              min: { value: 0, message: 'Order must be 0 or greater' }
            })}
            placeholder="0, 1, 2..."
          />
          {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Lucide React)</Label>
          <Input
            id="icon"
            {...register('icon')}
            placeholder="Home, Menu, User (optional)"
          />
          <p className="text-xs text-muted-foreground">
            Icon name from lucide-react (e.g., Home, Menu, User)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">Link Target</Label>
          <Select
            value={watch('target')}
            onValueChange={(value: '_blank' | '_self') => setValue('target', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_self">Same Window</SelectItem>
              <SelectItem value="_blank">New Window</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="onClick">OnClick Handler (Optional)</Label>
        <Input
          id="onClick"
          {...register('onClick')}
          placeholder="handleSpecialAction"
        />
        <p className="text-xs text-muted-foreground">
          Name of global function to call on click (optional)
        </p>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="requiresAuth"
            checked={requiresAuth}
            onCheckedChange={(checked) => setValue('requiresAuth', checked)}
          />
          <Label htmlFor="requiresAuth">Requires Authentication</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="visible"
            checked={visible}
            onCheckedChange={(checked) => setValue('visible', checked)}
          />
          <Label htmlFor="visible">Visible</Label>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {navigationItem ? 'Update' : 'Create'} Navigation Item
        </Button>
      </div>
    </form>
  );
}

