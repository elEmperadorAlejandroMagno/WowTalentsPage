import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SavedTalentSpec } from '../types/types';
import talents from '../data/talents_with_grid.json';

// Tipos para el contexto
export interface TalentPoints {
  [spec: string]: {
    [tier: string]: {
      [talentIndex: number]: number; // puntos asignados a cada talento
    };
  };
}

export interface TalentState {
  totalPoints: number;
  availablePoints: number;
  assignedPoints: TalentPoints;
  currentClass: string;
}

// Acciones del reducer
export type TalentAction =
  | { type: 'ADD_POINT'; spec: string; tier: string; talentIndex: number; maxPoints: number }
  | { type: 'REMOVE_POINT'; spec: string; tier: string; talentIndex: number }
  | { type: 'RESET_TALENTS' }
  | { type: 'SET_CLASS'; className: string }
  | { type: 'LOAD_SPEC'; spec: SavedTalentSpec }
  | { type: 'ENABLE_TALENTS'; talentNames: string[] }; // Nueva acción para habilitar talentos

// Estado inicial
const initialState: TalentState = {
  totalPoints: 51,
  availablePoints: 51,
  assignedPoints: {},
  currentClass: 'Paladin',
};

// Reducer
function talentReducer(state: TalentState, action: TalentAction): TalentState {
  switch (action.type) {
    case 'ADD_POINT': {
      const { spec, tier, talentIndex, maxPoints } = action;
      
      // Verificaciones
      if (state.availablePoints <= 0) return state;
      
      const currentPoints = state.assignedPoints[spec]?.[tier]?.[talentIndex] || 0;
      if (currentPoints >= maxPoints) return state;
      
      // Crear nueva estructura de puntos asignados
      const newAssignedPoints = { ...state.assignedPoints };
      if (!newAssignedPoints[spec]) newAssignedPoints[spec] = {};
      if (!newAssignedPoints[spec][tier]) newAssignedPoints[spec][tier] = {};
      
      newAssignedPoints[spec][tier][talentIndex] = currentPoints + 1;
      
      return {
        ...state,
        availablePoints: state.availablePoints - 1,
        assignedPoints: newAssignedPoints,
      };
    }
    
    case 'REMOVE_POINT': {
      const { spec, tier, talentIndex } = action;
      
      const currentPoints = state.assignedPoints[spec]?.[tier]?.[talentIndex] || 0;
      if (currentPoints <= 0) return state;
      
      // Crear nueva estructura de puntos asignados
      const newAssignedPoints = { ...state.assignedPoints };
      if (!newAssignedPoints[spec]) newAssignedPoints[spec] = {};
      if (!newAssignedPoints[spec][tier]) newAssignedPoints[spec][tier] = {};
      
      newAssignedPoints[spec][tier][talentIndex] = currentPoints - 1;
      
      return {
        ...state,
        availablePoints: state.availablePoints + 1,
        assignedPoints: newAssignedPoints,
      };
    }
    
    case 'RESET_TALENTS':
      return {
        ...state,
        availablePoints: state.totalPoints,
        assignedPoints: {},
      };
    
    case 'SET_CLASS':
      return {
        ...state,
        currentClass: action.className,
        availablePoints: state.totalPoints,
        assignedPoints: {},
      };
    
    case 'LOAD_SPEC':
      return {
        ...state,
        currentClass: action.spec.className,
        assignedPoints: action.spec.assignedPoints,
        availablePoints: action.spec.availablePoints,
        totalPoints: action.spec.totalPoints,
      };
    
    default:
      return state;
  }
}

// Contexto
const TalentContext = createContext<{
  state: TalentState;
  dispatch: React.Dispatch<TalentAction>;
  // Funciones de utilidad
  getTalentPoints: (spec: string, tier: string, talentIndex: number) => number;
  getSpecTotalPoints: (spec: string) => number;
  canAssignPoint: (spec: string, tier: string, talentIndex: number, maxPoints: number, requiredPoints: number) => boolean;
  // Función para procesar dependencias
  processTalentDependencies: (spec: string, tier: string, talentIndex: number) => void;
  // Funciones de guardado y carga
  saveSpec: (name: string) => boolean;
  loadSpec: (id: string) => boolean;
  getSavedSpecs: () => SavedTalentSpec[];
  deleteSpec: (id: string) => boolean;
} | null>(null);

// Provider
interface TalentProviderProps {
  children: ReactNode;
}

export function TalentProvider({ children }: TalentProviderProps) {
  const [state, dispatch] = useReducer(talentReducer, initialState);
  
  // Función para obtener puntos asignados a un talento específico
  const getTalentPoints = (spec: string, tier: string, talentIndex: number): number => {
    return state.assignedPoints[spec]?.[tier]?.[talentIndex] || 0;
  };
  
  // Función para obtener total de puntos en una especialización
  const getSpecTotalPoints = (spec: string): number => {
    let total = 0;
    const specPoints = state.assignedPoints[spec];
    if (!specPoints) return 0;
    
    Object.values(specPoints).forEach(tierPoints => {
      Object.values(tierPoints).forEach(points => {
        total += points;
      });
    });
    
    return total;
  };
  
  // Función para verificar si se puede asignar un punto
  const canAssignPoint = (
    spec: string, 
    tier: string, 
    talentIndex: number, 
    maxPoints: number, 
    requiredPoints: number
  ): boolean => {
    // Verificar puntos disponibles
    if (state.availablePoints <= 0) return false;
    
    // Verificar máximo de puntos en el talento
    const currentPoints = getTalentPoints(spec, tier, talentIndex);
    if (currentPoints >= maxPoints) return false;
    
    // Verificar requisitos de puntos en la especialización
    const specTotalPoints = getSpecTotalPoints(spec);
    if (specTotalPoints < requiredPoints) return false;
    
    // Verificar talento requerido (talentRequired)
    if (!checkTalentRequiredInContext(spec, tier, talentIndex)) {
      return false;
    }
    
    // Verificar dependencias (requires)
    if (!checkTalentDependencies(spec, tier, talentIndex)) {
      return false;
    }
    
    return true;
  };
  
  // Función auxiliar para verificar talentRequired en el contexto
  const checkTalentRequiredInContext = (
    spec: string,
    tier: string, 
    talentIndex: number
  ): boolean => {
    try {
      // Importar dinámicamente el JSON de talentos;
      const classTalents = JSON.parse(JSON.stringify(talents[state.currentClass as keyof typeof talents]));
      
      if (!classTalents || !classTalents[spec]) return true;
      
      const specTalents = classTalents[spec];
      const tierData = specTalents[tier];
      
      // Check new grid structure
      if (!tierData || !tierData.grid || !tierData.grid[talentIndex]) return true;
      
      const talentSlot = tierData.grid[talentIndex];
      if (!talentSlot || talentSlot.isEmpty || !talentSlot.talent) return true;
      
      const talent = talentSlot.talent;
      
      // Si no tiene talentRequired, está OK
      if (!talent.talentRequired) return true;
      
      const required = talent.talentRequired;
      
      // Verificar que el talento requerido tenga los puntos necesarios
      const requiredTalentPoints = getTalentPoints(spec, required.tier.toString(), required.index);
      return requiredTalentPoints >= required.points;
      
    } catch (error) {
      console.error('Error checking talentRequired:', error);
      return true; // En caso de error, permitir la asignación
    }
  };
  
  // Nueva función para verificar dependencias (requires)
  const checkTalentDependencies = (
    spec: string,
    tier: string,
    talentIndex: number
  ): boolean => {
    try {
      const classTalents = JSON.parse(JSON.stringify(talents[state.currentClass as keyof typeof talents]));
      
      if (!classTalents || !classTalents[spec]) return true;
      
      const specTalents = classTalents[spec];
      const tierData = specTalents[tier];
      
      // Check new grid structure
      if (!tierData || !tierData.grid || !tierData.grid[talentIndex]) return true;
      
      const talentSlot = tierData.grid[talentIndex];
      if (!talentSlot || talentSlot.isEmpty || !talentSlot.talent) return true;
      
      const talent = talentSlot.talent;
      
      // Si no hay talentos requeridos, está OK
      if (!talent.requires || talent.requires.length === 0) return true;
      
      // Check all required talents (all must have at least 1 point)
      return talent.requires.every((requiredTalentName: string) => {
        return checkRequiredTalentByName(spec, requiredTalentName);
      });
      
    } catch (error) {
      console.error('Error checking talent dependencies:', error);
      return true; // En caso de error, permitir la asignación
    }
  };
  
  // Función auxiliar para verificar dependencias por nombre de talento
  const checkRequiredTalentByName = (spec: string, requiredTalentName: string): boolean => {
    try {
      const classTalents = JSON.parse(JSON.stringify(talents[state.currentClass as keyof typeof talents]));
      
      if (!classTalents || !classTalents[spec]) return false;
      
      const specTalents = classTalents[spec];
      
      // Buscar el talento requerido en todos los tiers
      for (const [tierKey, tierData] of Object.entries(specTalents)) {
        if (tierData && (tierData as any).grid) {
          const grid = (tierData as any).grid;
          for (let gridIndex = 0; gridIndex < grid.length; gridIndex++) {
            const slot = grid[gridIndex];
            if (!slot.isEmpty && slot.talent && slot.talent.name === requiredTalentName) {
              // Encontramos el talento requerido, verificar que tiene al menos 1 punto
              const currentPoints = getTalentPoints(spec, tierKey, gridIndex);
              return currentPoints > 0;
            }
          }
        }
      }
      
      return false; // Talento requerido no encontrado
      
    } catch (error) {
      console.error('Error checking required talent by name:', error);
      return false;
    }
  };
  
  // Función para guardar especificación actual
  const saveSpec = (name: string): boolean => {
    try {
      const savedSpec: SavedTalentSpec = {
        id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        className: state.currentClass,
        assignedPoints: { ...state.assignedPoints },
        totalPoints: state.totalPoints,
        availablePoints: state.availablePoints,
        createdAt: new Date().toISOString(),
      };
      
      const existingSpecs = getSavedSpecs();
      const updatedSpecs = [...existingSpecs, savedSpec];
      
      localStorage.setItem('savedTalentSpecs', JSON.stringify(updatedSpecs));
      return true;
    } catch (error) {
      console.error('Error saving spec:', error);
      return false;
    }
  };
  
  // Función para cargar especificación
  const loadSpec = (id: string): boolean => {
    try {
      const savedSpecs = getSavedSpecs();
      const specToLoad = savedSpecs.find(spec => spec.id === id);
      
      if (!specToLoad) {
        console.error('Spec not found:', id);
        return false;
      }
      
      dispatch({ type: 'LOAD_SPEC', spec: specToLoad });
      return true;
    } catch (error) {
      console.error('Error loading spec:', error);
      return false;
    }
  };
  
  // Función para obtener especificaciones guardadas
  const getSavedSpecs = (): SavedTalentSpec[] => {
    try {
      const saved = localStorage.getItem('savedTalentSpecs');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error getting saved specs:', error);
      return [];
    }
  };
  
  // Función para eliminar especificación
  const deleteSpec = (id: string): boolean => {
    try {
      const existingSpecs = getSavedSpecs();
      const updatedSpecs = existingSpecs.filter(spec => spec.id !== id);
      
      localStorage.setItem('savedTalentSpecs', JSON.stringify(updatedSpecs));
      return true;
    } catch (error) {
      console.error('Error deleting spec:', error);
      return false;
    }
  };
  
  // Función para procesar dependencias de talentos
  const processTalentDependencies = (spec: string, tier: string, talentIndex: number): void => {
    try {
      // Obtener el talento actual
      const classTalents = JSON.parse(JSON.stringify(talents[state.currentClass as keyof typeof talents]));
      if (!classTalents || !classTalents[spec] || !classTalents[spec][tier]) return;
      
      const tierData = classTalents[spec][tier];
      if (!tierData || !tierData.grid || !tierData.grid[talentIndex]) return;
      
      const talentSlot = tierData.grid[talentIndex];
      if (!talentSlot || talentSlot.isEmpty || !talentSlot.talent) return;
      
      const talent = talentSlot.talent;
      if (!talent || !talent.enables || talent.enables.length === 0) return;
      
      // Log para debugging
      console.log(`🔗 Talento '${talent.name}' habilita:`, talent.enables);
      
      // Por ahora, solo logueamos qué talentos se deberían habilitar
      // En una implementación completa, aquí modificaríamos el estado 'available' 
      // de los talentos correspondientes en el JSON o en un estado local
      talent.enables.forEach((enabledTalentName: string) => {
        console.log(`  - Habilitando talento: ${enabledTalentName}`);
      });
      
    } catch (error) {
      console.error('Error processing talent dependencies:', error);
    }
  };
  
  const value = {
    state,
    dispatch,
    getTalentPoints,
    getSpecTotalPoints,
    canAssignPoint,
    processTalentDependencies,
    saveSpec,
    loadSpec,
    getSavedSpecs,
    deleteSpec,
  };
  
  return (
    <TalentContext.Provider value={value}>
      {children}
    </TalentContext.Provider>
  );
}

// Hook personalizado
export function useTalentContext() {
  const context = useContext(TalentContext);
  if (!context) {
    throw new Error('useTalentContext must be used within a TalentProvider');
  }
  return context;
}
