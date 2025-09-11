import talents from '../data/talents_with_grid.json';
import type { Talent, SpecTalents } from '../types/types';
import { useTalentContext } from '../context/TalentContext';
import { normalizeSpecTalents, PositioningStrategy, type TalentGridSlot } from '../utils/talentGridNormalizer';
interface TreeProps {
    specifyTree: string;
    wowClass?: string;
}

function Tree({ specifyTree, wowClass = 'Paladin' }: TreeProps) {
    const { dispatch, getTalentPoints, getSpecTotalPoints, canAssignPoint, processTalentDependencies } = useTalentContext();
    
    // Obtener los talentos de la clase y especificación
    const talentsData = talents as Record<string, Record<string, SpecTalents>>;
    const classTalents = talentsData[wowClass];
    
    if (!classTalents) {
        return (
            <div className="talent-tree">
                <h3>Talents of the {specifyTree} tree</h3>
                <p>Class "{wowClass}" not found. Available classes: {Object.keys(talents).join(', ')}</p>
            </div>
        );
    }
    
    const specTalents = classTalents[specifyTree] as SpecTalents | undefined;
    if (!specTalents) {
        return (
            <div className="talent-tree">
                <h3>Talents of the {specifyTree} tree</h3>
                <p>Specialization "{specifyTree}" not found for {wowClass}. Available specs: {Object.keys(classTalents).join(', ')}</p>
            </div>
        );
    }
    const specTotalPoints = getSpecTotalPoints(specifyTree);
    
    // Normalizar la especialización para usar grilla uniforme
    const normalizedSpec = normalizeSpecTalents(specTalents, PositioningStrategy.CENTER_ALIGNED);

    // Manejar clic izquierdo - agregar punto
    const handleAddPoint = (tier: string, talentIndex: number, talent: Talent, requiredPoints: number) => {
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
    const handleRemovePoint = (e: React.MouseEvent, tier: string, talentIndex: number) => {
        e.preventDefault(); // Prevenir menú contextual
        e.stopPropagation(); // Prevenir propagación del evento
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
    const getTalentState = (tier: string, talentIndex: number, requiredPoints: number, maxPoints: number) => {
        const currentPoints = getTalentPoints(specifyTree, tier, talentIndex);
        const canAssign = canAssignPoint(specifyTree, tier, talentIndex, maxPoints, requiredPoints);
        const isMaxed = currentPoints >= maxPoints;
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
                {/* Renderizado de grilla normalizada */}
                <div className="talent-tiers">
                    {Object.entries(normalizedSpec).map(([tierKey, tierData]) => {
                        return (
                            <div key={tierKey} className="talent-tier">
                                <h4>Tier {tierKey} (Required: {tierData.requiredPoints} points)</h4>
                                <div className="talents-row talent-grid-row">
                                    {tierData.slots.map((slot: TalentGridSlot, column: number) => {
                                        if (slot.isEmpty || !slot.talent) {
                                            // Slot vacío
                                            return (
                                                <div 
                                                    key={`empty-${tierKey}-${column}`}
                                                    className="talent-slot talent-empty"
                                                />
                                            );
                                        }
                                        
                                        // Slot con talento
                                        const talent = slot.talent;
                                        const originalIndex = slot.originalIndex!;
                                        const talentState = getTalentState(tierKey, originalIndex, tierData.requiredPoints, talent.maxPoints);
                                        
                                        return (
                                            <div 
                                                key={`${talent.name}-${tierKey}-${column}`}
                                                className={`talent-slot talent-item ${
                                                    !talentState.isAvailable ? 'talent-unavailable' :
                                                    talentState.isMaxed ? 'talent-maxed' :
                                                    talentState.currentPoints > 0 ? 'talent-active' :
                                                    talentState.canAssign ? 'talent-available' : 'talent-disabled'
                                                }`}
                                                onClick={() => handleAddPoint(tierKey, originalIndex, talent, tierData.requiredPoints)}
                                                onContextMenu={(e) => handleRemovePoint(e, tierKey, originalIndex)}
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
