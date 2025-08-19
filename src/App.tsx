import React from 'react'
import Talents from './talents_tree.tsx'
import { TalentProvider, useTalentContext } from './context/TalentContext'
import talents from './data/turtle-wow-talents'
import './App.css'

// Componente interno que usa el contexto
function AppContent() {
  const { state, dispatch } = useTalentContext();

  // Obtener las clases disponibles desde los datos de talentos
  const availableClasses = Object.keys(talents);

  const handleReset = () => {
    dispatch({ type: 'RESET_TALENTS' });
  };

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedClass = event.target.value;
    dispatch({ 
      type: 'SET_CLASS', 
      className: selectedClass 
    });
  };

  return (
    <>
      <div>
        <h1>Simulador de Talentos WoW</h1>
        <h3>Prueba tus ramas de talentos de Turtle Wow</h3>
      </div>
      <div className="class-selector">
        <label htmlFor="wowClass">Clase de Personaje:</label>
        <select 
          name="wowClasses" 
          id="wowClass" 
          value={state.currentClass} 
          onChange={handleClassChange}
          className="class-select"
        >
          <option value="">Selecciona una clase</option>
          {availableClasses.map((wowClass) => (
            <option 
              key={wowClass}
              value={wowClass}
            >
              {wowClass.charAt(0).toUpperCase() + wowClass.slice(1)}
            </option>
            ))}
        </select>
      </div>
      <div className="card">
        <div className="points-info">
          <span className="available-points">
            Puntos disponibles: {state.availablePoints}/{state.totalPoints}
          </span>
          <button onClick={handleReset} className="reset-button">
            Resetear Talentos
          </button>
        </div>
        <p>
          Haz clic en los talentos para asignar puntos. Clic derecho para quitar puntos.
        </p>
      </div>
      <div>
        <Talents wowClass={state.currentClass} />
      </div>
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
