import Tree from './class_tree.tsx';
import talents from './data/turtle-wow-talents';
import './talents_tree.css';

function Talents({ wowClass }: { wowClass: string }) {
    const classTalents = talents[wowClass];

    if (!classTalents) {
        return <div>No talents available for this class.</div>;
    }

    // Renderiza cada especialización (ej: Holy, Arms)
    return (
        <div className="talents-tree">
            <div className='treesContainer'>
                {Object.keys(classTalents).map(spec => (
                    <Tree key={spec} specifyTree={spec} wowClass={wowClass} />
                ))}
            </div>
        </div>
    );
}

export default Talents;