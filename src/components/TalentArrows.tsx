import React from 'react';
import type { Talent } from '../types/types';

interface TalentArrowsProps {
  spec: string;
  tier: string;
  talentIndex: number;
  talent: Talent;
  talentColumns: number; // Número de talentos por fila para calcular posiciones
}

interface ArrowProps {
  fromTier: string;
  fromIndex: number;
  toTier: string;
  toIndex: number;
  isActive: boolean; // Si la dependencia está satisfecha
}

// Componente individual para una flecha
function Arrow({ fromTier, fromIndex, toTier, toIndex, isActive }: ArrowProps) {
  // Calcular posiciones de los talentos
  const tierHeight = 80; // Altura de cada tier
  const talentWidth = 64; // Ancho de cada talento
  const talentSpacing = 16; // Espaciado entre talentos
  
  const fromTierNum = parseInt(fromTier);
  const toTierNum = parseInt(toTier);
  
  // Posición del talento origen
  const fromX = fromIndex * (talentWidth + talentSpacing) + talentWidth / 2;
  const fromY = (fromTierNum - 1) * tierHeight + talentWidth / 2;
  
  // Posición del talento destino
  const toX = toIndex * (talentWidth + talentSpacing) + talentWidth / 2;
  const toY = (toTierNum - 1) * tierHeight + talentWidth / 2;
  
  // Crear el path de la flecha
  const createArrowPath = () => {
    const deltaX = toX - fromX;
    const deltaY = toY - fromY;
    
    // Si es una flecha vertical simple
    if (Math.abs(deltaX) < 10) {
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
    
    // Si es una flecha diagonal u horizontal
    const midY = fromY + deltaY / 2;
    return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
  };
  
  // Crear la punta de la flecha
  const createArrowHead = () => {
    const arrowSize = 6;
    const deltaY = toY - fromY;
    
    if (deltaY > 0) {
      // Flecha hacia abajo
      return `M ${toX - arrowSize} ${toY - arrowSize} L ${toX} ${toY} L ${toX + arrowSize} ${toY - arrowSize}`;
    } else {
      // Flecha hacia arriba
      return `M ${toX - arrowSize} ${toY + arrowSize} L ${toX} ${toY} L ${toX + arrowSize} ${toY + arrowSize}`;
    }
  };
  
  return (
    <g className={`talent-arrow ${isActive ? 'active' : 'inactive'}`}>
      <path
        d={createArrowPath()}
        stroke={isActive ? '#ffd700' : '#666'}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
      <path
        d={createArrowHead()}
        stroke={isActive ? '#ffd700' : '#666'}
        strokeWidth="2"
        fill="none"
      />
    </g>
  );
}

// Componente principal para todas las flechas de un talento
function TalentArrows({ spec, tier, talentIndex, talent, talentColumns: _talentColumns }: TalentArrowsProps) {
  if (!talent.requires || talent.requires.length === 0) {
    return null;
  }
  
  return (
    <g className="talent-arrows-group">
      {talent.requires.map((dependency, index) => (
        <Arrow
          key={`${spec}-${tier}-${talentIndex}-dep-${index}`}
          fromTier={dependency.tier}
          fromIndex={dependency.talentIndex}
          toTier={tier}
          toIndex={talentIndex}
          isActive={true} // Por ahora siempre true, se podría verificar si está satisfecha
        />
      ))}
    </g>
  );
}

// Componente contenedor SVG para todas las flechas de una especialización
interface SpecArrowsProps {
  specName: string;
  specTalents: any; // Datos de la especialización
  talentColumns: number;
}

export function SpecArrows({ specName, specTalents, talentColumns }: SpecArrowsProps) {
  const arrows: React.ReactElement[] = [];
  
  // Iterar sobre todos los tiers y talentos para encontrar dependencias
  Object.entries(specTalents).forEach(([tier, tierData]: [string, any]) => {
    if (tierData.talents) {
      tierData.talents.forEach((talent: Talent, talentIndex: number) => {
        if (talent.requires) {
          arrows.push(
            <TalentArrows
              key={`${specName}-${tier}-${talentIndex}`}
              spec={specName}
              tier={tier}
              talentIndex={talentIndex}
              talent={talent}
              talentColumns={talentColumns}
            />
          );
        }
      });
    }
  });
  
  if (arrows.length === 0) {
    return null;
  }
  
  // Calcular dimensiones del SVG basado en el número de tiers y talentos
  const tierCount = Object.keys(specTalents).length;
  const svgWidth = talentColumns * 80; // 64px talent + 16px spacing
  const svgHeight = tierCount * 80;
  
  return (
    <svg
      className="talent-arrows-svg"
      width={svgWidth}
      height={svgHeight}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#ffd700"
          />
        </marker>
      </defs>
      {arrows}
    </svg>
  );
}

export default TalentArrows;
