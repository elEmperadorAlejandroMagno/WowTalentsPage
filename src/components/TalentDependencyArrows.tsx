import type { Talent, TalentTier } from '../types/types';
import { useTalentContext } from '../context/TalentContext';
import './TalentDependencyArrows.css';
import { 
  createConnectionPath, 
  calculateTreeDimensions,
  DEFAULT_GRID_CONFIG,
  type TalentGridConfig 
} from '../utils/talentCoordinates';

interface TalentDependencyArrowsProps {
  specName: string;
  specTalents: Record<string, TalentTier>;
  config?: TalentGridConfig;
}

interface DependencyConnection {
  fromTier: number;
  fromIndex: number;
  toTier: number;
  toIndex: number;
  type: 'requires' | 'talentRequired';
  isActive: boolean;
  isAvailable: boolean;
}

export default function TalentDependencyArrows({ 
  specName, 
  specTalents, 
  config = DEFAULT_GRID_CONFIG 
}: TalentDependencyArrowsProps) {
  const { getTalentPoints } = useTalentContext();

  // Función para verificar si una dependencia está satisfecha
  const isDependencySatisfied = (
    fromTier: number,
    fromIndex: number,
    requiredPoints: number
  ): boolean => {
    const currentPoints = getTalentPoints(specName, fromTier.toString(), fromIndex);
    return currentPoints >= requiredPoints;
  };

  // Función para verificar si una dependencia está disponible (el talento origen tiene al menos 1 punto)
  const isDependencyAvailable = (fromTier: number, fromIndex: number): boolean => {
    const currentPoints = getTalentPoints(specName, fromTier.toString(), fromIndex);
    return currentPoints > 0;
  };

  // Recopilar todas las conexiones de dependencia
  const connections: DependencyConnection[] = [];

  Object.entries(specTalents).forEach(([tierKey, tierData]) => {
    const tierNum = parseInt(tierKey);
    
    tierData.talents.forEach((talent: Talent, talentIndex: number) => {
      // Procesar dependencias del tipo 'requires' (dependencias múltiples)
      if (talent.requires) {
        talent.requires.forEach(dependency => {
          const fromTier = parseInt(dependency.tier);
          const fromIndex = dependency.talentIndex;
          const requiredPoints = dependency.minPoints;
          
          connections.push({
            fromTier,
            fromIndex,
            toTier: tierNum,
            toIndex: talentIndex,
            type: 'requires',
            isActive: isDependencySatisfied(fromTier, fromIndex, requiredPoints),
            isAvailable: isDependencyAvailable(fromTier, fromIndex)
          });
        });
      }
      
      // Procesar dependencia del tipo 'talentRequired' (dependencia única)
      if (talent.talentRequired) {
        const required = talent.talentRequired;
        
        connections.push({
          fromTier: required.tier,
          fromIndex: required.index,
          toTier: tierNum,
          toIndex: talentIndex,
          type: 'talentRequired',
          isActive: isDependencySatisfied(required.tier, required.index, required.points),
          isAvailable: isDependencyAvailable(required.tier, required.index)
        });
      }
    });
  });

  if (connections.length === 0) {
    return null;
  }

  // Calcular dimensiones del SVG
  const tierCount = Object.keys(specTalents).length;
  const maxTalentsPerTier = Math.max(
    ...Object.values(specTalents).map(tier => tier.talents.length)
  );
  const { width, height } = calculateTreeDimensions(tierCount, maxTalentsPerTier, config);

  return (
    <svg
      className="talent-dependency-arrows"
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {/* Definiciones de marcadores para las flechas */}
      <defs>
        {/* Flecha activa (dorada) */}
        <marker
          id="arrowhead-active"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon
            points="0,0 8,4 0,8"
            fill="#ffd700"
            stroke="#ffd700"
            strokeWidth="1"
          />
        </marker>
        
        {/* Flecha disponible (verde) */}
        <marker
          id="arrowhead-available"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon
            points="0,0 8,4 0,8"
            fill="#00ff00"
            stroke="#00ff00"
            strokeWidth="1"
          />
        </marker>
        
        {/* Flecha inactiva (gris) */}
        <marker
          id="arrowhead-inactive"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <polygon
            points="0,0 8,4 0,8"
            fill="#666666"
            stroke="#666666"
            strokeWidth="1"
          />
        </marker>
      </defs>

      {/* Renderizar todas las conexiones */}
      {connections.map((connection, index) => {
        const path = createConnectionPath(
          connection.fromTier,
          connection.fromIndex,
          connection.toTier,
          connection.toIndex,
          config
        );

        // Determinar el estilo basado en el estado
        let strokeColor: string;
        let markerEnd: string;
        let strokeWidth: number;
        let strokeDasharray: string | undefined;

        if (connection.isActive) {
          // Dependencia satisfecha
          strokeColor = '#ffd700';
          markerEnd = 'url(#arrowhead-active)';
          strokeWidth = 2;
        } else if (connection.isAvailable) {
          // Dependencia disponible pero no satisfecha
          strokeColor = '#00ff00';
          markerEnd = 'url(#arrowhead-available)';
          strokeWidth = 2;
          strokeDasharray = '5,5';
        } else {
          // Dependencia no disponible
          strokeColor = '#666666';
          markerEnd = 'url(#arrowhead-inactive)';
          strokeWidth = 1;
          strokeDasharray = '3,3';
        }

        return (
          <g key={`${connection.type}-${index}`} className={`dependency-arrow dependency-${connection.type}`}>
            <path
              d={path}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              fill="none"
              markerEnd={markerEnd}
              className={`arrow-path ${connection.isActive ? 'active' : connection.isAvailable ? 'available' : 'inactive'}`}
            />
          </g>
        );
      })}
    </svg>
  );
}
