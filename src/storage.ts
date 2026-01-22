/**
 * MML Local Storage Utility
 */

export interface SavedMML {
  id: string;
  name: string;
  mml: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'gameboy-mml-saved';

/**
 * Generate unique ID
 */
function generateId(): string {
  return `mml-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all saved MMLs from localStorage
 */
export function getSavedMMLs(): SavedMML[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as SavedMML[];
  } catch {
    console.error('Failed to load saved MMLs');
    return [];
  }
}

/**
 * Save a new MML to localStorage
 */
export function saveMML(name: string, mml: string): SavedMML {
  const savedMMLs = getSavedMMLs();
  const now = Date.now();
  const newMML: SavedMML = {
    id: generateId(),
    name,
    mml,
    createdAt: now,
    updatedAt: now,
  };
  savedMMLs.push(newMML);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMMLs));
  return newMML;
}

/**
 * Update an existing MML
 */
export function updateMML(id: string, name: string, mml: string): SavedMML | null {
  const savedMMLs = getSavedMMLs();
  const index = savedMMLs.findIndex(item => item.id === id);
  if (index === -1) return null;

  savedMMLs[index] = {
    ...savedMMLs[index],
    name,
    mml,
    updatedAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedMMLs));
  return savedMMLs[index];
}

/**
 * Delete a saved MML
 */
export function deleteMML(id: string): boolean {
  const savedMMLs = getSavedMMLs();
  const filtered = savedMMLs.filter(item => item.id !== id);
  if (filtered.length === savedMMLs.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

/**
 * Get a specific MML by ID
 */
export function getMMLById(id: string): SavedMML | null {
  const savedMMLs = getSavedMMLs();
  return savedMMLs.find(item => item.id === id) ?? null;
}
