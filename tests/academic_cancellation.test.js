const assert = require('assert');
const { extractCoursesAndCodes } = require('../src/course-catalog-extractor');
const { buildStandingProtectionPetitions } = require('../src/academic-standing-guard');

console.log('🧪 Ejecutando academic_cancellation.test.js...');

const rawInput = "Analítica de datos y machine learning aplicado a la ciencia política Código: 1035056\nSeminario de investigación Código: 1035701";
const courses = extractCoursesAndCodes(rawInput);

assert.strictEqual(courses.length, 2, 'Deben extraerse exactamente 2 materias');
assert.strictEqual(courses[0].codigo, '1035056');
assert.strictEqual(courses[1].codigo, '1035701');

const petitions = buildStandingProtectionPetitions(courses, '2026-1');
assert(petitions.primera.includes('1035056'), 'La primera petición debe incluir la materia 1035056');
assert(petitions.segunda.includes('promedio de crédito'), 'La segunda petición debe proteger el promedio');
assert(petitions.tercera.includes('continuar normalmente mis estudios'), 'La tercera debe garantizar continuidad sin congelamiento');

console.log('✅ academic_cancellation.test.js pasó exitosamente.');
