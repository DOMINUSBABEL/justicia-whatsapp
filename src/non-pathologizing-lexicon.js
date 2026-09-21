/**
 * Mapeador de Léxico No Patologizante y Respetuoso para Salud Mental
 * Erradica terminología clínica estigmatizante o institucionalizada.
 */

const PATHOLOGIZING_REPLACEMENTS = [
  { pattern: /\b(tratamiento\s+cl[ií]nico)\b/gi, replacement: 'acompañamiento y tratamiento psicológico' },
  { pattern: /\b(cl[ií]nic[oa]s?)\b/gi, replacement: 'psicológico' },
  { pattern: /\b(cuadro\s+cl[ií]nico)\b/gi, replacement: 'situación de salud emocional' },
  { pattern: /\b(patolog[ií]a\s+severa|patolog[ií]as?)\b/gi, replacement: 'afectación transitoria de salud' },
  { pattern: /\b(psiqui[aá]tric[oa]s?|psiquiatr[ií]a)\b/gi, replacement: 'apoyo terapéutico y psicológico' },
  { pattern: /\b(trastorno\s+mental\s+grave)\b/gi, replacement: 'momento difícil de desestabilización anímica' },
  { pattern: /\b(enfermedad\s+invalidante)\b/gi, replacement: 'bloqueo emocional involuntario' },
  { pattern: /\b(contingencia\s+m[eé]dica)\b/gi, replacement: 'dificultad de salud y bienestar personal' }
];

function sanitizeLexicon(text) {
  if (!text || typeof text !== 'string') return text;
  let sanitized = text;
  for (const item of PATHOLOGIZING_REPLACEMENTS) {
    sanitized = sanitized.replace(item.pattern, item.replacement);
  }
  return sanitized;
}

function hasPathologizingJargon(text) {
  if (!text || typeof text !== 'string') return false;
  return PATHOLOGIZING_REPLACEMENTS.some(item => item.pattern.test(text));
}

module.exports = {
  sanitizeLexicon,
  hasPathologizingJargon,
  PATHOLOGIZING_REPLACEMENTS
};
