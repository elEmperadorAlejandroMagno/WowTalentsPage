const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const SHARED_SPECS_FILE = path.join(__dirname, '../public/shared-specs/shared-specs.json');
const EXPIRY_HOURS = 2;

/**
 * Lee el archivo de specs compartidas
 */
function readSharedSpecs() {
  try {
    if (!fs.existsSync(SHARED_SPECS_FILE)) {
      const initialData = {
        specs: {},
        metadata: {
          lastCleanup: null,
          version: '1.0',
          totalSpecs: 0,
          expiryHours: EXPIRY_HOURS
        }
      };
      fs.writeFileSync(SHARED_SPECS_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    
    const data = fs.readFileSync(SHARED_SPECS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading shared specs file:', error);
    return {
      specs: {},
      metadata: {
        lastCleanup: null,
        version: '1.0',
        totalSpecs: 0,
        expiryHours: EXPIRY_HOURS
      }
    };
  }
}

/**
 * Escribe al archivo de specs compartidas
 */
function writeSharedSpecs(data) {
  try {
    // Asegurar que el directorio existe
    const dir = path.dirname(SHARED_SPECS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(SHARED_SPECS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing shared specs file:', error);
    return false;
  }
}

/**
 * Guarda una spec compartida y retorna el ID
 */
function saveSharedSpec(spec) {
  try {
    const data = readSharedSpecs();
    const shareId = uuidv4();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
    
    const sharedSpec = {
      ...spec,
      shareId,
      sharedAt: now,
      expiresAt
    };
    
    data.specs[shareId] = sharedSpec;
    data.metadata.totalSpecs = Object.keys(data.specs).length;
    
    // Limpiar specs expiradas mientras guardamos
    cleanupExpiredSpecs(data);
    
    if (writeSharedSpecs(data)) {
      console.log(`Spec "${spec.name}" saved with ID: ${shareId}`);
      return shareId;
    } else {
      throw new Error('Failed to write to file');
    }
  } catch (error) {
    console.error('Error saving shared spec:', error);
    return null;
  }
}

/**
 * Recupera una spec compartida por ID
 */
function getSharedSpec(shareId) {
  try {
    const data = readSharedSpecs();
    const spec = data.specs[shareId];
    
    if (!spec) {
      console.log(`Spec not found for ID: ${shareId}`);
      return null;
    }
    
    // Verificar si ha expirado
    if (new Date(spec.expiresAt) < new Date()) {
      console.log(`Spec expired for ID: ${shareId}`);
      delete data.specs[shareId];
      data.metadata.totalSpecs = Object.keys(data.specs).length;
      writeSharedSpecs(data);
      return null;
    }
    
    // Retornar la spec sin los campos de compartir
    const { shareId: _, sharedAt: __, expiresAt: ___, ...cleanSpec } = spec;
    console.log(`Spec "${cleanSpec.name}" retrieved for ID: ${shareId}`);
    return cleanSpec;
  } catch (error) {
    console.error('Error getting shared spec:', error);
    return null;
  }
}

/**
 * Limpia specs expiradas
 */
function cleanupExpiredSpecs(data = null) {
  try {
    const specsData = data || readSharedSpecs();
    const now = new Date();
    let cleaned = 0;
    
    Object.keys(specsData.specs).forEach(shareId => {
      if (new Date(specsData.specs[shareId].expiresAt) < now) {
        delete specsData.specs[shareId];
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      specsData.metadata.totalSpecs = Object.keys(specsData.specs).length;
      specsData.metadata.lastCleanup = now.toISOString();
      
      if (!data) { // Solo escribir si no se pasó data (llamada independiente)
        writeSharedSpecs(specsData);
      }
      
      console.log(`Cleaned up ${cleaned} expired specs`);
    }
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning up expired specs:', error);
    return 0;
  }
}

/**
 * Obtiene estadísticas del archivo de specs compartidas
 */
function getStats() {
  try {
    const data = readSharedSpecs();
    const specs = Object.values(data.specs);
    const now = new Date();
    
    const expired = specs.filter(spec => new Date(spec.expiresAt) < now).length;
    const sizeKB = Math.round(JSON.stringify(data).length / 1024);
    
    let oldestExpiry = null;
    let newestExpiry = null;
    
    const validSpecs = specs.filter(spec => new Date(spec.expiresAt) >= now);
    if (validSpecs.length > 0) {
      const expiryDates = validSpecs.map(spec => new Date(spec.expiresAt));
      oldestExpiry = new Date(Math.min(...expiryDates.map(d => d.getTime()))).toISOString();
      newestExpiry = new Date(Math.max(...expiryDates.map(d => d.getTime()))).toISOString();
    }
    
    return {
      total: specs.length,
      expired,
      sizeKB,
      oldestExpiry,
      newestExpiry,
      lastCleanup: data.metadata.lastCleanup
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      total: 0,
      expired: 0,
      sizeKB: 0,
      oldestExpiry: null,
      newestExpiry: null,
      lastCleanup: null
    };
  }
}

// CLI interface si se ejecuta directamente
if (require.main === module) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'cleanup':
      const cleaned = cleanupExpiredSpecs();
      console.log(`Cleanup completed. Removed ${cleaned} expired specs.`);
      break;
      
    case 'stats':
      const stats = getStats();
      console.log('Shared Specs Statistics:');
      console.log(`- Total specs: ${stats.total}`);
      console.log(`- Expired specs: ${stats.expired}`);
      console.log(`- Size: ${stats.sizeKB} KB`);
      console.log(`- Last cleanup: ${stats.lastCleanup || 'Never'}`);
      break;
      
    case 'get':
      if (!arg) {
        console.error('Please provide a share ID');
        process.exit(1);
      }
      const spec = getSharedSpec(arg);
      if (spec) {
        console.log('Spec found:', JSON.stringify(spec, null, 2));
      } else {
        console.log('Spec not found or expired');
        process.exit(1);
      }
      break;
      
    case 'save':
      if (!arg) {
        console.error('Please provide spec data as JSON string');
        process.exit(1);
      }
      try {
        const specData = JSON.parse(arg);
        const shareId = saveSharedSpec(specData);
        if (shareId) {
          console.log('Spec saved with ID:', shareId);
        } else {
          console.error('Failed to save spec');
          process.exit(1);
        }
      } catch (error) {
        console.error('Invalid JSON provided:', error.message);
        process.exit(1);
      }
      break;
      
    default:
      console.log('Usage:');
      console.log('  node shared-specs-manager.js cleanup');
      console.log('  node shared-specs-manager.js stats');
      console.log('  node shared-specs-manager.js get <shareId>');
      console.log('  node shared-specs-manager.js save <jsonSpec>');
      break;
  }
}

module.exports = {
  saveSharedSpec,
  getSharedSpec,
  cleanupExpiredSpecs,
  getStats,
  readSharedSpecs,
  writeSharedSpecs
};
