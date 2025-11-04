#!/usr/bin/env node

/**
 * Script de ayuda para migrar colores antiguos a la nueva paleta dark-blue
 *
 * Uso:
 * node migrate-colors.js [archivo.html]
 *
 * Si no se proporciona un archivo, analiza todos los archivos .html en src/app
 */

const fs = require('fs');
const path = require('path');

// Mapa de reemplazos sugeridos
const colorMigrationMap = {
  // Backgrounds
  'bg-blue-50': 'bg-dark-blue-50',
  'bg-blue-100': 'bg-dark-blue-100',
  'bg-blue-200': 'bg-dark-blue-200',
  'bg-blue-300': 'bg-dark-blue-300',
  'bg-blue-400': 'bg-dark-blue-400',
  'bg-blue-500': 'bg-dark-blue-500',
  'bg-blue-600': 'bg-dark-blue-600',
  'bg-blue-700': 'bg-dark-blue-700',
  'bg-blue-800': 'bg-dark-blue-800',
  'bg-blue-900': 'bg-dark-blue-900',

  'dark:bg-blue-50': 'dark:bg-dark-blue-950',
  'dark:bg-blue-100': 'dark:bg-dark-blue-900',
  'dark:bg-blue-200': 'dark:bg-dark-blue-800',
  'dark:bg-blue-300': 'dark:bg-dark-blue-700',
  'dark:bg-blue-400': 'dark:bg-dark-blue-600',
  'dark:bg-blue-500': 'dark:bg-dark-blue-500',
  'dark:bg-blue-600': 'dark:bg-dark-blue-400',
  'dark:bg-blue-700': 'dark:bg-dark-blue-300',
  'dark:bg-blue-800': 'dark:bg-dark-blue-200',
  'dark:bg-blue-900': 'dark:bg-dark-blue-100',
  'dark:bg-blue-900/30': 'dark:bg-dark-blue-900/30',
  'dark:bg-blue-900/20': 'dark:bg-dark-blue-900/20',

  // Purple -> dark-blue
  'bg-purple-50': 'bg-dark-blue-50',
  'bg-purple-100': 'bg-dark-blue-100',
  'bg-purple-200': 'bg-dark-blue-200',
  'bg-purple-300': 'bg-dark-blue-400',
  'bg-purple-400': 'bg-dark-blue-500',
  'bg-purple-500': 'bg-dark-blue-600',
  'bg-purple-600': 'bg-dark-blue-700',
  'bg-purple-700': 'bg-dark-blue-800',
  'bg-purple-800': 'bg-dark-blue-900',
  'bg-purple-900': 'bg-dark-blue-950',

  'dark:bg-purple-900/30': 'dark:bg-dark-blue-900/30',
  'dark:bg-purple-900/20': 'dark:bg-dark-blue-900/20',
  'dark:bg-purple-800/20': 'dark:bg-dark-blue-800/20',

  // Text colors
  'text-blue-100': 'text-dark-blue-100',
  'text-blue-200': 'text-dark-blue-200',
  'text-blue-300': 'text-dark-blue-300',
  'text-blue-400': 'text-dark-blue-400',
  'text-blue-500': 'text-dark-blue-500',
  'text-blue-600': 'text-dark-blue-600',
  'text-blue-700': 'text-dark-blue-700',
  'text-blue-800': 'text-dark-blue-800',
  'text-blue-900': 'text-dark-blue-900',

  'dark:text-blue-100': 'dark:text-dark-blue-100',
  'dark:text-blue-200': 'dark:text-dark-blue-200',
  'dark:text-blue-300': 'dark:text-dark-blue-300',
  'dark:text-blue-400': 'dark:text-dark-blue-400',

  'text-purple-300': 'text-dark-blue-300',
  'text-purple-400': 'text-dark-blue-400',
  'text-purple-600': 'text-dark-blue-600',
  'text-purple-700': 'text-dark-blue-700',
  'text-purple-800': 'text-dark-blue-800',
  'text-purple-900': 'text-dark-blue-900',

  'dark:text-purple-100': 'dark:text-dark-blue-100',
  'dark:text-purple-200': 'dark:text-dark-blue-200',
  'dark:text-purple-300': 'dark:text-dark-blue-300',
  'dark:text-purple-400': 'dark:text-dark-blue-400',

  // Borders
  'border-blue-200': 'border-dark-blue-200',
  'border-blue-400': 'border-dark-blue-400',
  'border-blue-800': 'border-dark-blue-800',

  'dark:border-blue-600': 'dark:border-dark-blue-600',
  'dark:border-blue-800': 'dark:border-dark-blue-800',

  'border-purple-200': 'border-dark-blue-200',
  'border-purple-400': 'border-dark-blue-400',
  'border-purple-800': 'border-dark-blue-800',

  'dark:border-purple-600': 'dark:border-dark-blue-600',
  'dark:border-purple-800': 'dark:border-dark-blue-800',

  // Hovers
  'hover:bg-blue-700': 'hover:bg-dark-blue-700',
  'hover:border-blue-500': 'hover:border-dark-blue-500',
  'dark:hover:border-blue-500': 'dark:hover:border-dark-blue-500',

  'hover:to-purple-700': 'hover:to-dark-blue-700',

  // Gradients - from
  'from-blue-50': 'from-dark-blue-50',
  'from-blue-500': 'from-dark-blue-500',
  'from-blue-600': 'from-dark-blue-600',
  'from-purple-50': 'from-dark-blue-50',
  'from-purple-500': 'from-dark-blue-600',
  'from-purple-600': 'from-dark-blue-700',

  'dark:from-blue-900/20': 'dark:from-dark-blue-900/20',
  'dark:from-purple-900/20': 'dark:from-dark-blue-900/20',

  // Gradients - to
  'to-blue-100': 'to-dark-blue-100',
  'to-blue-600': 'to-dark-blue-600',
  'to-purple-50': 'to-dark-blue-100',
  'to-purple-100': 'to-dark-blue-200',
  'to-purple-600': 'to-dark-blue-700',

  'dark:to-blue-800/20': 'dark:to-dark-blue-800/20',
  'dark:to-purple-800/20': 'dark:to-dark-blue-800/20',

  // Gradients - via
  'via-purple-600': 'via-dark-blue-600',
  'via-purple-500': 'via-dark-blue-500',
};

// Colores que probablemente deberían mantenerse (para casos especiales)
const colorsToKeep = [
  'green-', // Para éxito
  'red-',   // Para errores
  'yellow-', // Para advertencias
  'amber-',  // Para advertencias
  'gray-',   // Para neutrales
];

function shouldKeepColor(colorClass) {
  return colorsToKeep.some(keep => colorClass.includes(keep));
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const findings = [];

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Buscar clases de color blue y purple
    const blueMatches = line.match(/(?:class|className)=["'][^"']*\b((?:dark:)?(?:bg-|text-|border-|from-|to-|via-|hover:bg-|hover:border-|hover:to-)(?:blue|purple)-\d+(?:\/\d+)?)\b[^"']*["']/g);

    if (blueMatches) {
      blueMatches.forEach(match => {
        const colorClasses = match.match(/\b((?:dark:)?(?:bg-|text-|border-|from-|to-|via-|hover:bg-|hover:border-|hover:to-)(?:blue|purple)-\d+(?:\/\d+)?)\b/g);

        if (colorClasses) {
          colorClasses.forEach(colorClass => {
            if (!shouldKeepColor(colorClass)) {
              const suggestion = colorMigrationMap[colorClass] || `${colorClass.replace(/blue|purple/, 'dark-blue')}`;

              findings.push({
                line: lineNum,
                original: colorClass,
                suggestion: suggestion,
                context: line.trim().substring(0, 100)
              });
            }
          });
        }
      });
    }
  });

  return findings;
}

function migrateFile(filePath, dryRun = true) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Analizando: ${filePath}`);
  console.log('='.repeat(80));

  const findings = analyzeFile(filePath);

  if (findings.length === 0) {
    console.log('✓ No se encontraron colores para migrar');
    return;
  }

  console.log(`\nEncontrados ${findings.length} colores para migrar:\n`);

  findings.forEach((finding, idx) => {
    console.log(`${idx + 1}. Línea ${finding.line}:`);
    console.log(`   ${finding.original} → ${finding.suggestion}`);
    console.log(`   Contexto: ${finding.context}${finding.context.length >= 100 ? '...' : ''}`);
    console.log('');
  });

  if (!dryRun) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Realizar reemplazos
    Object.keys(colorMigrationMap).forEach(oldColor => {
      const newColor = colorMigrationMap[oldColor];
      const regex = new RegExp(`\\b${oldColor}\\b`, 'g');
      content = content.replace(regex, newColor);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Archivo actualizado: ${filePath}`);
  } else {
    console.log('💡 Ejecuta con --apply para aplicar los cambios');
  }
}

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('dist')) {
        findHtmlFiles(filePath, fileList);
      }
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main
const args = process.argv.slice(2);
const applyChanges = args.includes('--apply');
const targetFile = args.find(arg => !arg.startsWith('--'));

console.log('\n🎨 Migración de Paleta de Colores - FlashElicit');
console.log('━'.repeat(80));

if (targetFile) {
  if (fs.existsSync(targetFile)) {
    migrateFile(targetFile, !applyChanges);
  } else {
    console.error(`❌ Error: No se encuentra el archivo ${targetFile}`);
    process.exit(1);
  }
} else {
  const srcPath = path.join(__dirname, 'src', 'app');

  if (!fs.existsSync(srcPath)) {
    console.error('❌ Error: No se encuentra el directorio src/app');
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(srcPath);

  console.log(`\nEncontrados ${htmlFiles.length} archivos HTML\n`);

  htmlFiles.forEach(file => {
    migrateFile(file, !applyChanges);
  });
}

console.log('\n' + '━'.repeat(80));
console.log('✨ Análisis completado');
console.log('━'.repeat(80) + '\n');

if (!applyChanges) {
  console.log('💡 Para aplicar los cambios, ejecuta:');
  console.log('   node migrate-colors.js --apply\n');
}
