import Tree from './class_tree.tsx';
import talents from '../data/turtle-wow-talents.ts';
import './talents_tree.css';

function Talents({ wowClass }: { wowClass: string }) {
    let classTalents = talents[wowClass];

    if (classTalents === undefined) {
        const savedClasses = localStorage.getItem('savedClasses');
        if (savedClasses) {
            const savedClassesArray = JSON.parse(savedClasses);
            classTalents = savedClassesArray[wowClass];
            if (classTalents === undefined) {
                return <div className="error">Clase no encontrada o sin talentos guardados.</div>;
            }
        }
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