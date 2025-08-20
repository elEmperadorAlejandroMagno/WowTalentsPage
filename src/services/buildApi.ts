import type { SavedTalentSpec, ResponseData } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Guarda una build en el servidor remoto y devuelve el ID para compartir
 */
export async function saveBuildToServer(spec: SavedTalentSpec): Promise<{
  success: boolean;
  shareId?: string;
  expiresAt?: string;
  error?: string;
}> {
  try {
    const buildData = {
      id: `temp_${Date.now()}`,
      name: spec.name,
      className: spec.className,
      assignedPoints: spec.assignedPoints,
      totalPoints: spec.totalPoints,
      availablePoints: spec.availablePoints,
      createdAt: new Date().toISOString()
    };

    console.log('Saving build to server:', buildData);

    const response = await fetch(`${API_BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildData)
    });

    const result = await response.json();
    
    // Debug: Log completo de la respuesta
    console.log('Full server response:', result);
    console.log('Response status:', response.status);

    if (result.success) {
      // La API devuelve el ID directamente en result.id, no en result.data.id
      return {
        success: true,
        shareId: result.id,
        expiresAt: result.expiresAt
      };
    } else {
      console.error('Server error saving build:', result.error);
      return {
        success: false,
        error: result.error || 'Error desconocido del servidor'
      };
    }
  } catch (error) {
    console.error('Network error saving build:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor'
    };
  }
}

/**
 * Carga una build desde el servidor usando su ID
 */
export async function loadBuildFromServer(shareId: string): Promise<{
  success: boolean;
  build?: ResponseData;
  error?: string;
}> {
  try {
    console.log('Loading build from server:', shareId);

    const response = await fetch(`${API_BASE_URL}/data/${shareId}`);
    const result: { success: boolean; data?: SavedTalentSpec; error?: string } = await response.json();

    if (result.success && result.data) {
      // Convertir los datos del servidor al formato de SavedTalentSpec
      const build: ResponseData = {
        id: result.data.id,
        name: result.data.name,
        className: result.data.className,
        assignedPoints: result.data.assignedPoints,
        totalPoints: result.data.totalPoints,
        availablePoints: result.data.availablePoints,
      };

      return {
        success: true,
        build
      };
    } else {
      console.warn('Build not found or expired:', result.error);
      return {
        success: false,
        error: result.error || 'Build no encontrada o expirada'
      };
    }
  } catch (error) {
    console.error('Network error loading build:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor'
    };
  }

}