# 🙏 GUÍA ESPECÍFICA: EXTRACCIÓN DE PRIEST

## 🎯 **URLs DIRECTAS PARA PRIEST**

### **Búsquedas recomendadas en database.turtle-wow.org:**
- `"Priest talents"`
- `"Discipline talents"`  
- `"Holy talents"`
- `"Shadow talents"`
- `"Inner Fire"` (talento icónico de Priest)
- `"Mind Control"` (Shadow)
- `"Greater Heal"` (Holy)

## 📋 **CHECKLIST DE EXTRACCIÓN**

### **Discipline (Spec 1):**
- [ ] Talentos de tier 1 (0-5 puntos)
- [ ] Talentos de tier 2 (5-10 puntos)  
- [ ] Talentos de tier 3 (10-15 puntos)
- [ ] Talentos de tier 4 (15-20 puntos)
- [ ] Talentos de tier 5 (20-25 puntos)
- [ ] Talentos de tier 6 (25-30 puntos)
- [ ] Talent ultimate (30+ puntos)

### **Holy (Spec 2):**
- [ ] Healing Light
- [ ] Improved Renew
- [ ] Spiritual Guidance
- [ ] Circle of Healing (si existe en Turtle WoW)

### **Shadow (Spec 3):**
- [ ] Shadow Affinity
- [ ] Improved Shadow Word: Pain
- [ ] Mind Control
- [ ] Shadowform (ultimate)

## 🛠️ **COMANDOS ESPECÍFICOS PARA PRIEST**

```javascript
// 1. Extraer talentos de la página actual
const priestTalents = extractTurtleTalents();

// 2. Formatear para Discipline
const disciplineTree = formatTalentTree({
    className: "Priest",
    specName: "Discipline", 
    talents: priestTalents
});

// 3. Formatear para Holy  
const holyTree = formatTalentTree({
    className: "Priest",
    specName: "Holy",
    talents: priestTalents
});

// 4. Formatear para Shadow
const shadowTree = formatTalentTree({
    className: "Priest", 
    specName: "Shadow",
    talents: priestTalents
});

// 5. Crear estructura completa de Priest
const priestComplete = {
    Priest: {
        Discipline: disciplineTree,
        Holy: holyTree, 
        Shadow: shadowTree
    }
};

// 6. Ver resultado final
console.log('PRIEST COMPLETO:', JSON.stringify(priestComplete, null, 2));
```

## 🔍 **TALENTOS ICÓNICOS A BUSCAR**

### **Discipline:**
- Power Infusion
- Inner Focus  
- Mental Agility
- Improved Power Word: Shield

### **Holy:**
- Circle of Healing
- Greater Heal
- Blessed Recovery
- Spirit of Redemption

### **Shadow:**
- Shadowform
- Mind Control
- Vampiric Embrace
- Shadow Weaving

## ⚠️ **COSAS A VERIFICAR EN TURTLE WOW**

Turtle WoW puede tener modificaciones únicas:
- Algunos talentos pueden tener valores diferentes
- Pueden existir talentos custom
- Las posiciones en el árbol pueden variar

## 📊 **TEMPLATE DE DATOS ESPERADOS**

```typescript
Priest: {
  Discipline: {
    '1': { 
      talents: [
        { name: 'Unbreakable Will', icon: 'spell_magic_magearmor.jpg', maxPoints: 5 },
        { name: 'Wand Specialization', icon: 'inv_wand_01.jpg', maxPoints: 5 }
      ], 
      requiredPoints: 0 
    },
    // ... más tiers
  },
  Holy: {
    '1': { 
      talents: [
        { name: 'Healing Focus', icon: 'spell_holy_heal.jpg', maxPoints: 2 },
        { name: 'Improved Renew', icon: 'spell_holy_renew.jpg', maxPoints: 3 }
      ], 
      requiredPoints: 0 
    },
    // ... más tiers
  },
  Shadow: {
    '1': { 
      talents: [
        { name: 'Spirit Tap', icon: 'spell_shadow_requiem.jpg', maxPoints: 5 },
        { name: 'Blackout', icon: 'spell_shadow_gathershadows.jpg', maxPoints: 5 }
      ], 
      requiredPoints: 0 
    },
    // ... más tiers
  }
}
```
