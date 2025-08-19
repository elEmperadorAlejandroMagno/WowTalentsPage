# 🗃️ Extracción de Datos desde Instalación de Turtle WoW

## 📍 **Ubicación de archivos en tu instalación:**
```
E:\Turtle WoW\Data\
├── enUS\ (o tu idioma)
│   └── DBFilesClient\
│       ├── Talent.dbc
│       ├── TalentTab.dbc
│       ├── Spell.dbc
│       └── SpellIcon.dbc
└── patch-*.mpq (archivos comprimidos)
```

## 🔧 **Métodos de extracción:**

### **Opción A: Herramientas de la comunidad WoW**

1. **MPQ Editor** (Recomendado)
   - Descargar: http://www.zezula.net/en/mpq/download.html
   - Usar para abrir archivos `.mpq`

2. **WoW Model Viewer**
   - Incluye herramientas para extraer datos
   - Más completo pero más pesado

3. **DBCUtil** o **WowDBCEditor**
   - Específicamente para leer archivos `.dbc`

### **Opción B: Script Python para leer DBC**

```python
import struct
import os

def read_dbc_file(file_path):
    with open(file_path, 'rb') as f:
        # Header DBC
        signature = f.read(4)  # 'WDBC'
        record_count = struct.unpack('<I', f.read(4))[0]
        field_count = struct.unpack('<I', f.read(4))[0]
        record_size = struct.unpack('<I', f.read(4))[0]
        string_block_size = struct.unpack('<I', f.read(4))[0]
        
        print(f"Records: {record_count}, Fields: {field_count}")
        
        # Leer records
        records = []
        for i in range(record_count):
            record = []
            for j in range(field_count):
                value = struct.unpack('<I', f.read(4))[0]
                record.append(value)
            records.append(record)
        
        return records

# Ejemplo de uso
# talents = read_dbc_file("E:/Turtle WoW/Data/enUS/DBFilesClient/Talent.dbc")
```

## 🎯 **Datos específicos a buscar:**

### **En Talent.dbc:**
- ID del talento
- Nombre del talento
- Icono
- Descripción
- Puntos máximos
- Posición en el árbol (row, column)
- Prerequisitos

### **En TalentTab.dbc:**
- ID de la pestaña
- Nombre de la especialización
- Clase asociada
- Orden de las pestañas

## 🏃‍♂️ **Método rápido usando WoW Classic data:**

Ya que Turtle WoW está basado en Classic, podemos usar datos conocidos como base y hacer ajustes específicos.

## 📋 **Lista de clases por completar:**

### **Prioritarias:**
- [ ] **Mage** (Arcane, Fire, Frost)
- [ ] **Warlock** (Affliction, Demonology, Destruction)  
- [ ] **Hunter** (Beast Mastery, Marksmanship, Survival)

### **Secundarias:**
- [ ] **Rogue** (Assassination, Combat, Subtlety)
- [ ] **Shaman** (Elemental, Enhancement, Restoration)
- [ ] **Druid** (Balance, Feral Combat, Restoration)

## 🎮 **Alternativa: Datos en el juego**

**Método manual pero efectivo:**

1. **Crear personajes de cada clase**
2. **Tomar screenshots del árbol de talentos**
3. **Anotar manualmente:**
   - Nombres exactos
   - Puntos máximos
   - Posición en el árbol
   - Prerequisitos de puntos

### **Template para datos manuales:**
```typescript
{
  "className": "Mage",
  "spec": "Fire", 
  "tier": 1,
  "talents": [
    {
      "name": "Improved Fireball",
      "icon": "spell_fire_flamebolt.jpg",
      "maxPoints": 5,
      "position": { "row": 0, "column": 0 }
    }
  ]
}
```

## 💡 **Recomendación inmediata:**

¿Te gustaría que creemos datos de **Mage** primero usando datos conocidos de WoW Classic como base? Podríamos:

1. Usar la estructura de Classic como referencia
2. Ajustar nombres/valores específicos de Turtle WoW
3. Verificar después in-game cuando sea posible

¿Cuál clase prefieres que hagamos primero mientras la base de datos vuelve a estar online?
