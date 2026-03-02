'use client';

import { Timestamp, type DocumentData } from 'firebase/firestore';
import type {
  Appointment,
  Clinic,
  Inquiry,
  Product,
  Review,
  Shop,
  ShopInquiry,
  UserProfile,
} from './types';
import { getPlaceholderImage } from './placeholder-images';

function isTimestamp(value: any): value is Timestamp {
  return value && typeof value.toDate === 'function';
}

export function mapToAppointment(doc: DocumentData): Appointment {
  return {
    id: doc.id,
    clinicId: doc.clinicId || '',
    userId: doc.userId || '',
    patientName: doc.patientName || 'No Name',
    appointmentDate: isTimestamp(doc.appointmentDate) ? doc.appointmentDate.toDate() : new Date(),
    reason: doc.reason || '',
    status: doc.status || 'scheduled',
    createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
  };
}

export function mapToClinic(doc: DocumentData): Clinic {
  const placeholder = getPlaceholderImage(doc.category || 'clinic');
  return {
    id: doc.id,
    name: doc.name || 'Unnamed Clinic',
    category: doc.category || 'Other',
    isOpen: doc.isOpen === true,
    location: doc.location || 'No location',
    lat: doc.lat || 0,
    lng: doc.lng || 0,
    phone: doc.phone || 'No phone',
    hours: doc.hours || 'Not specified',
    description: doc.description || 'No description provided.',
    imageUrl: doc.imageUrl || placeholder.imageUrl,
    imageHint: doc.imageHint || placeholder.imageHint,
    ownerId: doc.ownerId || '',
    createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
  };
}

export function mapToInquiry(doc: DocumentData): Inquiry {
  return {
    id: doc.id,
    clinicId: doc.clinicId || '',
    userId: doc.userId,
    name: doc.name || 'No Name',
    contact: doc.contact || 'No contact',
    message: doc.message || '',
    isRead: doc.isRead === true,
    createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
  };
}

export function mapToProduct(doc: DocumentData): Product {
    const placeholder = getPlaceholderImage(doc.name);
    return {
        id: doc.id,
        name: doc.name || 'Unnamed Product',
        description: doc.description || 'No description',
        isAvailable: doc.isAvailable === true,
        imageUrl: doc.imageUrl || placeholder.imageUrl,
        imageHint: doc.imageHint || placeholder.imageHint,
        createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
    }
}

export function mapToShop(doc: DocumentData): Shop {
    const placeholder = getPlaceholderImage(doc.category || 'shop');
    return {
        id: doc.id,
        name: doc.name || 'Unnamed Shop',
        category: doc.category || 'Other',
        isOpen: doc.isOpen === true,
        location: doc.location || 'No location',
        lat: doc.lat || 0,
        lng: doc.lng || 0,
        phone: doc.phone || 'No phone',
        hours: doc.hours || 'Not specified',
        description: doc.description || 'No description provided.',
        imageUrl: doc.imageUrl || placeholder.imageUrl,
        imageHint: doc.imageHint || placeholder.imageHint,
        ownerId: doc.ownerId || '',
        createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
    };
}


export function mapToShopInquiry(doc: DocumentData): ShopInquiry {
  return {
    id: doc.id,
    shopId: doc.shopId || '',
    userId: doc.userId,
    name: doc.name || 'No Name',
    contact: doc.contact || 'No contact',
    message: doc.message || '',
    isRead: doc.isRead === true,
    createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
  };
}

export function mapToUserProfile(doc: DocumentData): UserProfile {
    return {
        id: doc.id,
        displayName: doc.displayName || 'No Name',
        email: doc.email || '',
        role: doc.role || 'customer',
        createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
    }
}

export function mapToReview(doc: DocumentData): Review {
    return {
        id: doc.id,
        businessId: doc.businessId || '',
        businessType: doc.businessType || 'shop',
        userId: doc.userId || '',
        authorName: doc.authorName || 'Anonymous',
        rating: doc.rating || 0,
        comment: doc.comment || '',
        createdAt: isTimestamp(doc.createdAt) ? doc.createdAt.toDate() : new Date(),
    }
}
