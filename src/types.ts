export type DashboardTab = 
  | 'Dashboard' 
  | 'My Birds' 
  | 'Couples' 
  | 'Eggs' 
  | 'AI Genetics' 
  | 'Marketplace' 
  | 'Advice' 
  | 'News' 
  | 'About Us' 
  | 'Contact Us' 
  | 'Settings' 
  | 'bird-profile' 
  | 'nests' 
  | 'medical' 
  | 'hatching' 
  | 'supplies' 
  | 'production' 
  | 'genetics' 
  | 'pedigree' 
  | 'terms' 
  | 'complaints' 
  | 'disclaimer' 
  | 'privacy' 
  | 'accessibility' 
  | 'sitemap';

export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  aviaryName: string;
  createdAt?: string;
}

export interface Bird {
  id: string;
  name?: string;
  ringNumber: string;
  species: string;
  mutation: string;
  sex: 'Male' | 'Female' | 'Unknown';
  birthDate: string;
  ownerId: string;
  photoURL?: string;
  notes?: string;
  fatherId?: string;
  motherId?: string;
  origin: 'Bred by me' | 'Purchased';
  healthStatus: string;
  availability: 'For Sale' | 'Bred' | 'Sold';
  isForSale?: boolean;
  salePrice?: number;
  publicProfileEnabled?: boolean;
  createdAt?: string; // Added for Supabase mapping
}

export interface Egg {
  id: string;
  layingDate: string;
  status: 'Laying' | 'Incubating' | 'Hatched' | 'Failed';
  hatchDate?: string;
}

export interface Nest {
  id: string;
  maleId?: string;
  femaleId?: string;
  pairName: string;
  firstEggDate?: string;
  status: 'Laying' | 'Incubating' | 'Hatching' | 'Fledging';
  eggsCount: number;
  chicksCount: number;
  ownerId: string;
  color?: string;
  eggs?: Egg[];
  notes?: string;
}

export interface ProductionRecord {
  id: string;
  birdId: string;
  ownerId: string;
  year: number;
  clutchNumber: number;
  eggsCount: number;
  hatchedCount: number;
  weanedCount: number;
  notes?: string;
  deleted?: boolean;
}

export interface MedicalRecord {
  id: string;
  birdId: string;
  ownerId: string;
  treatment: string;
  date: string;
  status: 'Upcoming' | 'Completed';
  notes?: string;
  type: 'Vaccination' | 'Treatment' | 'Checkup';
}

export interface SupplyItem {
  id: string;
  ownerId: string;
  name: string;
  stock: number;
  unit: string;
  minLevel: number;
  category: 'Food' | 'Medicine' | 'Equipment' | 'Other';
}
