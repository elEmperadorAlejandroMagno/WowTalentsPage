import React, { useState } from 'react';
import { useTalentContext } from '../context/TalentContext';
import './SaveSpecModal.css';

interface SaveSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (success: boolean, specName?: string) => void;
}

export default function SaveSpecModal({ isOpen, onClose, onSave }: SaveSpecModalProps) {
  const [specName, setSpecName] = useState('');
  const [error, setError] = useState('');
  const { saveSpec, getSavedSpecs } = useTalentContext();

  const handleSave = () => {
    const trimmedName = specName.trim();
    
    if (!trimmedName) {
      setError('Por favor ingresa un nombre para la especificación');
      return;
    }
    
    if (trimmedName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    
    if (trimmedName.length > 50) {
      setError('El nombre no puede exceder 50 caracteres');
      return;
    }
    
    // Verificar si ya existe una spec con ese nombre
    const existingSpecs = getSavedSpecs();
    if (existingSpecs.some(spec => spec.name.toLowerCase() === trimmedName.toLowerCase())) {
      setError('Ya existe una especificación con ese nombre');
      return;
    }
    
    const success = saveSpec(trimmedName);
    if (success) {
      setSpecName('');
      setError('');
      onSave(true);
      onClose();
    } else {
      setError('Error al guardar la especificación. Inténtalo de nuevo.');
      onSave(false);
    }
  };

  const handleClose = () => {
    setSpecName('');
    setError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Guardar Especificación</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p>Ingresa un nombre para tu especificación de talentos:</p>
          <input
            type="text"
            value={specName}
            onChange={(e) => {
              setSpecName(e.target.value);
              if (error) setError(''); // Limpiar error cuando el usuario empieza a escribir
            }}
            onKeyDown={handleKeyDown}
            placeholder="Mi especificación PvP"
            className={`spec-name-input ${error ? 'error' : ''}`}
            autoFocus
            maxLength={50}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="character-count">
            {specName.length}/50 caracteres
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!specName.trim()}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
