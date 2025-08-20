import React, { useState, useEffect, useRef } from 'react';
import type { ResponseData, SavedTalentSpec } from '../types/types';
import { saveBuildToServer, loadBuildFromServer } from '../services/buildApi';
import './ShareSpec.css';

interface ShareSpecProps {
  currentSpec: SavedTalentSpec | null;
  onSpecLoaded?: (spec: ResponseData) => void;
}

export const ShareSpec: React.FC<ShareSpecProps> = ({ 
  currentSpec, 
  onSpecLoaded
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const hasLoadedRef = useRef(false);

  // Verificar si hay una spec en la URL al cargar el componente (solo una vez)
  useEffect(() => {
    if (hasLoadedRef.current) return; // Evitar múltiples ejecuciones
    
    const checkForSharedBuild = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const buildId = urlParams.get('build');
      
      if (buildId && onSpecLoaded) {
        hasLoadedRef.current = true; // Marcar como cargado
        setLoading(true);
        
        try {
          const result = await loadBuildFromServer(buildId);
          
          if (result.success && result.build) {
            onSpecLoaded(result.build);
            console.log('Build compartida cargada:', result.build.name);
            
            // Limpiar la URL para que no se recargue constantemente
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, '', newUrl);
          } else {
            setError(result.error || 'No se pudo cargar la build compartida');
          }
        } catch (err) {
          setError('Error cargando build compartida');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkForSharedBuild();
  }, []); // Sin dependencias - solo se ejecuta una vez


  const handleShare = async () => {
    if (!currentSpec) {
      setError('No hay especificación para compartir');
      return;
    }

    setLoading(true);
    setError('');
    setCopySuccess(false);
    setShareUrl('');

    try {
      // Guardar en el servidor remoto
      const result = await saveBuildToServer(currentSpec);
      
      if (result.success && result.shareId) {
        // Generar URL con el ID del servidor
        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}?build=${result.shareId}`;
        setShareUrl(url);
        
        // Copiar automáticamente al portapapeles
        try {
          await navigator.clipboard.writeText(url);
          setCopySuccess(true);
        } catch (clipboardError) {
          console.warn('No se pudo copiar automáticamente:', clipboardError);
        }
        
        console.log(`Build compartida: ${result.shareId}`);
        console.log(`Expira: ${result.expiresAt}`);
      } else {
        setError(result.error || 'Error guardando en el servidor');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      setError('No se pudo copiar al portapapeles');
      console.warn(error)
    }
  };

  return (
    <div className="share-spec-container">
      <div className="share-section">
        <h3>Compartir Especificación</h3>
        
        {loading && <div className="loading-message">🔄 Procesando...</div>}
        
        {currentSpec ? (
          <div className="current-spec-info">
            <p><strong>Spec actual:</strong> {currentSpec.name}</p>
            <p><strong>Clase:</strong> {currentSpec.className}</p>
            <p><strong>Puntos usados:</strong> {currentSpec.totalPoints}</p>
          </div>
        ) : (
          <p className="no-spec-message">No hay especificación cargada para compartir</p>
        )}

        <button 
          onClick={handleShare}
          disabled={!currentSpec || loading}
          className={`share-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Generando...' : '🔗 Compartir Especificación'}
        </button>

        {shareUrl && (
          <div className="share-url-section">
            <label htmlFor="share-url">URL para compartir (expira en 2 horas):</label>
            <div className="url-input-container">
              <input
                id="share-url"
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
                onClick={(e) => e.currentTarget.select()}
              />
              <button 
                onClick={handleCopyUrl}
                className="copy-button"
              >
                {copySuccess ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {copySuccess && !error && (
          <div className="success-message">
            ✅ ¡URL copiada al portapapeles!
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareSpec;
