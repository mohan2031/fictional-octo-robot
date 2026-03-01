import type { Shop } from './types';
import { db } from '@/firebase/server';
import { collection, getDocs, doc, getDoc, DocumentData, Timestamp } from 'firebase/firestore';

const mapDocToShop = (document: DocumentData): Shop => {
    const data = document.data();
    return {
      id: document.id,
      name: data.name || 'Unnamed Shop',
      category: data.category || 'Groceries',
      isOpen: data.isOpen === true,
      location: data.location || 'No location',
      lat: data.lat || 0,
      lng: data.lng || 0,
      phone: data.phone || 'No phone',
      hours: data.hours || 'Not specified',
      description: data.description || 'No description provided.',
      products: data.products || [],
      imageUrl: data.imageUrl || `https://picsum.photos/seed/${document.id}/600/400`,
      imageHint: data.imageHint || 'shop',
      ownerId: data.ownerId || '',
      // Firestore timestamps need to be converted to JS Dates for serialization in Server Components
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    };
  };

export const getShops = async (): Promise<Shop[]> => {
  const shopsCol = collection(db, 'shops');
  const shopSnapshot = await getDocs(shopsCol);
  const shops = shopSnapshot.docs.map(mapDocToShop);
  return shops;
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
