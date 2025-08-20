import { v4 as uuidv4 } from 'uuid';
import type { SavedTalentSpec } from '../types/types';

// Configuración del almacenamiento temporal
const STORAGE_KEY = 'wow_talent_specs_temp';
const EXPIRY_HOURS = 2; // Las specs expiran en 2 horas
const MAX_SPECS = 100; // Máximo 100 specs almacenadas
const CLEANUP_INTERVAL = 30 * 60 * 1000; // Limpieza cada 30 minutos (en ms)

interface StoredSpec extends SavedTalentSpec {
  expiresAt: string;
  shareId: string;
  sharedAt: string;
}

interface TempStorage {
  specs: { [shareId: string]: StoredSpec };
  lastCleanup: string;
  version: string; // Para manejar cambios de esquema en el futuro
}

/**
 * Guarda una spec de talentos temporalmente y devuelve un UUID para compartir
 */
export function saveSpecTemporarily(spec: SavedTalentSpec): string {
  try {
    const shareId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    
    const storedSpec: StoredSpec = {
      ...spec,
      shareId,
      expiresAt,
      sharedAt: now.toISOString()
    };
    
    const storage = getStorage();
    storage.specs[shareId] = storedSpec;
    
    // Limpiar specs antiguas si hay demasiadas
    cleanupExpiredSpecs(storage);
    limitStorageSize(storage);
    
    setStorage(storage);
    
    console.log(`Spec "${spec.name}" guardada temporalmente con ID: ${shareId}`);
    return shareId;
  } catch (error) {
    console.error('Error saving spec temporarily:', error);
    throw new Error('No se pudo guardar la especificación temporalmente');
  }
}

/**
 * Carga una spec usando su UUID de compartir
 */
export function loadSpecByShareId(shareId: string): SavedTalentSpec | null {
  try {
    // Validar que el shareId tenga formato UUID
    if (!isValidUUID(shareId)) {
      console.warn('Invalid UUID format:', shareId);
      return null;
    }

    const storage = getStorage();
    const storedSpec = storage.specs[shareId];
    
    if (!storedSpec) {
      console.log('Spec not found for ID:', shareId);
      return null;
    }
    
    // Verificar si la spec ha expirado
    if (new Date(storedSpec.expiresAt) < new Date()) {
      console.log('Spec expired for ID:', shareId);
      delete storage.specs[shareId];
      setStorage(storage);
      return null;
    }
    
    // Devolver la spec sin los campos de almacenamiento temporal
    const { shareId: _, expiresAt: __, sharedAt: ___, ...spec } = storedSpec;
    console.log(`Spec "${spec.name}" cargada desde ID: ${shareId}`);
    return spec;
  } catch (error) {
    console.error('Error loading spec by share ID:', error);
    return null;
  }
}

/**
 * Genera una URL completa para compartir una spec
 */
export function generateShareUrl(spec: SavedTalentSpec): string {
  const shareId = saveSpecTemporarily(spec);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?share=${shareId}`;
}

/**
 * Obtiene una spec desde la URL actual si existe
 */
export function getSpecFromUrl(): SavedTalentSpec | null {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get('share');
  
  if (!shareId) {
    return null;
  }
  
  return loadSpecByShareId(shareId);
}

/**
 * Copia la URL de compartir al portapapeles
 */
export async function copyShareUrlToClipboard(spec: SavedTalentSpec): Promise<boolean> {
  try {
    const shareUrl = generateShareUrl(spec);
    await navigator.clipboard.writeText(shareUrl);
    console.log('Share URL copied to clipboard:', shareUrl);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Inicializa el sistema de limpieza automática
 */
export function initializeCleanupSystem(): void {
  // Limpiar al cargar la página
  cleanupExpiredSpecs();
  
  // Configurar limpieza periódica
  setInterval(() => {
    cleanupExpiredSpecs();
  }, CLEANUP_INTERVAL);
  
  console.log('Temporal storage cleanup system initialized');
}

/**
 * Obtiene las estadísticas del almacenamiento temporal
 */
export function getStorageStats(): { 
  total: number; 
  expired: number; 
  sizeKB: number; 
  oldestExpiry: string | null;
  newestExpiry: string | null;
} {
  const storage = getStorage();
  const specs = Object.values(storage.specs);
  const now = new Date();
  
  const expired = specs.filter(spec => new Date(spec.expiresAt) < now).length;
  const sizeKB = Math.round(JSON.stringify(storage).length / 1024);
  
  let oldestExpiry: string | null = null;
  let newestExpiry: string | null = null;
  
  if (specs.length > 0) {
    const validSpecs = specs.filter(spec => new Date(spec.expiresAt) >= now);
    if (validSpecs.length > 0) {
      const expiryDates = validSpecs.map(spec => new Date(spec.expiresAt));
      oldestExpiry = new Date(Math.min(...expiryDates.map(d => d.getTime()))).toISOString();
      newestExpiry = new Date(Math.max(...expiryDates.map(d => d.getTime()))).toISOString();
    }
  }
  
  return {
    total: specs.length,
    expired,
    sizeKB,
    oldestExpiry,
    newestExpiry
  };
}

/**
 * Limpia manualmente todas las specs expiradas
 */
export function forceCleanup(): number {
  const storage = getStorage();
  const initialCount = Object.keys(storage.specs).length;
  cleanupExpiredSpecs(storage);
  setStorage(storage);
  const finalCount = Object.keys(storage.specs).length;
  const cleaned = initialCount - finalCount;
  console.log(`Force cleanup completed. Removed ${cleaned} expired specs.`);
  return cleaned;
}

// Funciones auxiliares privadas

function getStorage(): TempStorage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { 
        specs: {}, 
        lastCleanup: new Date().toISOString(),
        version: '1.0'
      };
    }
    const parsed = JSON.parse(stored);
    
    // Migrar versiones antiguas si es necesario
    if (!parsed.version) {
      parsed.version = '1.0';
    }
    
    return parsed;
  } catch (error) {
    console.warn('Error reading temporary storage, resetting...', error);
    return { 
      specs: {}, 
      lastCleanup: new Date().toISOString(),
      version: '1.0'
    };
  }
}

function setStorage(storage: TempStorage): void {
  try {
    storage.lastCleanup = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Error writing to temporary storage:', error);
    // Si falla (por ejemplo, por falta de espacio), limpiar todo y guardar solo lo esencial
    const essentialStorage: TempStorage = {
      specs: {},
      lastCleanup: new Date().toISOString(),
      version: '1.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(essentialStorage));
  }
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function cleanupExpiredSpecs(storage?: TempStorage): void {
  const store = storage || getStorage();
  const now = new Date();
  let cleaned = 0;
  
  Object.keys(store.specs).forEach(shareId => {
    if (new Date(store.specs[shareId].expiresAt) < now) {
      delete store.specs[shareId];
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} expired specs`);
    if (!storage) {
      setStorage(store);
    }
  }
}

function limitStorageSize(storage: TempStorage): void {
  const specs = Object.values(storage.specs);
  
  if (specs.length <= MAX_SPECS) {
    return;
  }
  
  // Ordenar por fecha de expiración y mantener solo las más recientes
  specs.sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime());
  
  const specsToKeep = specs.slice(0, MAX_SPECS);
  storage.specs = {};
  
  specsToKeep.forEach(spec => {
    storage.specs[spec.shareId] = spec;
  });
  
  console.log(`Limited storage to ${MAX_SPECS} specs (removed ${specs.length - MAX_SPECS} older specs)`);
}
