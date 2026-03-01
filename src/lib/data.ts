import type { Clinic, Shop } from './types';
import { db } from '@/firebase/server';
import { doc, getDoc, DocumentData, Timestamp } from 'firebase/firestore';

const mapDocToClinic = (document: DocumentData): Clinic => {
    const data = document.data();
    return {
      id: document.id,
      name: data.name || 'Unnamed Clinic',
      category: data.category || 'Other',
      isOpen: data.isOpen === true,
      location: data.location || 'No location',
      lat: data.lat || 0,
      lng: data.lng || 0,
      phone: data.phone || 'No phone',
      hours: data.hours || 'Not specified',
      description: data.description || 'No description provided.',
      imageUrl: data.imageUrl || `https://picsum.photos/seed/${document.id}/600/400`,
      imageHint: data.imageHint || 'clinic',
      ownerId: data.ownerId || '',
      // Firestore timestamps need to be converted to JS Dates for serialization in Server Components
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  };

export const getClinicById = async (id: string): Promise<Clinic | null> => {
  if (!id) {
    return null;
  }
  const clinicRef = doc(db, 'clinics', id);
  const clinicSnap = await getDoc(clinicRef);

  if (!clinicSnap.exists()) {
    return null;
  }
  
  return mapDocToClinic(clinicSnap);
};


const mapDocToShop = (document: DocumentData): Shop => {
    const data = document.data();
    return {
      id: document.id,
      name: data.name || 'Unnamed Shop',
      category: data.category || 'Other',
      isOpen: data.isOpen === true,
      location: data.location || 'No location',
      lat: data.lat || 0,
      lng: data.lng || 0,
      phone: data.phone || 'No phone',
      hours: data.hours || 'Not specified',
      description: data.description || 'No description provided.',
      imageUrl: data.imageUrl || `https://picsum.photos/seed/${document.id}/600/400`,
      imageHint: data.imageHint || 'shop',
      ownerId: data.ownerId || '',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
      products: data.products || [],
    };
  };

export const getShopById = async (id: string): Promise<Shop | null> => {
  if (!id) {
    return null;
  }
  const shopRef = doc(db, 'shops', id);
  const shopSnap = await getDoc(shopRef);

  if (!shopSnap.exists()) {
    return null;
  }
  
  return mapDocToShop(shopSnap);
};
