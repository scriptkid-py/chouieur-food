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
      // Validate all required fields BEFORE sending request
      const errors: string[] = [];
      
      if (!data.name || data.name.trim() === '') {
        errors.push('Menu item name is required');
      }
      
      if (data.price === undefined || data.price === null || isNaN(data.price) || data.price <= 0) {
        errors.push('Valid price is required and must be greater than 0');
      }
      
      if (!data.description || data.description.trim() === '') {
        errors.push('Description is required');
      }

      if (errors.length > 0) {
        toast({
          title: 'Validation Error',
          description: errors.join('. '),
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare base menu item data
      const baseData = {
        name: data.name.trim(),
        description: data.description.trim(),
        price: Number(data.price),
        category: data.category || 'Sandwiches',
        isActive: menuItem?.isActive !== false,
      };

      // Add optional fields
      if (data.megaPrice && data.megaPrice > 0) {
        baseData.megaPrice = Number(data.megaPrice);
      }

      // If we have a selected image, use FormData approach (send image directly)
      if (selectedImage) {
        console.log('📤 Uploading menu item with image via FormData');
        
        // Create FormData and append ALL fields
        const formData = new FormData();
        
        // CRITICAL: Append image file first
        formData.append('image', selectedImage);
        
        // Append ALL text fields - ensure they're strings
        formData.append('name', String(baseData.name || '').trim());
        formData.append('description', String(baseData.description || '').trim());
        formData.append('price', String(baseData.price || 0));
        formData.append('category', String(baseData.category || 'Sandwiches'));
        formData.append('isActive', String(baseData.isActive !== false));
        
        // Optional fields
        if (baseData.megaPrice && baseData.megaPrice > 0) {
          formData.append('megaPrice', String(baseData.megaPrice));
        }

        // Log FormData contents before sending - VERIFY all fields are present
        console.log('📤 FormData contents (BEFORE SENDING):');
        const formDataEntries: Array<[string, string | File]> = [];
        for (let [key, value] of formData.entries()) {
          formDataEntries.push([key, value]);
          if (value instanceof File) {
            console.log(`  ✅ ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ✅ ${key}: "${value}" (type: ${typeof value})`);
          }
        }
        
        // Verify all required fields are present
        const requiredFields = ['name', 'description', 'price', 'category', 'image'];
        const missingFields = requiredFields.filter(field => {
          if (field === 'image') {
            return !formDataEntries.some(([k]) => k === 'image' && formDataEntries.find(([k, v]) => k === 'image' && v instanceof File));
          }
          return !formDataEntries.some(([k]) => k === field);
        });
        
        if (missingFields.length > 0) {
          console.error('❌ MISSING REQUIRED FIELDS IN FORMDATA:', missingFields);
          toast({
            title: 'Validation Error',
            description: `Missing required fields: ${missingFields.join(', ')}`,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
        
        console.log('✅ All required fields present in FormData');

        try {
          const endpoint = menuItem 
            ? `/api/menu-items/${menuItem.id}` 
            : '/api/menu-items';
          const method = menuItem ? 'PUT' : 'POST';

          console.log(`📡 Sending ${method} request to ${endpoint}`);
          console.log(`📡 FormData will be sent WITHOUT Content-Type header (browser will add it automatically)`);
          
          // IMPORTANT: Do NOT set any headers - apiRequest will handle this for FormData
          const response = await apiRequest(endpoint, {
            method: method,
            body: formData,
            // DO NOT set headers here - apiRequest handles FormData headers automatically
          });

          console.log('📥 Response received:', response);

          if (response && response.success !== false && !response.error) {
            toast({
              title: menuItem ? 'Menu item updated' : 'Menu item created',
              description: `${baseData.name} has been ${menuItem ? 'updated' : 'added'} successfully.`,
            });
            onSuccess?.();
            return;
          } else {
            const errorMsg = response?.message || response?.error || 'Failed to save menu item';
            throw new Error(errorMsg);
          }
        } catch (uploadError: any) {
          console.error('❌ Error uploading menu item:', uploadError);
          const errorMessage = uploadError?.message || 'Failed to save menu item. Please check all fields are filled correctly.';
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }
      }

      // If no image selected, send as JSON
      // Use existing imageUrl if available (for updates)
      const menuItemData = {
        ...baseData,
        imageUrl: menuItem?.imageUrl || '',
      };

      try {
        const endpoint = menuItem 
          ? `/api/menu-items/${menuItem.id}` 
          : '/api/menu-items';
        const method = menuItem ? 'PUT' : 'POST';

        console.log(`📡 Sending ${method} request to ${endpoint} with JSON data:`, menuItemData);
        
        const response = await apiRequest(endpoint, {
          method: method,
          body: JSON.stringify(menuItemData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📥 Response received:', response);

        if (response && (response.success !== false) && !response.error) {
          toast({
            title: menuItem ? 'Menu item updated' : 'Menu item created',
            description: `${baseData.name} has been ${menuItem ? 'updated' : 'added'} successfully.`,
          });
          onSuccess?.();
        } else {
          const errorMsg = response?.message || response?.error || 'Failed to save menu item';
          throw new Error(errorMsg);
        }
      } catch (jsonError: any) {
        console.error('❌ Error saving menu item:', jsonError);
        const errorMessage = jsonError?.message || 'Failed to save menu item. Please check all fields are filled correctly.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('❌ Unexpected error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'An unexpected error occurred. Please try again.',
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
            <Label className="text-base font-medium">Menu Item Image <span className="text-gray-500 text-sm font-normal">(optional)</span></Label>
            
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
