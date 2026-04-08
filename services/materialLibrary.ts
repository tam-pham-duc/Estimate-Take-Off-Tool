import { v4 as uuidv4 } from 'uuid';

export interface MaterialLibraryItem {
  id: string;
  buildingType: string;
  order: number;
  materialName: string;
  uom: string;
  materialFormula: string;
  createdAt: number;
}

const STORAGE_KEY = 'app_material_library';

export const MaterialLibraryService = {
  getAll: (): MaterialLibraryItem[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse material library', e);
      return [];
    }
  },

  saveAll: (items: MaterialLibraryItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  add: (item: Omit<MaterialLibraryItem, 'id' | 'createdAt'>): MaterialLibraryItem => {
    const items = MaterialLibraryService.getAll();
    const newItem: MaterialLibraryItem = {
      ...item,
      id: uuidv4(),
      createdAt: Date.now(),
    };
    items.push(newItem);
    MaterialLibraryService.saveAll(items);
    return newItem;
  },

  update: (id: string, updates: Partial<Omit<MaterialLibraryItem, 'id' | 'createdAt'>>) => {
    const items = MaterialLibraryService.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      MaterialLibraryService.saveAll(items);
    }
  },

  delete: (id: string) => {
    const items = MaterialLibraryService.getAll();
    const filtered = items.filter(item => item.id !== id);
    MaterialLibraryService.saveAll(filtered);
  }
};
