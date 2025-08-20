import type { SavedTalentSpec } from '../types/types';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SaveBuildResponse {
  id: string;
  build: SavedTalentSpec & {
    id: string;
    timestamp: string;
    createdAt: number;
    expiresAt: number;
    buildType: string;
  };
  expiresIn: string;
  expiresAt: string;
}

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

    const result: ApiResponse<SaveBuildResponse> = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        shareId: result.data.id,
        expiresAt: result.data.expiresAt
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
  build?: SavedTalentSpec;
  error?: string;
}> {
  try {
    console.log('Loading build from server:', shareId);

    const response = await fetch(`${API_BASE_URL}/data/${shareId}`);
    const result: ApiResponse<any> = await response.json();

    if (result.success && result.data) {
      // Convertir los datos del servidor al formato de SavedTalentSpec
      const build: SavedTalentSpec = {
        id: result.data.originalId || result.data.id,
        name: result.data.name,
        className: result.data.className,
        assignedPoints: result.data.assignedPoints,
        totalPoints: result.data.totalPoints,
        availablePoints: result.data.availablePoints,
        createdAt: result.data.timestamp || result.data.createdAt
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

/**
 * Obtiene estadísticas del servidor
 */
export async function getServerStats(): Promise<{
  success: boolean;
  stats?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const result: ApiResponse<any> = await response.json();

    if (result.success) {
      return {
        success: true,
        stats: result.data || result.stats
      };
    } else {
      return {
        success: false,
        error: result.error || 'Error obteniendo estadísticas'
      };
    }
  } catch (error) {
    console.error('Network error getting stats:', error);
    return {
      success: false,
      error: 'Error de conexión con el servidor'
    };
  }
}
