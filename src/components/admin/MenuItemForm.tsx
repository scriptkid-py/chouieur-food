'use client';

import { useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api-config';
import { getApiBaseUrl } from '@/lib/api-config';
import type { MenuItem, MenuItemCategory } from '@/lib/types';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

type FormData = {
  name: string;
  category: MenuItemCategory;
  price: number;
  megaPrice?: number;
  description: string;
};

type MenuItemFormProps = {
  menuItem?: MenuItem;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function MenuItemForm({ menuItem, onSuccess, onCancel }: MenuItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    defaultValues: {
      name: menuItem?.name || '',
      category: menuItem?.category || 'Sandwiches',
      price: menuItem?.price || 0,
      megaPrice: menuItem?.megaPrice || undefined,
      description: menuItem?.description || '',
    }
  });

  const categories: MenuItemCategory[] = [
    'Sandwiches', 'Pizza', 'Tacos', 'Poulet', 
    'Hamburgers', 'Panini / Fajitas', 'Plats'
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    console.log('🖼️ Starting image upload for file:', selectedImage.name, selectedImage.size, 'bytes');
    
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await apiRequest('/api/menu-items/upload-image', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Upload response:', response);

      if (response.success && response.imageUrl) {
        let finalUrl: string = response.imageUrl as string;
        // Normalize relative URL to absolute
        if (typeof finalUrl === 'string' && finalUrl.startsWith('/uploads/')) {
          finalUrl = `${getApiBaseUrl()}${finalUrl}`;
        }
        console.log('✅ Image uploaded successfully, URL length:', finalUrl.length);
        console.log('🔗 Image URL preview:', finalUrl.substring(0, 100) + '...');
        setUploadedImageUrl(finalUrl);
        return finalUrl;
      } else {
        console.error('❌ Upload failed - no success or no imageUrl:', response);
        return null;
      }
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);

    try {
      // If we have a selected image, use FormData approach (send image directly)
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('name', data.name);
        formData.append('category', data.category);
        formData.append('price', String(data.price));
        if (data.megaPrice) {
          formData.append('megaPrice', String(data.megaPrice));
        }
        formData.append('description', data.description || '');
        formData.append('isActive', menuItem?.isActive !== false ? 'true' : 'false');

        let response;
        if (menuItem) {
          // Update existing menu item
          response = await apiRequest(`/api/menu-items/${menuItem.id}`, {
            method: 'PUT',
            body: formData,
          });
        } else {
          // Create new menu item
          response = await apiRequest('/api/menu-items', {
            method: 'POST',
            body: formData,
          });
        }

        if (response && response.success !== false) {
          toast({
            title: menuItem ? 'Menu item updated' : 'Menu item created',
            description: `${data.name} has been ${menuItem ? 'updated' : 'added'} successfully.`,
          });
          onSuccess?.();
          return;
        } else {
          throw new Error(response?.message || 'Failed to save menu item');
        }
      }

      // Fallback: If no image selected but we have existing imageUrl, use JSON
      let imageUrl = menuItem?.imageUrl || '';
      
      // If no image at all, require one
      if (!imageUrl && !selectedImage) {
        toast({ title: 'Image Required', description: 'Please choose and upload an image.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

      // Prepare menu item data
      const menuItemData = {
        name: data.name,
        category: data.category,
        price: data.price,
        megaPrice: data.megaPrice || undefined,
        description: data.description,
        imageId: menuItem?.imageId || data.name.toLowerCase().replace(/\s+/g, '-'),
        imageUrl: imageUrl,
      };

      let response;
      if (menuItem) {
        // Update existing menu item
        response = await apiRequest(`/api/menu-items/${menuItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(menuItemData),
        });
      } else {
        // Create new menu item
        response = await apiRequest('/api/menu-items', {
          method: 'POST',
          body: JSON.stringify(menuItemData),
        });
      }

      if (response.success) {
        toast({
          title: menuItem ? 'Menu item updated' : 'Menu item created',
          description: `${data.name} has been ${menuItem ? 'updated' : 'added'} successfully.`,
        });
        onSuccess?.();
      } else {
        throw new Error(response.message || 'Failed to save menu item');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'Failed to save menu item. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Menu Item Image</Label>
            
            {/* Current Image Display */}
            {(imagePreview || menuItem?.imageUrl) && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                <img
                  src={imagePreview || menuItem?.imageUrl}
                  alt="Menu item preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Button */}
            {!imagePreview && !menuItem?.imageUrl && (
              <div
                className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB</p>
              </div>
            )}

            {/* File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Upload Button for existing items */}
            {menuItem?.imageUrl && !imagePreview && (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </Button>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Sandwich Pilon"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as MenuItemCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (FCFA) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="50"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="350"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="megaPrice">Mega Price (FCFA)</Label>
              <Input
                id="megaPrice"
                type="number"
                min="0"
                step="50"
                {...register('megaPrice', {
                  min: { value: 0, message: 'Price must be positive' }
                })}
                placeholder="500 (optional)"
              />
              {errors.megaPrice && (
                <p className="text-sm text-destructive">{errors.megaPrice.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe the menu item..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {menuItem ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                menuItem ? 'Update Menu Item' : 'Create Menu Item'
              )}
            </Button>
            
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
