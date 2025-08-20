import { useEffect } from 'react';
import { initializeCleanupSystem } from '../utils/temporalStorage';

/**
 * Hook personalizado para inicializar y manejar el sistema de almacenamiento temporal
 */
export const useTemporalStorage = () => {
  useEffect(() => {
    // Inicializar el sistema de limpieza automática al montar el componente
    initializeCleanupSystem();
    
    // Cleanup function para cuando el componente se desmonta
    return () => {
      // No necesitamos limpiar nada específico aquí, 
      // ya que el sistema de limpieza seguirá funcionando en segundo plano
    };
  }, []);
};

export default useTemporalStorage;
