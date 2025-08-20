import React, { useState, useEffect } from 'react';
import type { SavedTalentSpec } from '../types/types';
import ShareSpec from './ShareSpec';
import { useTemporalStorage } from '../hooks/useTemporalStorage';
import { getSpecFromUrl } from '../utils/temporalStorage';
import './App.example.css';

// Ejemplo de cómo integrar el sistema de compartir en tu aplicación principal
export const App: React.FC = () => {
  const [currentSpec, setCurrentSpec] = useState<SavedTalentSpec | null>(null);
  
  // Inicializar el sistema de almacenamiento temporal
  useTemporalStorage();

  // Cargar spec desde URL al inicializar la aplicación
  useEffect(() => {
    const specFromUrl = getSpecFromUrl();
    if (specFromUrl) {
      setCurrentSpec(specFromUrl);
      console.log('Spec cargada desde URL:', specFromUrl.name);
      
      // Opcional: Limpiar la URL después de cargar
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Función para crear una spec de ejemplo (reemplazar con tu lógica)
  const createExampleSpec = (): SavedTalentSpec => {
    return {
      id: Date.now().toString(),
      name: 'Warrior DPS Build',
      className: 'Warrior',
      assignedPoints: {
        'Arms': {
          'tier1': { 0: 5, 1: 0, 2: 0 },
          'tier2': { 0: 2, 1: 3, 2: 0 },
          'tier3': { 0: 0, 1: 1, 2: 4 },
        },
        'Fury': {
          'tier1': { 0: 0, 1: 5, 2: 0 },
          'tier2': { 0: 3, 1: 2, 2: 0 },
        },
        'Protection': {
          'tier1': { 0: 0, 1: 0, 2: 0 },
        }
      },
      totalPoints: 20,
      availablePoints: 31,
      createdAt: new Date().toISOString()
    };
  };

  const handleLoadExampleSpec = () => {
    const exampleSpec = createExampleSpec();
    setCurrentSpec(exampleSpec);
  };

  const handleSpecLoaded = (spec: SavedTalentSpec) => {
    setCurrentSpec(spec);
    alert(`Spec "${spec.name}" cargada exitosamente!`);
  };

  const handleSaveSpec = () => {
    if (currentSpec) {
      // Aquí irían tus lógica para guardar la spec localmente
      console.log('Guardando spec:', currentSpec);
      alert('Spec guardada localmente');
    }
  };

  const handleResetSpec = () => {
    setCurrentSpec(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>WoW Talent Simulator</h1>
      </header>

      <main className="app-main">
        {/* Tu componente de talentos principal iría aquí */}
        <div className="talent-calculator">
          <h2>Calculadora de Talentos</h2>
          {currentSpec ? (
            <div className="current-spec-display">
              <h3>Spec Actual: {currentSpec.name}</h3>
              <p>Clase: {currentSpec.className}</p>
              <p>Puntos usados: {currentSpec.totalPoints}/51</p>
              <button onClick={handleSaveSpec}>Guardar Spec</button>
              <button onClick={handleResetSpec}>Resetear</button>
            </div>
          ) : (
            <div className="no-spec-display">
              <p>No hay especificación cargada</p>
              <button onClick={handleLoadExampleSpec}>
                Cargar Spec de Ejemplo
              </button>
            </div>
          )}
        </div>

        {/* Componente para compartir specs */}
        <ShareSpec
          currentSpec={currentSpec}
          onSpecLoaded={handleSpecLoaded}
          showStats={true} // Mostrar estadísticas en desarrollo
        />
      </main>

      <footer className="app-footer">
        <p>© 2024 WoW Talent Simulator</p>
      </footer>
    </div>
  );
};

export default App;
