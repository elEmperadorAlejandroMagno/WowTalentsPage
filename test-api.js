// Test simple para verificar la integración con la API
const API_URL = 'http://localhost:3000/api';

// Datos de prueba simulando una spec
const testSpec = {
  id: `temp_${Date.now()}`,
  name: 'Test Warrior Build',
  className: 'Warrior',
  assignedPoints: {
    'Arms': { '1': [3, 5, 2], '2': [2, 0, 3] },
    'Fury': { '1': [2, 5] },
    'Protection': {}
  },
  totalPoints: 20,
  availablePoints: 31,
  createdAt: new Date().toISOString()
};

async function testSaveBuild() {
  try {
    console.log('🔄 Guardando build de prueba...');
    
    const response = await fetch(`${API_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testSpec)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Build guardada exitosamente!');
      console.log('📋 ID para compartir:', result.id);
      console.log('🕒 Expira en:', result.expiresAt);
      console.log('🔗 URL para compartir:', `http://localhost:3001?build=${result.id}`);
      
      return result.id;
    } else {
      console.error('❌ Error guardando build:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return null;
  }
}

async function testLoadBuild(shareId) {
  try {
    console.log('\n🔄 Cargando build compartida...');
    
    const response = await fetch(`${API_URL}/data/${shareId}`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Build cargada exitosamente!');
      console.log('📋 Nombre:', result.data.name);
      console.log('🏛️ Clase:', result.data.className);
      console.log('🎯 Puntos totales:', result.data.totalPoints);
      console.log('📊 Datos completos:', result.data);
      return result.data;
    } else {
      console.error('❌ Error cargando build:', result.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return null;
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🧪 Iniciando pruebas de integración API...\n');
  
  // Guardar build
  const shareId = await testSaveBuild();
  
  if (shareId) {
    // Cargar build
    await testLoadBuild(shareId);
  }
  
  console.log('\n🎉 Pruebas completadas!');
}

// Solo ejecutar si se llama directamente
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
}
