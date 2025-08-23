import Tree from './class_tree.tsx';
import talents from '../data/talents_structured.json';
import './talents_tree.css';

function Talents({ wowClass }: { wowClass: string }) {
    // Obtener las especializaciones de la clase desde el JSON
    const classTalents = talents[wowClass as keyof typeof talents];
    
    if (!classTalents) {
        // Verificar si hay datos guardados en localStorage como fallback
        const savedClasses = localStorage.getItem('savedClasses');
        if (savedClasses) {
            const savedClassesArray = JSON.parse(savedClasses);
            const savedClassTalents = savedClassesArray[wowClass];
            if (!savedClassTalents) {
                return <div className="error">Clase "{wowClass}" no encontrada. Clases disponibles: {Object.keys(talents).join(', ')}</div>;
            }
            // Si hay datos guardados, úsalos para renderizar
            return (
                <div className="talents-tree">
                    <div className='treesContainer'>
                        {Object.keys(savedClassTalents).map(spec => (
                            <Tree key={spec} specifyTree={spec} wowClass={wowClass} />
                        ))}
                    </div>
                </div>
            );
        }
        return <div className="error">Clase "{wowClass}" no encontrada. Clases disponibles: {Object.keys(talents).join(', ')}</div>;
    }

    // Renderiza cada especialización (ej: Holy, Arms, Protection)
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