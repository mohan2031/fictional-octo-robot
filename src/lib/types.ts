export interface Appointment {
  id: string;
  clinicId: string;
  userId: string;
  patientName: string;
  appointmentDate: Date;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Clinic {
  id: string;
  name:string;
  category: 'Dentist' | 'General Physician' | 'Cardiology' | 'Pediatrics' | 'Dermatology' | 'Other';
  isOpen: boolean;
  location: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  ownerId: string;
  createdAt?: Date;
}

export interface Inquiry {
  id: string;
  clinicId: string;
  userId?: string;
  name: string;
  contact: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
  imageUrl: string;
  imageHint: string;
  createdAt: Date;
}

export interface Shop {
  id: string;
  name: string;
  category: 'Grocery' | 'Electronics' | 'Plumbing' | 'Electrician' | 'Other';
  isOpen: boolean;
  location: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  ownerId: string;
  createdAt?: Date;
  products?: Product[];
}

export interface ShopInquiry {
  id: string;
  shopId: string;
  userId?: string;
  name: string;
  contact: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID
  displayName: string;
  email: string;
  role: 'customer' | 'owner';
  createdAt: Date;
}

export interface Review {
  id: string;
  businessId: string;
  businessType: 'clinic' | 'shop';
  userId: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
