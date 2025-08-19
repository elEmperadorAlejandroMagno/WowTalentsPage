import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { ClassTalents } from '../types/types';

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
  | { type: 'SET_CLASS'; className: string };

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
    
    return true;
  };
  
  const value = {
    state,
    dispatch,
    getTalentPoints,
    getSpecTotalPoints,
    canAssignPoint,
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
