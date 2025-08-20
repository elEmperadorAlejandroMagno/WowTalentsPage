import React, { useState, useEffect } from 'react';
import type { SavedTalentSpec } from '../types/types';
import { 
  generateShareUrl, 
  copyShareUrlToClipboard, 
  getSpecFromUrl,
  getStorageStats,
  forceCleanup
} from '../utils/temporalStorage';
import './ShareSpec.css';

interface ShareSpecProps {
  currentSpec: SavedTalentSpec | null;
  onSpecLoaded?: (spec: SavedTalentSpec) => void;
  showStats?: boolean;
}

export const ShareSpec: React.FC<ShareSpecProps> = ({ 
  currentSpec, 
  onSpecLoaded,
  showStats = false 
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<any>(null);

  // Verificar si hay una spec en la URL al cargar el componente
  useEffect(() => {
    const specFromUrl = getSpecFromUrl();
    if (specFromUrl && onSpecLoaded) {
      onSpecLoaded(specFromUrl);
    }
  }, [onSpecLoaded]);

  // Actualizar estadísticas si se muestran
  useEffect(() => {
    if (showStats) {
      setStats(getStorageStats());
    }
  }, [showStats]);

  const handleShare = async () => {
    if (!currentSpec) {
      setError('No hay especificación para compartir');
      return;
    }

    setLoading(true);
    setError('');
    setCopySuccess(false);

    try {
      const url = generateShareUrl(currentSpec);
      setShareUrl(url);
      
      const success = await copyShareUrlToClipboard(currentSpec);
      setCopySuccess(success);
      
      if (!success) {
        setError('No se pudo copiar al portapapeles');
      }
    } catch (err) {
      setError('Error al generar la URL de compartir');
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
    } catch (err) {
      setError('No se pudo copiar al portapapeles');
    }
  };

  const handleCleanup = () => {
    const cleaned = forceCleanup();
    setStats(getStorageStats());
    alert(`Se eliminaron ${cleaned} especificaciones expiradas`);
  };

  return (
    <div className="share-spec-container">
      <div className="share-section">
        <h3>Compartir Especificación</h3>
        
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
          {loading ? 'Generando...' : 'Compartir Especificación'}
        </button>

        {shareUrl && (
          <div className="share-url-section">
            <label htmlFor="share-url">URL para compartir:</label>
            <div className="url-input-container">
              <input
                id="share-url"
                type="text"
                value={shareUrl}
                readOnly
                className="share-url-input"
              />
              <button 
                onClick={handleCopyUrl}
                className="copy-button"
              >
                {copySuccess ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="url-info">
              Esta URL expira en 2 horas y se puede compartir libremente.
            </p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {copySuccess && !error && (
          <div className="success-message">
            ¡URL copiada al portapapeles!
          </div>
        )}
      </div>

      {showStats && stats && (
        <div className="storage-stats">
          <h4>Estadísticas de Almacenamiento</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <label>Specs almacenadas:</label>
              <span>{stats.total}</span>
            </div>
            <div className="stat-item">
              <label>Specs expiradas:</label>
              <span>{stats.expired}</span>
            </div>
            <div className="stat-item">
              <label>Tamaño total:</label>
              <span>{stats.sizeKB} KB</span>
            </div>
            {stats.oldestExpiry && (
              <div className="stat-item">
                <label>Expira más antigua:</label>
                <span>{new Date(stats.oldestExpiry).toLocaleString()}</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleCleanup}
            className="cleanup-button"
          >
            Limpiar Expiradas
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareSpec;
