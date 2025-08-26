import type { 
  ClassTalents, 
  ClassTalentsWithPoints, 
  SpecTalents, 
  SpecTalentsWithPoints,
  TalentTier,
  TalentTierWithPoints,
  Talent,
  TalentWithPoints 
} from '../types/types';

/**
 * Convierte un talento base (del JSON) a un talento con currentPoints
 */
export function convertTalentToWithPoints(talent: Talent): TalentWithPoints {
  return {
    ...talent,
    currentPoints: 0 // Inicializar con 0 puntos
  };
}

/**
 * Convierte un tier de talentos base a un tier con currentPoints
 */
export function convertTierToWithPoints(tier: TalentTier): TalentTierWithPoints {
  return {
    ...tier,
    talents: tier.talents.map(convertTalentToWithPoints)
  };
}

/**
 * Convierte una especialización base a una con currentPoints
 */
export function convertSpecToWithPoints(spec: SpecTalents): SpecTalentsWithPoints {
  const result: SpecTalentsWithPoints = {};
  
  Object.entries(spec).forEach(([tierKey, tierData]) => {
    result[tierKey] = convertTierToWithPoints(tierData);
  });
  
  return result;
}

/**
 * Convierte una clase completa base a una con currentPoints
 */
export function convertClassToWithPoints(classData: ClassTalents): ClassTalentsWithPoints {
  const result: ClassTalentsWithPoints = {};
  
  Object.entries(classData).forEach(([specKey, specData]) => {
    result[specKey] = convertSpecToWithPoints(specData);
  });
  
  return result;
}

/**
 * Inicializa la estructura de datos con currentPoints para una clase específica
 */
export function initializeClassTalentsWithPoints(classData: ClassTalents): ClassTalentsWithPoints {
  return convertClassToWithPoints(classData);
}

/**
 * Obtiene el número de puntos actuales de un talento específico
 */
export function getTalentCurrentPoints(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number
): number {
  const spec = classData[specName];
  if (!spec) return 0;
  
  const tierData = spec[tier];
  if (!tierData) return 0;
  
  const talent = tierData.talents[talentIndex];
  if (!talent) return 0;
  
  return talent.currentPoints;
}

/**
 * Establece el número de puntos actuales de un talento específico
 */
export function setTalentCurrentPoints(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number,
  points: number
): boolean {
  const spec = classData[specName];
  if (!spec) return false;
  
  const tierData = spec[tier];
  if (!tierData) return false;
  
  const talent = tierData.talents[talentIndex];
  if (!talent) return false;
  
  // Verificar que no exceda el máximo
  if (points < 0 || points > talent.maxPoints) return false;
  
  talent.currentPoints = points;
  return true;
}

/**
 * Incrementa los puntos actuales de un talento específico
 */
export function incrementTalentPoints(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number
): boolean {
  const currentPoints = getTalentCurrentPoints(classData, specName, tier, talentIndex);
  return setTalentCurrentPoints(classData, specName, tier, talentIndex, currentPoints + 1);
}

/**
 * Decrementa los puntos actuales de un talento específico
 */
export function decrementTalentPoints(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number
): boolean {
  const currentPoints = getTalentCurrentPoints(classData, specName, tier, talentIndex);
  return setTalentCurrentPoints(classData, specName, tier, talentIndex, currentPoints - 1);
}

/**
 * Calcula el total de puntos gastados en una especialización
 */
export function getSpecTotalPoints(
  classData: ClassTalentsWithPoints,
  specName: string
): number {
  const spec = classData[specName];
  if (!spec) return 0;
  
  let total = 0;
  Object.values(spec).forEach(tierData => {
    tierData.talents.forEach(talent => {
      total += talent.currentPoints;
    });
  });
  
  return total;
}

/**
 * Verifica si se cumplen las dependencias de un talento
 */
export function checkTalentDependencies(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number
): boolean {
  const spec = classData[specName];
  if (!spec) return false;
  
  const tierData = spec[tier];
  if (!tierData) return false;
  
  const talent = tierData.talents[talentIndex];
  if (!talent || !talent.requires) return true;
  
  // Verificar cada dependencia
  for (const dependency of talent.requires) {
    const requiredPoints = getTalentCurrentPoints(classData, specName, dependency.tier, dependency.talentIndex);
    if (requiredPoints < dependency.minPoints) {
      return false;
    }
  }
  
  return true;
}

/**
 * Verifica si el talento requerido está activo (tiene al menos los puntos necesarios)
 */
export function checkTalentRequired(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number
): boolean {
  const spec = classData[specName];
  if (!spec) return false;
  
  const tierData = spec[tier];
  if (!tierData) return false;
  
  const talent = tierData.talents[talentIndex];
  if (!talent || !talent.talentRequired) return true; // Si no hay talento requerido, está OK
  
  const required = talent.talentRequired;
  
  // Verificar que el tier requerido existe
  const requiredTierData = spec[required.tier.toString()];
  if (!requiredTierData) return false;
  
  // Verificar que el talento requerido existe
  const requiredTalent = requiredTierData.talents[required.index];
  if (!requiredTalent) return false;
  
  // Verificar que el talento requerido tiene al menos los puntos necesarios
  return requiredTalent.currentPoints >= required.points;
}

/**
 * Verifica si se puede asignar un punto a un talento
 */
export function canAssignPoint(
  classData: ClassTalentsWithPoints,
  specName: string,
  tier: string,
  talentIndex: number,
  availablePoints: number,
  tierRequiredPoints: number
): boolean {
  // Verificar puntos disponibles
  if (availablePoints <= 0) return false;
  
  const spec = classData[specName];
  if (!spec) return false;
  
  const tierData = spec[tier];
  if (!tierData) return false;
  
  const talent = tierData.talents[talentIndex];
  if (!talent) return false;
  
  // Verificar máximo de puntos en el talento
  if (talent.currentPoints >= talent.maxPoints) return false;
  
  // Verificar requisitos de puntos en la especialización
  const specTotalPoints = getSpecTotalPoints(classData, specName);
  if (specTotalPoints < tierRequiredPoints) return false;
  
  // Verificar dependencias del talento
  if (!checkTalentDependencies(classData, specName, tier, talentIndex)) {
    return false;
  }
  
  // Verificar si el talento requerido está activo
  if (!checkTalentRequired(classData, specName, tier, talentIndex)) {
    return false;
  }
  
  return true;
}

/**
 * Resetea todos los puntos de una especialización
 */
export function resetSpecPoints(
  classData: ClassTalentsWithPoints,
  specName: string
): void {
  const spec = classData[specName];
  if (!spec) return;
  
  Object.values(spec).forEach(tierData => {
    tierData.talents.forEach(talent => {
      talent.currentPoints = 0;
    });
  });
}

/**
 * Resetea todos los puntos de una clase completa
 */
export function resetClassPoints(classData: ClassTalentsWithPoints): void {
  Object.keys(classData).forEach(specName => {
    resetSpecPoints(classData, specName);
  });
}

/**
 * Convierte la estructura con currentPoints al formato de guardado legacy
 */
export function convertToLegacyFormat(classData: ClassTalentsWithPoints): {
  [spec: string]: {
    [tier: string]: {
      [talentIndex: number]: number;
    };
  };
} {
  const result: any = {};
  
  Object.entries(classData).forEach(([specName, specData]) => {
    result[specName] = {};
    
    Object.entries(specData).forEach(([tierName, tierData]) => {
      result[specName][tierName] = {};
      
      tierData.talents.forEach((talent, talentIndex) => {
        if (talent.currentPoints > 0) {
          result[specName][tierName][talentIndex] = talent.currentPoints;
        }
      });
    });
  });
  
  return result;
}

/**
 * Carga desde el formato legacy a la estructura con currentPoints
 */
export function loadFromLegacyFormat(
  classData: ClassTalentsWithPoints,
  legacyData: {
    [spec: string]: {
      [tier: string]: {
        [talentIndex: number]: number;
      };
    };
  }
): void {
  // Primero resetear todos los puntos
  resetClassPoints(classData);
  
  // Cargar los puntos desde el formato legacy
  Object.entries(legacyData).forEach(([specName, specData]) => {
    Object.entries(specData).forEach(([tierName, tierData]) => {
      Object.entries(tierData).forEach(([talentIndexStr, points]) => {
        const talentIndex = parseInt(talentIndexStr);
        setTalentCurrentPoints(classData, specName, tierName, talentIndex, points);
      });
    });
  });
}

/**
 * Guarda la estructura completa en localStorage con el nuevo formato
 */
export function saveToLocalStorage(
  className: string,
  talentData: ClassTalentsWithPoints,
  totalPoints: number,
  availablePoints: number
): void {
  const dataToSave = {
    className,
    talentData: JSON.parse(JSON.stringify(talentData)), // Deep copy
    totalPoints,
    availablePoints,
    timestamp: Date.now()
  };
  
  localStorage.setItem('wow_talents_current', JSON.stringify(dataToSave));
}

/**
 * Carga la estructura desde localStorage
 */
export function loadFromLocalStorage(): {
  className: string;
  talentData: ClassTalentsWithPoints;
  totalPoints: number;
  availablePoints: number;
} | null {
  try {
    const saved = localStorage.getItem('wow_talents_current');
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    return {
      className: parsed.className,
      talentData: parsed.talentData,
      totalPoints: parsed.totalPoints,
      availablePoints: parsed.availablePoints
    };
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}
