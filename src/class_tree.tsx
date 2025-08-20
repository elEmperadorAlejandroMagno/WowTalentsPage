import talents from './data/turtle-wow-talents';
import type { Talent, TalentTier } from './types/types';
import { useTalentContext } from './context/TalentContext';

interface TreeProps {
    specifyTree: string;
    wowClass?: string;
}

function Tree({ specifyTree, wowClass = 'Paladin' }: TreeProps) {
    const { dispatch, getTalentPoints, getSpecTotalPoints, canAssignPoint } = useTalentContext();
    
    // Obtener los talentos de la clase y especificación
    const classTalents = talents[wowClass];
    if (!classTalents || !classTalents[specifyTree]) {
        return (
            <div className="talent-tree">
                <h3>Talents of the {specifyTree} tree</h3>
                <p>No talents found for {wowClass} - {specifyTree}</p>
            </div>
        );
    }

    const specTalents = classTalents[specifyTree];
    const specTotalPoints = getSpecTotalPoints(specifyTree);

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
            <div className="talent-tiers">
                {Object.entries(specTalents).map(([tier, talentTier]: [string, TalentTier]) => (
                    <div key={tier} className="talent-tier">
                        <h4>Tier {tier} (Required: {talentTier.requiredPoints} points)</h4>
                        <div className="talents-row">
                            {talentTier.talents.map((talent: Talent, index: number) => {
                                const talentState = getTalentState(tier, index, talentTier.requiredPoints, talent.maxPoints);
                                
                                return (
                                    <div 
                                        key={`${talent.name}-${index}`} 
                                        className={`talent-item ${
                                            !talentState.isAvailable ? 'talent-unavailable' :
                                            talentState.isMaxed ? 'talent-maxed' :
                                            talentState.currentPoints > 0 ? 'talent-active' :
                                            talentState.canAssign ? 'talent-available' : 'talent-disabled'
                                        }`}
                                        onClick={() => handleAddPoint(tier, index, talent, talentTier.requiredPoints)}
                                        onContextMenu={(e) => handleRemovePoint(e, tier, index)}
                                        title={`${talent.name}\nCurrent: ${talentState.currentPoints}/${talent.maxPoints}\nRequired: ${talentTier.requiredPoints} points in ${specifyTree}`}
                                    >
                                        <div className="talent-icon">
                                            <img 
                                                src={`/icons/${talent.icon}`} 
                                                alt={talent.name}
                                                onError={(e) => {
                                                    // Fallback si la imagen no existe
                                                    (e.target as HTMLImageElement).src = '/icons/default-talent.svg';
                                                }}
                                            />
                                            {talentState.currentPoints > 0 && (
                                                <div className="talent-rank">{talentState.currentPoints}</div>
                                            )}
                                        </div>
                                        <div className="talent-info">
                                            <span className="talent-name">{talent.name}</span>
                                            <span className="talent-points">{talentState.currentPoints}/{talent.maxPoints}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Tree;
