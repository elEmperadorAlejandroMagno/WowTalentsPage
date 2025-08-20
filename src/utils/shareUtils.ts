import type { SavedTalentSpec } from '../types/types';

/**
 * Codifica una spec de talentos en una cadena comprimida para la URL
 */
export function encodeSpecToUrl(spec: SavedTalentSpec): string {
  try {
    // Crear una versión simplificada de la spec para reducir tamaño
    const simplifiedSpec = {
      n: spec.name,
      c: spec.className,
      p: spec.assignedPoints,
      t: spec.totalPoints
    };
    
    // Convertir a JSON y comprimir usando btoa (Base64)
    const jsonString = JSON.stringify(simplifiedSpec);
    const encoded = btoa(jsonString);
    
    return encoded;
  } catch (error) {
    console.error('Error encoding spec:', error);
    throw new Error('No se pudo codificar la especificación');
  }
}

/**
 * Decodifica una spec de talentos desde una cadena de URL
 */
export function decodeSpecFromUrl(encodedSpec: string): SavedTalentSpec {
  try {
    // Decodificar desde Base64
    const jsonString = atob(encodedSpec);
    const simplifiedSpec = JSON.parse(jsonString);
    
    // Reconstruir la spec completa
    const spec: SavedTalentSpec = {
      id: generateId(),
      name: simplifiedSpec.n,
      className: simplifiedSpec.c,
      assignedPoints: simplifiedSpec.p,
      totalPoints: simplifiedSpec.t,
      availablePoints: 51 - simplifiedSpec.t, // Asumiendo 51 puntos máximos
      createdAt: new Date().toISOString()
    };
    
    return spec;
  } catch (error) {
    console.error('Error decoding spec:', error);
    throw new Error('No se pudo decodificar la especificación desde la URL');
  }
}

/**
 * Genera una URL completa para compartir una spec
 */
export function generateShareUrl(spec: SavedTalentSpec, baseUrl?: string): string {
  const encoded = encodeSpecToUrl(spec);
  const currentUrl = baseUrl || window.location.origin + window.location.pathname;
  return `${currentUrl}?spec=${encoded}`;
}

/**
 * Extrae una spec desde los parámetros de la URL actual
 */
export function getSpecFromCurrentUrl(): SavedTalentSpec | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const specParam = urlParams.get('spec');
    
    if (!specParam) {
      return null;
    }
    
    return decodeSpecFromUrl(specParam);
  } catch (error) {
    console.error('Error loading spec from URL:', error);
    return null;
  }
}

/**
 * Genera un ID único simple
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Copia la URL de compartir al portapapeles
 */
export async function copyShareUrlToClipboard(spec: SavedTalentSpec): Promise<boolean> {
  try {
    const shareUrl = generateShareUrl(spec);
    await navigator.clipboard.writeText(shareUrl);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}
