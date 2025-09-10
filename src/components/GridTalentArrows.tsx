import type { NormalizedSpecTalents } from '../utils/talentGridNormalizer';
import { useTalentContext } from '../context/TalentContext';
import { getGridDependencies, GRID_CONFIG } from '../utils/talentGridNormalizer';
import './TalentDependencyArrows.css';

interface GridTalentArrowsProps {
  specName: string;
  normalizedSpec: NormalizedSpecTalents;
}

/**
 * Componente de flechas simplificado que usa la grilla normalizada
 */
export default function GridTalentArrows({ specName, normalizedSpec }: GridTalentArrowsProps) {
  const { getTalentPoints } = useTalentContext();

  // Configuración de la grilla visual
  const SLOT_SIZE = 68;  // Tamaño de cada slot (incluyendo padding)

  // Función para calcular coordenadas de un slot en la grilla
  const getSlotCoordinates = (tier: number, column: number) => {
    const x = column * SLOT_SIZE + SLOT_SIZE / 2;
    const y = (tier - 1) * SLOT_SIZE + SLOT_SIZE / 2;
    return { x, y };
  };

  // Función para verificar el estado de una dependencia
  const getDependencyState = (
    fromTier: number,
    fromColumn: number,
    requiredPoints: number
  ) => {
    // Buscar el slot original para obtener el originalIndex
    const tierData = normalizedSpec[fromTier.toString()];
    if (!tierData) return { isActive: false, isAvailable: false };
    
    const slot = tierData.slots[fromColumn];
    if (!slot || slot.isEmpty || slot.originalIndex === undefined) {
      return { isActive: false, isAvailable: false };
    }

    const currentPoints = getTalentPoints(specName, fromTier.toString(), slot.originalIndex);
    return {
      isActive: currentPoints >= requiredPoints,
      isAvailable: currentPoints > 0
    };
  };

  // Obtener todas las dependencias en coordenadas de grilla
  const dependencies = getGridDependencies(normalizedSpec);

  if (dependencies.length === 0) {
    return null;
  }

  // Calcular dimensiones del SVG
  const tierCount = Object.keys(normalizedSpec).length;
  const svgWidth = GRID_CONFIG.MAX_COLUMNS * SLOT_SIZE;
  const svgHeight = tierCount * SLOT_SIZE;

  return (
    <svg
      className="talent-dependency-arrows"
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
      {/* Definiciones de marcadores */}
      <defs>
        <marker
          id="arrowhead-active"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon points="0,0 8,4 0,8" fill="#ffd700" />
        </marker>
        
        <marker
          id="arrowhead-available"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon points="0,0 8,4 0,8" fill="#00ff00" />
        </marker>
        
        <marker
          id="arrowhead-inactive"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon points="0,0 8,4 0,8" fill="#666666" />
        </marker>
      </defs>

      {/* Renderizar flechas */}
      {dependencies.map((dependency, index) => {
        const fromCoords = getSlotCoordinates(dependency.from.tier, dependency.from.column);
        const toCoords = getSlotCoordinates(dependency.to.tier, dependency.to.column);
        
        const state = getDependencyState(
          dependency.from.tier,
          dependency.from.column,
          dependency.requiredPoints
        );

        // Crear path simple - línea recta o en L
        let path: string;
        const deltaX = toCoords.x - fromCoords.x;
        const deltaY = toCoords.y - fromCoords.y;

        if (Math.abs(deltaX) < 10) {
          // Línea vertical
          path = `M ${fromCoords.x} ${fromCoords.y} L ${toCoords.x} ${toCoords.y}`;
        } else if (Math.abs(deltaY) < 10) {
          // Línea horizontal  
          path = `M ${fromCoords.x} ${fromCoords.y} L ${toCoords.x} ${toCoords.y}`;
        } else {
          // Línea en L
          const midY = fromCoords.y + deltaY * 0.5;
          path = `M ${fromCoords.x} ${fromCoords.y} L ${fromCoords.x} ${midY} L ${toCoords.x} ${midY} L ${toCoords.x} ${toCoords.y}`;
        }

        // Determinar estilo basado en estado
        let strokeColor: string;
        let strokeWidth: number;
        let strokeDasharray: string | undefined;
        let markerEnd: string;

        if (state.isActive) {
          strokeColor = '#ffd700';
          strokeWidth = dependency.type === 'talentRequired' ? 3 : 2;
          markerEnd = 'url(#arrowhead-active)';
        } else if (state.isAvailable) {
          strokeColor = '#00ff00';
          strokeWidth = dependency.type === 'talentRequired' ? 3 : 2;
          strokeDasharray = '5,5';
          markerEnd = 'url(#arrowhead-available)';
        } else {
          strokeColor = '#666666';
          strokeWidth = 1;
          strokeDasharray = '3,3';
          markerEnd = 'url(#arrowhead-inactive)';
        }

        return (
          <g key={`${dependency.type}-${index}`}>
            <path
              d={path}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              fill="none"
              markerEnd={markerEnd}
              className={`dependency-${dependency.type} ${state.isActive ? 'active' : state.isAvailable ? 'available' : 'inactive'}`}
            />
          </g>
        );
      })}
    </svg>
  );
}
