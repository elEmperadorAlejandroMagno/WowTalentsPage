// ============================================
// SCRIPT PARA EXTRAER TALENTOS DE TURTLE WOW
// ============================================
// Usar en: https://database.turtle-wow.org/

// Función principal para extraer datos de talentos
function extractTurtleTalents() {
    console.log('🔍 Iniciando extracción de talentos...');
    
    const talents = [];
    let currentTier = 1;
    
    // Buscar diferentes selectores posibles
    const selectors = [
        '.talent-icon',
        '.talent',
        '[data-talent]',
        '.icon-frame',
        '.listview-row',
        'a[href*="spell"]',
        '.iconmedium'
    ];
    
    let elements = [];
    for (const selector of selectors) {
        elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            console.log(`✅ Encontrados ${elements.length} elementos con selector: ${selector}`);
            break;
        }
    }
    
    if (elements.length === 0) {
        console.log('❌ No se encontraron elementos de talentos');
        console.log('💡 Asegúrate de estar en una página de talentos de Turtle WoW');
        return null;
    }
    
    elements.forEach((element, index) => {
        const talentData = extractTalentFromElement(element, index);
        if (talentData) {
            talents.push(talentData);
        }
    });
    
    console.log(`✅ Extraídos ${talents.length} talentos`);
    return talents;
}

// Función para extraer datos de un elemento individual
function extractTalentFromElement(element, index) {
    let name = '';
    let icon = '';
    let maxPoints = 1;
    let description = '';
    
    // Intentar extraer nombre
    const nameSelectors = [
        '.q', '.q0', '.q1', '.q2',
        '.talent-name',
        'a',
        '.listview-name'
    ];
    
    for (const selector of nameSelectors) {
        const nameEl = element.querySelector(selector);
        if (nameEl && nameEl.textContent.trim()) {
            name = nameEl.textContent.trim();
            break;
        }
    }
    
    // Si no hay nombre en subelementos, usar el elemento principal
    if (!name) {
        name = element.textContent.trim();
        // Limpiar texto extra
        name = name.split('\n')[0].trim();
    }
    
    // Intentar extraer icono
    const iconEl = element.querySelector('img');
    if (iconEl) {
        icon = iconEl.src;
        // Extraer solo el nombre del archivo
        if (icon) {
            icon = icon.split('/').pop().split('?')[0];
        }
    }
    
    // Intentar extraer puntos máximos
    const maxPointsMatch = element.textContent.match(/Rank\s+(\d+)/) || 
                          element.textContent.match(/(\d+)\s*\/\s*(\d+)/);
    if (maxPointsMatch) {
        maxPoints = parseInt(maxPointsMatch[2] || maxPointsMatch[1]) || 1;
    }
    
    // Calcular tier aproximado (cada 4-5 talentos = nuevo tier)
    const tier = Math.floor(index / 4) + 1;
    const column = (index % 4) + 1;
    
    if (name && name.length > 1) {
        return {
            name: name,
            icon: icon || `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
            maxPoints: maxPoints,
            tier: tier,
            column: column,
            description: description
        };
    }
    
    return null;
}

// Función para formatear datos en estructura JSON
function formatTalentTree(data) {
    const tree = {};
    
    data.talents.forEach(talent => {
        const tierKey = talent.tier.toString();
        if (!tree[tierKey]) {
            tree[tierKey] = {
                talents: [],
                requiredPoints: (talent.tier - 1) * 5 // 0, 5, 10, 15, etc.
            };
        }
        
        tree[tierKey].talents.push({
            name: talent.name,
            icon: talent.icon,
            maxPoints: talent.maxPoints
        });
    });
    
    return tree;
}

// Función para generar estructura completa de clase
function generateClassStructure(className, specs) {
    console.log(`🏗️ Generando estructura para ${className}...`);
    
    const classStructure = {};
    
    specs.forEach(spec => {
        console.log(`📋 Procesando especialización: ${spec.name}`);
        const formattedTree = formatTalentTree({
            className: className,
            specName: spec.name,
            talents: spec.talents || []
        });
        classStructure[spec.name] = formattedTree;
    });
    
    return { [className]: classStructure };
}

// Función para formatear como TypeScript exportable
function exportAsTypeScript(classData, className) {
    const tsCode = `// Datos de ${className} para Turtle WoW\nconst ${className.toLowerCase()}Talents = ${JSON.stringify(classData, null, 2)};\n\nexport default ${className.toLowerCase()}Talents;`;
    
    console.log('📝 Código TypeScript generado:');
    console.log(tsCode);
    
    return tsCode;
}

// INSTRUCCIONES DE USO
console.log('🎯 GUÍA DE USO - TURTLE WOW TALENT EXTRACTOR');
console.log('============================================');
console.log('\n📍 Paso 1: Ve a https://database.turtle-wow.org/');
console.log('📍 Paso 2: Busca la clase que quieras (ej: "Mage talents")');
console.log('📍 Paso 3: En la consola, ejecuta: extractTurtleTalents()');
console.log('\n💡 COMANDOS DISPONIBLES:');
console.log('- extractTurtleTalents()         // Extrae talentos de la página actual');
console.log('- formatTalentTree(data)         // Convierte a formato de tu app');
console.log('- exportAsTypeScript(data, name) // Genera código TypeScript');
console.log('\n🎮 EJEMPLO DE USO COMPLETO:');
console.log('```javascript');
console.log('// 1. Extraer talentos');
console.log('const talents = extractTurtleTalents();');
console.log('// 2. Formatear para tu app');
console.log('const formatted = formatTalentTree({');
console.log('    className: "Mage",');
console.log('    specName: "Fire",');
console.log('    talents: talents');
console.log('});');
console.log('// 3. Ver resultado');
console.log('console.log(JSON.stringify(formatted, null, 2));');
console.log('```');
console.log('\n🔥 ¡Empecemos! Ve a la página de talentos y ejecuta extractTurtleTalents()');

// Función de ayuda rápida
function help() {
    console.log('🆘 AYUDA RÁPIDA:');
    console.log('- extractTurtleTalents() // Extrae de la página actual');
    console.log('- help() // Muestra esta ayuda');
    console.log('\nSi no funciona, verifica que estés en una página de talentos de Turtle WoW');
}

// Auto-detectar si estamos en Turtle WoW
if (window.location.hostname.includes('turtle-wow')) {
    console.log('✅ Detectado: Turtle WoW Database');
    console.log('🚀 Listo para extraer talentos!');
} else {
    console.log('⚠️  No pareces estar en turtle-wow.org');
    console.log('📍 Ve a: https://database.turtle-wow.org/');
}
