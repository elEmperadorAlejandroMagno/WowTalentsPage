# 🎯 Guía Paso a Paso: Extracción de Talentos de Turtle WoW

## 🚀 **Empezamos con MAGE - Tu primera extracción**

### **Paso 1: Preparación**
1. Abre tu navegador
2. Ve a: https://database.turtle-wow.org/
3. Abre las herramientas de desarrollador (F12)
4. Ve a la pestaña "Console"

### **Paso 2: Cargar el script**
1. Abre el archivo `scripts/extract-turtle-talents.js`
2. Copia TODO el contenido
3. Pégalo en la consola del navegador
4. Presiona Enter

Deberías ver:
```
🎯 GUÍA DE USO - TURTLE WOW TALENT EXTRACTOR
============================================
✅ Detectado: Turtle WoW Database
🚀 Listo para extraer talentos!
```

### **Paso 3: Buscar talentos de Mage**
En la página de Turtle WoW:
1. Busca "Mage talents" en el buscador
2. O navega a la sección de talentos de Mago
3. Asegúrate de estar en una página que muestre talentos

### **Paso 4: Extraer datos**
En la consola:
```javascript
// 1. Extraer talentos de la página actual
const mageTalents = extractTurtleTalents();

// 2. Ver qué extrajimos
console.log('Talentos extraídos:', mageTalents);
```

### **Paso 5: Formatear datos**
```javascript
// Para especializaciones de Mago (haz esto para cada spec)
const fireTree = formatTalentTree({
    className: "Mage",
    specName: "Fire", 
    talents: mageTalents // Los que extrajiste en el paso anterior
});

console.log('Fire tree:', JSON.stringify(fireTree, null, 2));
```

### **Paso 6: Copiar y usar los datos**
1. Copia el JSON que aparece en la consola
2. Pégalo en el archivo `src/data/turtle-wow-talents.ts`

---

## 📋 **Lista de Clases por Extraer**

### ✅ **Completadas**
- [x] Warrior (Arms, Fury, Protection)
- [x] Paladin (Holy, Protection, Retribution)

### 🔄 **En Progreso**
- [ ] **Mage** (Arcane, Fire, Frost) ← **EMPEZAR AQUÍ**

### ⏳ **Pendientes**
- [ ] Priest (Discipline, Holy, Shadow)
- [ ] Warlock (Affliction, Demonology, Destruction)
- [ ] Hunter (Beast Mastery, Marksmanship, Survival)
- [ ] Rogue (Assassination, Combat, Subtlety)
- [ ] Shaman (Elemental, Enhancement, Restoration)
- [ ] Druid (Balance, Feral Combat, Restoration)

---

## 🔍 **URLs específicas para cada clase**

### **Mage - Links directos:**
- **Fire:** https://database.turtle-wow.org/?talents#mage-fire
- **Frost:** https://database.turtle-wow.org/?talents#mage-frost  
- **Arcane:** https://database.turtle-wow.org/?talents#mage-arcane

### **Búsquedas recomendadas:**
- "Mage talents"
- "Fire talents"
- "Frost talents" 
- "Arcane talents"

---

## 🛠️ **Comandos de Emergencia**

### Si no funciona el script:
```javascript
// Limpiar y reintentar
location.reload(); // Recargar página
// Volver a cargar el script
```

### Para debug:
```javascript
// Ver todos los elementos de la página
document.querySelectorAll('*[class*="talent"]');
document.querySelectorAll('*[class*="spell"]');
```

### Para ver la estructura de la página:
```javascript
// Inspeccionar elementos
console.log('Clases disponibles:', Array.from(document.querySelectorAll('[class]')).map(el => el.className));
```

---

## ✨ **Consejos Pro**

1. **Una spec a la vez:** No intentes extraer todas las especializaciones juntas
2. **Verifica iconos:** Los nombres de iconos son importantes para la UI
3. **Checa maxPoints:** Algunos talentos tienen 1 punto, otros 5
4. **Guarda progreso:** Copia los resultados inmediatamente
5. **Verifica in-game:** Compara con el juego para asegurar precisión

---

## 🎮 **¿Listo para empezar?**

**¡Vamos con Mage primero!**

1. Ve a la database de Turtle WoW
2. Carga el script en la consola  
3. Busca talentos de Mage Fire
4. Ejecuta `extractTurtleTalents()`
5. ¡Copia los resultados aquí!

**Una vez que tengas los datos de Mage, podemos agregarlos a tu aplicación y continuar con las demás clases.**
