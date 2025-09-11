import talents from '../data/talents_with_grid.json';
import type { Talent } from '../types/types';
import { useTalentContext } from '../context/TalentContext';

// Interfaces para la estructura de datos con grilla
interface GridSlot {
  row: number;
  col: number;
  isEmpty: boolean;
  talent: Talent | null;
}

interface TierWithGrid {
  talents: Talent[];
  requiredPoints: number;
  grid: GridSlot[][];
}

interface SpecWithGrid {
  [tier: string]: TierWithGrid;
}

interface ClassWithGrid {
  [spec: string]: SpecWithGrid;
}

interface TreeProps {
    specifyTree: string;
    wowClass?: string;
}

function Tree({ specifyTree, wowClass = 'Paladin' }: TreeProps) {
    const { dispatch, getTalentPoints, getSpecTotalPoints, canAssignPoint, processTalentDependencies } = useTalentContext();
   
    const classTalents = talentsData[wowClass]; 
    // Obtener los talentos de la clase y especialización
    const talentsData = talents as Record<string, ClassWithGrid>;
    
    if (!classTalents) {
        return (
            <div className="talent-tree">
                <h3>Talents of the {specifyTree} tree</h3>
                <p>Class "{wowClass}" not found. Available classes: {Object.keys(talents).join(', ')}</p>
            </div>
        );
    }
    
    const specTalents = classTalents[specifyTree] as SpecWithGrid | undefined;
    if (!specTalents) {
        return (
            <div className="talent-tree">
                <h3>Talents of the {specifyTree} tree</h3>
                <p>Specialization "{specifyTree}" not found for {wowClass}. Available specs: {Object.keys(classTalents).join(', ')}</p>
            </div>
        );
    }
    const specTotalPoints = getSpecTotalPoints(specifyTree);
    
    // Función para encontrar el índice original del talento en el array talents
    const findTalentIndex = (tierKey: string, talentName: string): number => {
        const tierData = specTalents[tierKey];
        if (!tierData.talents) return -1;
        return tierData.talents.findIndex(t => t.name === talentName);
    };

    // Manejar clic izquierdo - agregar punto
    const handleAddPoint = (tier: string, talent: Talent, requiredPoints: number) => {
        const talentIndex = findTalentIndex(tier, talent.name);
        if (talentIndex === -1) return; // Talento no encontrado
        
        if (canAssignPoint(specifyTree, tier, talentIndex, talent.maxPoints, requiredPoints)) {
            dispatch({
                type: 'ADD_POINT',
                spec: specifyTree,
                tier,
                talentIndex,
                maxPoints: talent.maxPoints
            });
            
            // Procesar dependencias después de agregar el punto
            processTalentDependencies(specifyTree, tier, talentIndex);
        }
    };

    // Manejar clic derecho - quitar punto
    const handleRemovePoint = (e: React.MouseEvent, tier: string, talent: Talent) => {
        e.preventDefault(); // Prevenir menú contextual
        e.stopPropagation(); // Prevenir propagación del evento
        const talentIndex = findTalentIndex(tier, talent.name);
        if (talentIndex === -1) return; // Talento no encontrado
        
        const currentPoints = getTalentPoints(specifyTree, tier, talentIndex);
        if (currentPoints > 0) {
            dispatch({
                type: 'REMOVE_POINT',
                spec: specifyTree,
                tier,
                talentIndex
            });
        }
    };

    // Determinar el estado visual de un talento
    const getTalentState = (tier: string, talent: Talent, requiredPoints: number) => {
        const talentIndex = findTalentIndex(tier, talent.name);
        if (talentIndex === -1) {
            return {
                currentPoints: 0,
                canAssign: false,
                isMaxed: false,
                isAvailable: false,
                isEmpty: true
            };
        }
        
        const currentPoints = getTalentPoints(specifyTree, tier, talentIndex);
        const canAssign = canAssignPoint(specifyTree, tier, talentIndex, talent.maxPoints, requiredPoints);
        const isMaxed = currentPoints >= talent.maxPoints;
        const isAvailable = specTotalPoints >= requiredPoints;
        
        return {
            currentPoints,
            canAssign,
            isMaxed,
            isAvailable,
            isEmpty: currentPoints === 0
        };
    };

    return (
        <div className="talent-tree">
            <h3>Talents of the {specifyTree} tree</h3>
            <div className="spec-summary">
                <span className="spec-points">{specTotalPoints} points spent</span>
            </div>
            <div className="talent-container" style={{ position: 'relative' }}>
                {/* Renderizado usando la grilla del JSON */}
                <div className="talent-tiers">
                    {Object.entries(specTalents).map(([tierKey, tierData]) => {
                        return (
                            <div key={tierKey} className="talent-tier">
                                <h4>Tier {tierKey} (Required: {tierData.requiredPoints} points)</h4>
                                {/* Renderizado directo de la grilla - cada tier tiene solo una fila en el JSON */}
                                <div className="talent-grid-row">
                                    {tierData.grid[0]?.map((slot, colIndex) => {
                                        if (slot.isEmpty || !slot.talent) {
                                            return (
                                                <div 
                                                    key={`empty-${tierKey}-${colIndex}`}
                                                    className="talent-slot talent-empty"
                                                />
                                            );
                                        }
                                        const talent = slot.talent;
                                        const talentState = getTalentState(tierKey, talent, tierData.requiredPoints);
                                        return (
                                            <div 
                                                key={`${talent.name}-${tierKey}-${colIndex}`}
                                                className={`talent-slot talent-item ${
                                                    !talentState.isAvailable ? 'talent-unavailable' :
                                                    talentState.isMaxed ? 'talent-maxed' :
                                                    talentState.currentPoints > 0 ? 'talent-active' :
                                                    talentState.canAssign ? 'talent-available' : 'talent-disabled'
                                                }`}
                                                onClick={() => handleAddPoint(tierKey, talent, tierData.requiredPoints)}
                                                onContextMenu={(e) => handleRemovePoint(e, tierKey, talent)}
                                                title={`${talent.name}\nCurrent: ${talentState.currentPoints}/${talent.maxPoints}\nRequired: ${tierData.requiredPoints} points in ${specifyTree}`}
                                            >
                                                <div className="talent-icon">
                                                    <img 
                                                        src={`/icons/${talent.icon}`} 
                                                        alt={talent.name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/icons/default-talent.svg';
                                                        }}
                                                    />
                                                    {talentState.currentPoints > 0 && (
                                                        <div className="talent-rank">{talentState.currentPoints}</div>
                                                    )}
                                                </div>
                                                <div className="talent-tooltip">
                                                    <div className="tooltip-content">
                                                        <div className="tooltip-title">{talent.name}</div>
                                                        <div className="tooltip-points">{talentState.currentPoints}/{talent.maxPoints} points</div>
                                                        <div className="tooltip-description">
                                                            {'Description will be available soon'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Tree;
