import React, { useState, useEffect } from 'react'
import Talents from './components/talents_tree.tsx'
import { TalentProvider, useTalentContext } from './context/TalentContext'
import SaveSpecModal from './components/SaveSpecModal.tsx'
import talents from './data/turtle-wow-talents'
import type { SavedTalentSpec } from './types/types'
import './App.css'
import ShareSpec from './components/ShareSpec';
import { useTemporalStorage } from './hooks/useTemporalStorage';
import { getSpecFromUrl } from './utils/temporalStorage';

// Componente interno que usa el contexto
function AppContent() {
  const { state, dispatch, getSavedSpecs, loadSpec, deleteSpec } = useTalentContext();
  const [savedSpecs, setSavedSpecs] = useState<SavedTalentSpec[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Obtener las clases disponibles desde los datos de talentos
  const availableClasses = Object.keys(talents);
  const savedClasses = localStorage.getItem('savedClasses');

  // Cargar especificaciones guardadas al montar el componente
  useEffect(() => {
    setSavedSpecs(getSavedSpecs());
  }, [getSavedSpecs]);

  // Inicializar el sistema de almacenamiento temporal  
  useTemporalStorage();

  // Verificar si hay una spec compartida en la URL al cargar
  useEffect(() => {
    const specFromUrl = getSpecFromUrl();
    if (specFromUrl) {
      handleSpecLoadedFromUrl(specFromUrl);
      // Limpiar la URL después de cargar (opcional)
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Función para mostrar notificaciones temporales
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_TALENTS' });
  };

  const handleSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    
    // Si el valor empieza con 'spec_', es una especificación guardada
    if (selectedValue.startsWith('spec_')) {
      const success = loadSpec(selectedValue);
      if (success) {
        showNotification('success', 'Especificación cargada correctamente');
      } else {
        showNotification('error', 'Error al cargar la especificación');
      }
    } else {
      // Es una clase normal
      dispatch({ 
        type: 'SET_CLASS', 
        className: selectedValue 
      });
    }
  };

  const handleSaveSpec = () => {
    if (!state.currentClass) {
      showNotification('error', 'Selecciona una clase primero');
      return;
    }
    
    const usedPoints = state.totalPoints - state.availablePoints;
    if (usedPoints === 0) {
      showNotification('error', 'Asigna al menos un punto de talento antes de guardar');
      return;
    }
    
    setShowSaveModal(true);
  };

  const handleSaveSuccess = (success: boolean) => {
    if (success) {
      setSavedSpecs(getSavedSpecs()); // Actualizar la lista
      showNotification('success', 'Especificación guardada correctamente');
    } else {
      showNotification('error', 'Error al guardar la especificación');
    }
  };

  const handleDeleteSpec = (specId: string, specName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la especificación "${specName}"?`)) {
      const success = deleteSpec(specId);
      if (success) {
        setSavedSpecs(getSavedSpecs()); // Actualizar la lista
        showNotification('success', 'Especificación eliminada');
      } else {
        showNotification('error', 'Error al eliminar la especificación');
      }
    }
  };

  // Función para manejar spec cargada desde URL compartida
  const handleSpecLoadedFromUrl = (spec: SavedTalentSpec) => {
    // Cargar la clase primero
    dispatch({ 
      type: 'SET_CLASS', 
      className: spec.className 
    });
    
    // Cargar los puntos asignados
    dispatch({
      type: 'LOAD_SPEC',
      spec: spec
    });
    
    showNotification('success', `Especificación "${spec.name}" cargada desde URL compartida`);
  };

  // Función para manejar spec cargada desde el componente ShareSpec
  const handleSpecLoaded = (spec: SavedTalentSpec) => {
    handleSpecLoadedFromUrl(spec);
  };

  // Crear spec actual para compartir basada en el estado actual
  const createCurrentSpecForSharing = (): SavedTalentSpec | null => {
    if (!state.currentClass) {
      return null;
    }
    
    const usedPoints = state.totalPoints - state.availablePoints;
    if (usedPoints === 0) {
      return null;
    }
    
    return {
      id: `temp_${Date.now()}`,
      name: `${state.currentClass} Build`,
      className: state.currentClass,
      assignedPoints: state.assignedPoints,
      totalPoints: state.totalPoints,
      availablePoints: state.availablePoints,
      createdAt: new Date().toISOString()
    };
  };

  // Encontrar la especificación actual si se cargó una
  const currentSpec = savedSpecs.find(spec => 
    JSON.stringify(spec.assignedPoints) === JSON.stringify(state.assignedPoints) &&
    spec.className === state.currentClass
  );

  return (
    <>
      {/* Notificación */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div>
        <h1>Simulador de Talentos WoW</h1>
        <h3>Prueba tus ramas de talentos de Wow sin gastar oro</h3>
      </div>
      
      <div className="class-selector">
        <label htmlFor="wowClass">Clase de Personaje / Especificación:</label>
        <div className="selector-container">
          <select 
            name="wowClasses" 
            id="wowClass" 
            value={currentSpec ? currentSpec.id : state.currentClass} 
            onChange={handleSelectionChange}
            className="class-select"
          >
            <option value="" disabled>Selecciona una clase o especificación</option>
            
            {/* Separador para clases */}
            <optgroup label="Classes disponibles">
              {availableClasses.map((wowClass) => (
                <option 
                  key={wowClass}
                  value={wowClass}
                >
                  {wowClass.charAt(0).toUpperCase() + wowClass.slice(1)}
                </option>
              ))}
              {savedClasses && JSON.parse(savedClasses).map((savedClass: string) => (
                <option 
                  key={savedClass}
                  value={savedClass}
                >
                  {savedClass.charAt(0).toUpperCase() + savedClass.slice(1)}
                </option>
              ))}
            </optgroup>
            
            {/* Separador para especificaciones guardadas */}
            {savedSpecs.length > 0 && (
              <optgroup label="Especificaciones guardadas">
                {savedSpecs.map((spec) => (
                  <option 
                    key={spec.id}
                    value={spec.id}
                  >
                    {spec.name} ({spec.className}) - {spec.totalPoints - spec.availablePoints}/{spec.totalPoints} pts
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          
          {/* Botón para eliminar especificación actual */}
          {currentSpec && (
            <button 
              className="delete-spec-btn"
              onClick={() => handleDeleteSpec(currentSpec.id, currentSpec.name)}
              title="Eliminar especificación actual"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      
      <div className="card">
        <div className="points-info">
          <span className="available-points">
            Puntos disponibles: {state.availablePoints}/{state.totalPoints}
          </span>
          <div className="action-buttons">
            <button onClick={handleSaveSpec} className="save-button">
              💾 Guardar Especificación
            </button>
            <button onClick={handleReset} className="reset-button">
              🔄 Resetear Talentos
            </button>
          </div>
        </div>
        <p>
          Haz clic en los talentos para asignar puntos. Clic derecho para quitar puntos.
        </p>
      </div>
      
      <div>
        <Talents wowClass={state.currentClass} />
      </div>
      <div>
        <ShareSpec 
          currentSpec={currentSpec || createCurrentSpecForSharing()}
          onSpecLoaded={handleSpecLoaded}
          showStats={false}
        />
      </div>
      
      {/* Modal para guardar especificación */}
      <SaveSpecModal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSuccess}
      />
    </>
  )
}

// Componente principal con el Provider
function App() {
  return (
    <TalentProvider>
      <AppContent />
    </TalentProvider>
  )
}

export default App
