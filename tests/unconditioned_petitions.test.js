const assert = require('assert');
const { detectSuspensiveClauses, enforceAffirmativeStudentStatus, buildAffirmativeSafeguardClaim } = require('../src/unconditioned-petition-validator');

console.log('🧪 Ejecutando unconditioned_petitions.test.js...');

const badClaim = "Solicito salvaguardar el cupo mientras concluyo el tratamiento y mientras me alivio no voy a estudiar.";
const detected = detectSuspensiveClauses(badClaim);
assert(detected.length >= 2, 'Debe detectar las cláusulas suspensivas');

const fixedClaim = enforceAffirmativeStudentStatus(badClaim);
assert(!fixedClaim.includes('mientras concluyo el tratamiento'));

const affirmativeClaim = buildAffirmativeSafeguardClaim('Pregrado en Ciencia Política');
assert(affirmativeClaim.includes('continuar normalmente mis estudios'));
assert(!affirmativeClaim.includes('mientras'));

console.log('✅ unconditioned_petitions.test.js pasó exitosamente.');
