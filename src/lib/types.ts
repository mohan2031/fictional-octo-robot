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
  name: string;
  contact: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}
