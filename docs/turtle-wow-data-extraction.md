# Guía para Extraer Datos de Talentos de Turtle WoW

## 🎯 Métodos Recomendados

### 1. **Base de Datos Web de Turtle WoW** (Más fácil)
- **URL:** https://database.turtle-wow.org/
- **Pasos:**
  1. Navegar a la sección de talentos
  2. Usar el script del navegador (`scripts/extract-turtle-talents.js`)
  3. Copiar los datos extraídos

### 2. **Archivos del Cliente (Tu instalación en E:)**
Si quieres extraer desde tu instalación local:

#### Ubicaciones de archivos importantes:
```
E:\Turtle WoW\Data\
├── enUS\
│   └── DBFilesClient\
│       ├── Talent.dbc          # Datos principales de talentos
│       ├── TalentTab.dbc       # Pestañas de especialización
│       └── Spell.dbc           # Información de hechizos
├── patch-2.mpq               # Archivos comprimidos
└── patch-3.mpq
```

#### Herramientas necesarias:
- **MPQ Editor** o **WoW Model Viewer** para extraer archivos .mpq
- **DBC Editor** para leer archivos .dbc

### 3. **Script de Línea de Comandos** (Avanzado)
Si tienes acceso a herramientas de extracción de WoW:
```bash
# Ejemplo usando herramientas de la comunidad
python wow-dbc-reader.py --file="Talent.dbc" --output="talents.json"
```

## 📊 Estructura de Datos Objetivo

```typescript
{
  "ClassName": {
    "SpecName": {
      "1": { // Tier 1
        "talents": [
          {
            "name": "Talent Name",
            "icon": "icon_filename.jpg",
            "maxPoints": 5,
            "description": "Talent description",
            "position": { "row": 0, "col": 0 }
          }
        ],
        "requiredPoints": 0
      }
    }
  }
}
```

## 🔄 Clases Faltantes por Completar

### Prioridad Alta:
- [ ] **Mage** (Arcane, Fire, Frost)
- [ ] **Priest** (Discipline, Holy, Shadow)
- [ ] **Warlock** (Affliction, Demonology, Destruction)

### Prioridad Media:
- [ ] **Hunter** (Beast Mastery, Marksmanship, Survival)
- [ ] **Rogue** (Assassination, Combat, Subtlety)
- [ ] **Shaman** (Elemental, Enhancement, Restoration)
- [ ] **Druid** (Balance, Feral Combat, Restoration)

### Turtle WoW Exclusivas:
- [ ] **Death Knight** (si está disponible)
- [ ] Talentos modificados específicos de Turtle WoW

## 🛠️ Comandos Útiles

### Para usar el script del navegador:
1. Abrir https://database.turtle-wow.org/
2. F12 -> Console
3. Pegar el script de `scripts/extract-turtle-talents.js`
4. Ejecutar: `extractTalentData('Mage', 'Fire')`

### Para organizar datos extraídos:
```javascript
// Convertir datos extraídos al formato de tu app
const formattedData = formatTalentTree(extractedData);
console.log(JSON.stringify(formattedData, null, 2));
```

## 📋 Lista de Iconos Comunes de WoW

Los iconos siguen el patrón: `spell_category_spellname.jpg`

Ejemplos:
- `spell_holy_heal.jpg` - Hechizos sagrados
- `ability_warrior_charge.jpg` - Habilidades de guerrero  
- `inv_sword_27.jpg` - Items/armas
- `spell_nature_lightning.jpg` - Hechizos de naturaleza
- `spell_shadow_deathcoil.jpg` - Hechizos sombríos

## 🎮 Verificación In-Game

Para verificar datos:
1. Crear personaje de la clase en Turtle WoW
2. Abrir árbol de talentos (N)
3. Comparar con datos extraídos
4. Anotar diferencias específicas de Turtle WoW

## 📝 Notas Importantes

- Turtle WoW tiene modificaciones únicas vs WoW Classic vanilla
- Algunos talentos pueden tener valores diferentes
- Verificar siempre con la fuente oficial de Turtle WoW
- Los iconos pueden estar en formato .tga convertidos a .jpg
