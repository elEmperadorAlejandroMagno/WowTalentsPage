import { useCallback } from 'react';
import talentsData from '../data/talents_with_grid.json';
import type { ClassTalents } from '../types/types';
import { useTalentContext } from '../context/TalentContext';

// Hook para manejar dependencias basadas en 'enables'
// Cuando se agrega un punto a un talento X, este hook busca si X está listado
// en 'enables' de algún otro talento Y de la misma spec y, si existe, marca ese
// talento (Y) como disponible en el estado de la app (si manejan 'available').
export function useTalentDependencies() {
  const { state } = useTalentContext();

  const getClassTalents = (): ClassTalents => {
    return talentsData[state.currentClass as keyof typeof talentsData] as unknown as ClassTalents;
  };


  // Dado un talento en spec/tier/index, obtener su nombre
  const getTalentName = (spec: string, tier: string, index: number): string | null => {
    const classTalents = getClassTalents();
    const t = classTalents?.[spec]?.[tier]?.talents?.[index];
    return t?.name ?? null;
  };

  // Hook principal: dado que se agregó un punto en spec/tier/index, ver si ese talento
  // aparece como "habilitado" por otro (enables incluye su nombre). Si sí, podemos
  // retornar la lista de talentos a habilitar (por nombre) para que la UI/estado los marque.
  const computeTalentsToEnable = useCallback((spec: string, tier: string, index: number): string[] => {
    const currentTalentName = getTalentName(spec, tier, index);
    if (!currentTalentName) return [];

    const classTalents = getClassTalents();
    const toEnable: string[] = [];

    const specTalents = classTalents[spec];
    if (!specTalents) return [];

    for (const tierKey of Object.keys(specTalents)) {
      for (const talent of specTalents[tierKey].talents) {
        if (talent.enables && talent.enables.some((n) => n.toLowerCase() === currentTalentName.toLowerCase())) {
          toEnable.push(talent.name);
        }
      }
    }

    return toEnable;
  }, [state.currentClass]);

  return { computeTalentsToEnable };
}

