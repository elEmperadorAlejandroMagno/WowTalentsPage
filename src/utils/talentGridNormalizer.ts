import type { Talent, TalentTier, SpecTalents } from '../types/types';

/**
 * Configuración de la grilla normalizada
 */
export const GRID_CONFIG = {
  MAX_COLUMNS: 5,
  EMPTY_TALENT_PLACEHOLDER: null as Talent | null
};

/**
 * Representa un slot en la grilla que puede contener un talento o estar vacío
 */
export interface TalentGridSlot {
  talent: Talent | null;
  isEmpty: boolean;
  gridPosition: {
    tier: number;
    column: number;
  };
  originalIndex?: number; // Índice original del talento en el JSON
}

/**
 * Tier normalizado con grilla fija
 */
export interface NormalizedTalentTier {
  slots: TalentGridSlot[];
  requiredPoints: number;
  tierNumber: number;
}

/**
 * Especialización normalizada
 */
export interface NormalizedSpecTalents {
  [tier: string]: NormalizedTalentTier;
}

/**
 * Estrategias de posicionamiento para talentos
 */
export const PositioningStrategy = {
  LEFT_ALIGNED: 'left' as const,      // Alineados a la izquierda
  CENTER_ALIGNED: 'center' as const,  // Centrados
  DISTRIBUTED: 'distributed' as const // Distribuidos uniformemente
} as const;

export type PositioningStrategy = typeof PositioningStrategy[keyof typeof PositioningStrategy];

/**
 * Normaliza un tier de talentos para que tenga exactamente MAX_COLUMNS slots
 */
export function normalizeTalentTier(
  tierData: TalentTier, 
  tierNumber: number,
  strategy: PositioningStrategy = PositioningStrategy.CENTER_ALIGNED
): NormalizedTalentTier {
  const talents = tierData.talents;
  const slots: TalentGridSlot[] = [];

  // Crear array de MAX_COLUMNS slots vacíos
  for (let i = 0; i < GRID_CONFIG.MAX_COLUMNS; i++) {
    slots.push({
      talent: null,
      isEmpty: true,
      gridPosition: { tier: tierNumber, column: i }
    });
  }

  // Determinar posiciones según la estrategia
  let positions: number[] = [];
  
  switch (strategy) {
    case PositioningStrategy.LEFT_ALIGNED:
      // Talentos alineados desde la izquierda
      positions = talents.map((_, index) => index);
      break;
      
    case PositioningStrategy.CENTER_ALIGNED:
      // Talentos centrados
      const startPos = Math.floor((GRID_CONFIG.MAX_COLUMNS - talents.length) / 2);
      positions = talents.map((_, index) => startPos + index);
      break;
      
    case PositioningStrategy.DISTRIBUTED:
      // Talentos distribuidos uniformemente
      if (talents.length === 1) {
        positions = [Math.floor(GRID_CONFIG.MAX_COLUMNS / 2)];
      } else {
        const spacing = (GRID_CONFIG.MAX_COLUMNS - 1) / (talents.length - 1);
        positions = talents.map((_, index) => Math.round(index * spacing));
      }
      break;
  }

  // Colocar talentos en las posiciones calculadas
  talents.forEach((talent, index) => {
    const position = positions[index];
    slots[position] = {
      talent,
      isEmpty: false,
      gridPosition: { tier: tierNumber, column: position },
      originalIndex: index
    };
  });

  return {
    slots,
    requiredPoints: tierData.requiredPoints,
    tierNumber
  };
}

/**
 * Normaliza una especialización completa
 */
export function normalizeSpecTalents(
  specTalents: SpecTalents,
  strategy: PositioningStrategy = PositioningStrategy.CENTER_ALIGNED
): NormalizedSpecTalents {
  const normalized: NormalizedSpecTalents = {};

  Object.entries(specTalents).forEach(([tierKey, tierData]) => {
    const tierNumber = parseInt(tierKey);
    normalized[tierKey] = normalizeTalentTier(tierData, tierNumber, strategy);
  });

  return normalized;
}

/**
 * Obtiene el talento en una posición específica de la grilla
 */
export function getTalentAt(
  normalizedSpec: NormalizedSpecTalents,
  tier: number,
  column: number
): TalentGridSlot | null {
  const tierData = normalizedSpec[tier.toString()];
  if (!tierData || column < 0 || column >= GRID_CONFIG.MAX_COLUMNS) {
    return null;
  }
  
  return tierData.slots[column];
}

/**
 * Encuentra la posición de grilla de un talento por su nombre
 */
export function findTalentPosition(
  normalizedSpec: NormalizedSpecTalents,
  talentName: string
): { tier: number; column: number } | null {
  for (const [tierKey, tierData] of Object.entries(normalizedSpec)) {
    for (let column = 0; column < tierData.slots.length; column++) {
      const slot = tierData.slots[column];
      if (slot.talent && slot.talent.name === talentName) {
        return { tier: parseInt(tierKey), column };
      }
    }
  }
  return null;
}

/**
 * Convierte coordenadas de talento original a coordenadas de grilla normalizada
 */
export function originalToGridCoordinates(
  normalizedSpec: NormalizedSpecTalents,
  originalTier: number,
  originalIndex: number
): { tier: number; column: number } | null {
  const tierData = normalizedSpec[originalTier.toString()];
  if (!tierData) return null;

  for (let column = 0; column < tierData.slots.length; column++) {
    const slot = tierData.slots[column];
    if (!slot.isEmpty && slot.originalIndex === originalIndex) {
      return { tier: originalTier, column };
    }
  }
  
  return null;
}

/**
 * Obtiene todas las conexiones de dependencia en coordenadas de grilla
 */
export function getGridDependencies(
  normalizedSpec: NormalizedSpecTalents
): Array<{
  from: { tier: number; column: number };
  to: { tier: number; column: number };
  type: 'requires' | 'talentRequired';
  requiredPoints: number;
}> {
  const dependencies: Array<{
    from: { tier: number; column: number };
    to: { tier: number; column: number };
    type: 'requires' | 'talentRequired';
    requiredPoints: number;
  }> = [];

  Object.entries(normalizedSpec).forEach(([tierKey, tierData]) => {
    const tierNum = parseInt(tierKey);
    
    tierData.slots.forEach((slot, column) => {
      if (slot.isEmpty || !slot.talent) return;
      
      const talent = slot.talent;
      
      // Procesar dependencias 'requires'
      if (talent.requires) {
        talent.requires.forEach(dependency => {
          const fromCoords = originalToGridCoordinates(
            normalizedSpec,
            parseInt(dependency.tier),
            dependency.talentIndex
          );
          
          if (fromCoords) {
            dependencies.push({
              from: fromCoords,
              to: { tier: tierNum, column },
              type: 'requires',
              requiredPoints: dependency.minPoints
            });
          }
        });
      }
      
      // Procesar dependencia 'talentRequired'
      if (talent.talentRequired) {
        const required = talent.talentRequired;
        const fromCoords = originalToGridCoordinates(
          normalizedSpec,
          required.tier,
          required.index
        );
        
        if (fromCoords) {
          dependencies.push({
            from: fromCoords,
            to: { tier: tierNum, column },
            type: 'talentRequired',
            requiredPoints: required.points
          });
        }
      }
    });
  });

  return dependencies;
}
