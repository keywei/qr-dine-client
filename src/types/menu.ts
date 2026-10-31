export interface MenuItemOption {
  id: number;
  name: string;
  extraPrice: number;
  groupId: number;
}

export interface MenuItemOptionGroup {
  id: number;
  title: string;
  type: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  menuItemId: number;
  options: MenuItemOption[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  categoryId: number;
  options?: MenuItemOptionGroup[];
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

