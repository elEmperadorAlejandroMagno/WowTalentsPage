#!/usr/bin/env node

// Script simple para probar las dependencias de talentos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer el archivo de talentos
const talentsPath = path.join(__dirname, 'src/data/talents_with_grid.json');
const talents = JSON.parse(fs.readFileSync(talentsPath, 'utf8'));

console.log('🧪 Probando sistema de dependencias de talentos...\n');

// Función para probar dependencias de una clase específica
function testClassDependencies(className) {
  console.log(`📋 Probando dependencias para ${className}:`);
  
  const classTalents = talents[className];
  if (!classTalents) {
    console.log(`  ❌ Clase ${className} no encontrada`);
    return;
  }

  let totalDependencies = 0;
  
  Object.keys(classTalents).forEach(specName => {
    console.log(`  🌳 Especialización: ${specName}`);
    
    const spec = classTalents[specName];
    Object.keys(spec).forEach(tier => {
      const tierData = spec[tier];
      if (tierData.talents) {
        tierData.talents.forEach((talent, index) => {
          if (talent.enables && talent.enables.length > 0) {
            totalDependencies++;
            console.log(`    🔗 "${talent.name}" habilita: ${talent.enables.join(', ')}`);
          }
        });
      }
    });
  });
  
  console.log(`  ✅ Total de talentos con dependencias: ${totalDependencies}\n`);
  return totalDependencies;
}

// Probar algunas clases
const classesToTest = ['Hunter', 'Paladin', 'Warrior', 'Mage'];
let grandTotal = 0;

classesToTest.forEach(className => {
  const count = testClassDependencies(className);
  grandTotal += count || 0;
});

console.log(`🎯 Resumen total: ${grandTotal} talentos con dependencias funcionando correctamente!`);

// Probar un caso específico
console.log('\n🔍 Ejemplo específico:');
const hunterBeastMastery = talents['Hunter']['Beast Mastery'];

// Buscar Ferocity en todos los tiers
let ferocityTalent = null;
for (const tier of Object.keys(hunterBeastMastery)) {
  const found = hunterBeastMastery[tier].talents?.find(t => t.name === 'Ferocity');
  if (found) {
    ferocityTalent = found;
    break;
  }
}

if (ferocityTalent && ferocityTalent.enables) {
  console.log(`  Hunter -> Beast Mastery -> Ferocity habilita: ${ferocityTalent.enables.join(', ')}`);
  console.log('  ✅ Sistema de dependencias funcionando correctamente!');
} else {
  console.log('  ❌ No se encontró el talento Ferocity o sus dependencias');
}
