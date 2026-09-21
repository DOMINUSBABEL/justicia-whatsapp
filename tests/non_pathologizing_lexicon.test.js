const assert = require('assert');
const { sanitizeLexicon, hasPathologizingJargon } = require('../src/non-pathologizing-lexicon');

console.log('🧪 Ejecutando non_pathologizing_lexicon.test.js...');

const problematicText = "El estudiante requiere tratamiento clínico debido a un cuadro clínico severo y una patología que ameritó atención psiquiátrica.";
assert(hasPathologizingJargon(problematicText), 'Debe detectar jerga clínica');

const cleanedText = sanitizeLexicon(problematicText);
assert(!cleanedText.toLowerCase().includes('clínico'), 'No debe quedar la palabra clínico');
assert(!cleanedText.toLowerCase().includes('patología'), 'No debe quedar la palabra patología');
assert(!cleanedText.toLowerCase().includes('psiquiátrica'), 'No debe quedar la palabra psiquiátrica');

console.log('Texto limpio:', cleanedText);
console.log('✅ non_pathologizing_lexicon.test.js pasó exitosamente.');
