export enum Category {
  Food = 'Food',
  Electronics = 'Electronics',
  Clothing = 'Clothing',
  Documents = 'Documents',
  Medicine = 'Medicine',
  Misc = 'Misc',
  Tools = 'Tools'
}

export interface InventoryItem {
  id: string;
  name: string;
  location: string;
  category: Category;
  expiryDate?: string; // ISO Date string YYYY-MM-DD
  addedDate: string;
  imageUrl?: string; // Base64 or URL
  notes?: string;
}

export type ViewState = 'home' | 'add' | 'inventory' | 'profile';

export interface AIAnalysisResult {
  name: string;
  category: Category;
  expiryDate?: string;
  suggestedLocation?: string;
  notes?: string;
}
