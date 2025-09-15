/**
 * Utilidades para calcular coordenadas y posiciones de talentos
 */

export interface TalentPosition {
  x: number;
  y: number;
  tier: number;
  index: number;
}

export interface TalentGridConfig {
  talentSize: number;    // Tamaño del talento (64px)
  spacing: number;       // Espaciado entre talentos (16px)
  tierHeight: number;    // Altura entre tiers (80px)
  padding: number;       // Padding del contenedor (20px)
}

export const DEFAULT_GRID_CONFIG: TalentGridConfig = {
  talentSize: 64,
  spacing: 16,
  tierHeight: 80,
  padding: 20
};

/**
 * Calcula la posición de un talento en la grilla
 */
export function calculateTalentPosition(
  tier: number,
  index: number,
  config: TalentGridConfig = DEFAULT_GRID_CONFIG
): TalentPosition {
  const x = config.padding + index * (config.talentSize + config.spacing) + config.talentSize / 2;
  const y = config.padding + (tier - 1) * config.tierHeight + config.talentSize / 2;
  
  return { x, y, tier, index };
}

/**
 * Calcula el centro de un talento (punto de conexión para flechas)
 */
export function getTalentCenter(
  tier: number,
  index: number,
  config: TalentGridConfig = DEFAULT_GRID_CONFIG
): { x: number; y: number } {
  const position = calculateTalentPosition(tier, index, config);
  return { x: position.x, y: position.y };
}

/**
 * Calcula las dimensiones totales del árbol de talentos
 */
export function calculateTreeDimensions(
  tierCount: number,
  maxTalentsPerTier: number,
  config: TalentGridConfig = DEFAULT_GRID_CONFIG
): { width: number; height: number } {
  const width = config.padding * 2 + maxTalentsPerTier * (config.talentSize + config.spacing) - config.spacing;
  const height = config.padding * 2 + tierCount * config.tierHeight - (config.tierHeight - config.talentSize);
  
  return { width, height };
}

/**
 * Genera un path SVG para conectar dos talentos
 */
export function createConnectionPath(
  fromTier: number,
  fromIndex: number,
  toTier: number,
  toIndex: number,
  config: TalentGridConfig = DEFAULT_GRID_CONFIG
): string {
  const from = getTalentCenter(fromTier, fromIndex, config);
  const to = getTalentCenter(toTier, toIndex, config);
  
  const deltaX = to.x - from.x;
  const deltaY = to.y - from.y;
  
  // Si es una conexión vertical directa
  if (Math.abs(deltaX) < 10) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  
  // Si es diagonal o horizontal, usar curvas suaves
  if (Math.abs(deltaY) < 10) {
    // Horizontal
    const midX = from.x + deltaX / 2;
    return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  } else {
    // Diagonal - usar una curva en L
    const midY = from.y + deltaY * 0.6;
    return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
  }
}

/**
 * Determina si una flecha debe apuntar hacia arriba o abajo
 */
export function getArrowDirection(fromTier: number, toTier: number): 'up' | 'down' | 'horizontal' {
  if (toTier > fromTier) return 'down';
  if (toTier < fromTier) return 'up';
  return 'horizontal';
}
