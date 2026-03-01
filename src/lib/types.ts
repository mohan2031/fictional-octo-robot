export interface Product {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  imageUrl: string;
  imageHint: string;
}

export interface Shop {
  id: string;
  name:string;
  category: 'Groceries' | 'Electronics' | 'Plumbing' | 'Electrician' | 'Hardware' | 'Clothing';
  isOpen: boolean;
  location: string;
  phone: string;
  hours: string;
  description: string;
  products: Product[];
  imageUrl: string;
  imageHint: string;
  ownerId: string;
  createdAt?: Date;
}

export interface Inquiry {
  id: string;
  shopId: string;
  name: string;
  contact: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}
