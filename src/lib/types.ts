export type Supplement = {
  id: string;
  name: string;
  price: number;
};

export type MenuItemCategory = 'Sandwiches' | 'Pizza' | 'Tacos' | 'Poulet' | 'Hamburgers' | 'Panini / Fajitas' | 'Plats';

export type MenuItem = {
  id: string;
  name: string;
  category: MenuItemCategory;
  price: number;
  megaPrice?: number;
  description: string;
  imageId: string;
  imageUrl?: string; // New field for actual image URLs
  isActive?: boolean;
};

export type CartItem = {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  size: 'Normal' | 'Mega';
  supplements: Supplement[];
  totalPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered';
  createdAt: string;
};

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'kitchen' | 'customer';
};
