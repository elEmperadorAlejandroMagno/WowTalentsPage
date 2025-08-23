import fs from 'fs';
import path from 'path';

// Leer el JSON de talentos
const talentsPath = './src/data/talents_structured.json';
const iconsDir = './public/icons/';

// Leer datos
const talents = JSON.parse(fs.readFileSync(talentsPath, 'utf8'));
const iconFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));

// Recopilar todos los iconos del JSON
const iconsInJson = new Set();
const missingIcons = [];
const foundIcons = [];

function extractIcons(obj) {
  if (typeof obj === 'object' && obj !== null) {
    if (obj.icon) {
      iconsInJson.add(obj.icon);
    }
    for (let key in obj) {
      extractIcons(obj[key]);
    }
  }
}

extractIcons(talents);

console.log('=== VERIFICACIÓN DE ICONOS ===\n');

// Verificar si cada icono del JSON existe en el directorio
iconsInJson.forEach(iconName => {
  if (iconFiles.includes(iconName)) {
    foundIcons.push(iconName);
  } else {
    missingIcons.push(iconName);
  }
});

console.log(`Total iconos en JSON: ${iconsInJson.size}`);
console.log(`Iconos encontrados: ${foundIcons.length}`);
console.log(`Iconos faltantes: ${missingIcons.length}\n`);

if (missingIcons.length > 0) {
  console.log('=== ICONOS FALTANTES ===');
  missingIcons.forEach((icon, index) => {
    console.log(`${index + 1}. ${icon}`);
    
    // Buscar archivos similares
    const similarFiles = iconFiles.filter(file => {
      const baseName = file.replace('.jpg', '').replace('.png', '');
      const targetName = icon.replace('.jpg', '').replace('.png', '');
      return baseName.includes(targetName.split('_').slice(0, 2).join('_')) || 
             targetName.includes(baseName.split('_').slice(0, 2).join('_'));
    });
    
    if (similarFiles.length > 0) {
      console.log(`   Posibles coincidencias: ${similarFiles.join(', ')}`);
    }
  });
  console.log('');
}

// También verificar archivos que no se usan
const unusedIcons = iconFiles.filter(file => !iconsInJson.has(file));
console.log(`=== ICONOS NO UTILIZADOS (${unusedIcons.length}) ===`);
if (unusedIcons.length < 20) {
  unusedIcons.forEach(icon => console.log(`- ${icon}`));
} else {
  console.log('(Demasiados para mostrar todos)');
}
