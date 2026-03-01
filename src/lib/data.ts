import type { Shop } from './types';

export const shops: Shop[] = [
  {
    id: '1',
    name: 'Ganesh Kirana Store',
    category: 'Groceries',
    isOpen: true,
    location: '123, Main Bazaar, Rampur Village',
    phone: '9876543210',
    hours: '9:00 AM - 8:00 PM',
    description: 'Your one-stop shop for all daily needs, fresh vegetables, and household items. Serving the community for over 20 years.',
    imageUrl: 'https://picsum.photos/seed/shop1/600/400',
    imageHint: 'village store',
    products: [
      { id: 'p1-1', name: 'Fresh Vegetables', description: 'Locally sourced fresh vegetables, delivered daily.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/product1/400/300', imageHint: 'fresh vegetables' },
      { id: 'p1-2', name: 'Aashirvaad Atta', description: '10kg bag of whole wheat flour.', isAvailable: false, imageUrl: 'https://picsum.photos/seed/atta/400/300', imageHint: 'flour bag' },
    ],
  },
  {
    id: '2',
    name: 'Verma Electronics',
    category: 'Electronics',
    isOpen: false,
    location: '45, Market Lane, Sitapur',
    phone: '9988776655',
    hours: '10:00 AM - 7:00 PM',
    description: 'Sales and service of all major electronic brands. Mobile repair services available.',
    imageUrl: 'https://picsum.photos/seed/shop2/600/400',
    imageHint: 'electronics repair',
    products: [
      { id: 'p2-1', name: 'Mobile Phone Repair', description: 'Screen replacement and software issues for all smartphone models.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/mobilerepair/400/300', imageHint: 'phone repair' },
      { id: 'p2-2', name: 'Samsung 32" TV', description: 'HD Ready LED TV with 2 HDMI ports.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/tv/400/300', imageHint: 'television' },
    ],
  },
  {
    id: '3',
    name: 'Gupta Plumbing Services',
    category: 'Plumbing',
    isOpen: true,
    location: 'On-call service, Madhopur Area',
    phone: '8877665544',
    hours: '24/7 Emergency Service',
    description: 'Reliable and fast plumbing solutions for your home and business. Leakages, new installations, and repairs.',
    imageUrl: 'https://picsum.photos/seed/shop3/600/400',
    imageHint: 'plumbing van',
    products: [
      { id: 'p3-1', name: 'Emergency Leak Repair', description: '24/7 service to fix any water leakage issues.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/leak/400/300', imageHint: 'water leak' },
      { id: 'p3-2', name: 'New Bathroom Fitting', description: 'Complete installation of pipes, taps, and sanitary ware.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/product3/400/300', imageHint: 'plumbing pipes' },
    ],
  },
  {
    id: '4',
    name: 'Bijliwala & Sons',
    category: 'Electrician',
    isOpen: true,
    location: 'Shop no. 7, near Power House, Devgarh',
    phone: '7766554433',
    hours: '8:00 AM - 9:00 PM',
    description: 'Certified electricians for all your wiring, fixture, and appliance installation needs. Safety is our priority.',
    imageUrl: 'https://picsum.photos/seed/shop4/600/400',
    imageHint: 'electrician work',
    products: [
      { id: 'p4-1', name: 'House Wiring', description: 'Complete wiring for new constructions and renovations.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/wiring/400/300', imageHint: 'house wiring' },
      { id: 'p4-2', name: 'Fan & Light Installation', description: 'Quick installation of ceiling fans, LED lights, and other fixtures.', isAvailable: true, imageUrl: 'https://picsum.photos/seed/product4/400/300', imageHint: 'electrical wire' },
    ],
  },
];

export const getShops = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return shops;
};

export const getShopById = async (id: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return shops.find(shop => shop.id === id);
};
