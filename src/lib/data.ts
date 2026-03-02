import type { Clinic, Shop, Product } from './types';
import { db } from '@/firebase/server';
import { doc, getDoc, DocumentData, Timestamp, collection, getDocs } from 'firebase/firestore';
import { getPlaceholderImage } from './placeholder-images';

const mapDocToClinic = (document: DocumentData): Clinic => {
    const data = document.data();
    const placeholder = getPlaceholderImage(data.category || 'clinic');
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
      imageUrl: data.imageUrl || placeholder.imageUrl,
      imageHint: data.imageHint || placeholder.imageHint,
      ownerId: data.ownerId || '',
      // Firestore timestamps need to be converted to JS Dates for serialization in Server Components
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  };

export const getAllClinics = async (): Promise<Clinic[]> => {
    const clinicsRef = collection(db, 'clinics');
    const clinicsSnap = await getDocs(clinicsRef);
    if (clinicsSnap.empty) {
        return [];
    }
    return clinicsSnap.docs.map(mapDocToClinic);
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


const mapDocToShop = (document: DocumentData): Omit<Shop, 'products'> => {
    const data = document.data();
    const placeholder = getPlaceholderImage(data.category || 'shop');
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
      imageUrl: data.imageUrl || placeholder.imageUrl,
      imageHint: data.imageHint || placeholder.imageHint,
      ownerId: data.ownerId || '',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  };

export const getAllShops = async (): Promise<Shop[]> => {
    const shopsRef = collection(db, 'shops');
    const shopsSnap = await getDocs(shopsRef);
    if (shopsSnap.empty) {
        return [];
    }
    // The component expects a Shop[], but we don't need products for the list view.
    // Since products is optional, we can just return the mapped docs.
    return shopsSnap.docs.map(mapDocToShop);
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

  const shopData = mapDocToShop(shopSnap);

  const productsRef = collection(db, 'shops', id, 'products');
  const productsSnap = await getDocs(productsRef);
  const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  
  return {
    ...shopData,
    products,
  };
};
