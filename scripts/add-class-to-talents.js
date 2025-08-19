// ============================================
// HELPER PARA AGREGAR CLASES AL ARCHIVO DE TALENTOS
// ============================================

const fs = require('fs');
const path = require('path');

// Función para agregar una nueva clase al archivo de talentos
function addClassToTalents(className, classData) {
    const talentsFilePath = path.join(__dirname, '../src/data/turtle-wow-talents.ts');
    
    try {
        // Leer el archivo actual
        let fileContent = fs.readFileSync(talentsFilePath, 'utf8');
        
        // Encontrar la posición donde insertar la nueva clase
        const insertPosition = fileContent.lastIndexOf('};');
        
        if (insertPosition === -1) {
            throw new Error('No se pudo encontrar la estructura del objeto de talentos');
        }
        
        // Formatear la nueva clase
        const newClassCode = `  
  ${className}: ${JSON.stringify(classData[className], null, 4).replace(/^/gm, '  ')},`;
        
        // Insertar la nueva clase
        const beforeInsert = fileContent.substring(0, insertPosition);
        const afterInsert = fileContent.substring(insertPosition);
        
        const newFileContent = beforeInsert + newClassCode + '\n' + afterInsert;
        
        // Escribir el archivo actualizado
        fs.writeFileSync(talentsFilePath, newFileContent, 'utf8');
        
        console.log(`✅ Clase ${className} agregada exitosamente al archivo de talentos`);
        return true;
        
    } catch (error) {
        console.error(`❌ Error al agregar la clase ${className}:`, error.message);
        return false;
    }
}

// Ejemplo de uso:
// const mageData = { Mage: { Fire: { /* datos extraídos */ } } };
// addClassToTalents('Mage', mageData);

module.exports = { addClassToTalents };

// Si se ejecuta directamente
if (require.main === module) {
    console.log('📝 Helper para agregar clases a turtle-wow-talents.ts');
    console.log('Usa: addClassToTalents("ClassName", classDataObject)');
}
