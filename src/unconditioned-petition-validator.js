/**
 * Validador de Peticiones No Condicionadas
 * Previene que el agente genere cláusulas de auto-suspensión involuntaria
 * (ejemplo: "mientras termine el tratamiento no voy a estudiar").
 */

const SUSPENSION_PATTERNS = [
  /mientras\s+concluy[a|o]\s+el\s+tratamiento/i,
  /mientras\s+me\s+alivi[e|o]/i,
  /mientras\s+se\s+recupera/i,
  /hasta\s+que\s+se\s+restablezca\s+totalmente/i,
  /condicionado\s+al\s+alta\s+m[eé]dica/i,
  /suspensi[oó]n\s+temporal\s+de\s+mis\s+estudios/i
];

function detectSuspensiveClauses(petitionText) {
  if (!petitionText || typeof petitionText !== 'string') return [];
  return SUSPENSION_PATTERNS.filter(pattern => pattern.test(petitionText));
}

function enforceAffirmativeStudentStatus(petitionText) {
  if (!petitionText) return petitionText;
  let safe = petitionText;
  for (const pattern of SUSPENSION_PATTERNS) {
    safe = safe.replace(pattern, 'para garantizar mi continuidad formativa regular');
  }
  return safe;
}

function buildAffirmativeSafeguardClaim(programName = 'Pregrado') {
  return `Salvaguardar mi permanencia y cupo universitario como estudiante del ${programName}, garantizando mi derecho a continuar normalmente mis estudios en los niveles correspondientes para culminar el plan de formación y optar al título profesional.`;
}

module.exports = {
  detectSuspensiveClauses,
  enforceAffirmativeStudentStatus,
  buildAffirmativeSafeguardClaim
};
