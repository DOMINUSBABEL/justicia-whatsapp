/**
 * Filtro Anti-Slop y Des-robotizador de Prosa Jurídica
 * Erradica fórmulas automáticas, pleonasmos y clichés de LLMs.
 */

const SLOP_PATTERNS = [
  { pattern: /\bes menester se[ñn]alar que\b/gi, replacement: 'es claro que' },
  { pattern: /\bhuelga decir que\b/gi, replacement: 'además,' },
  { pattern: /\ben este orden de ideas,?/gi, replacement: 'por consiguiente,' },
  { pattern: /\bcabe destacar de manera imperiosa\b/gi, replacement: 'debo señalar' },
  { pattern: /\bcomo es bien sabido por todos\b/gi, replacement: 'como consta en los registros' },
  { pattern: /\ben conclusi[oó]n,? cabe resaltar que\b/gi, replacement: 'finalmente,' },
  { pattern: /\ba mayor abundamiento de razones\b/gi, replacement: 'asimismo,' },
  { pattern: /\ben el marco de la presente solicitud formal misiva\b/gi, replacement: 'mediante este escrito' }
];

function filterAiSlop(text) {
  if (!text || typeof text !== 'string') return text;
  let cleaned = text;
  for (const item of SLOP_PATTERNS) {
    cleaned = cleaned.replace(item.pattern, item.replacement);
  }
  return cleaned;
}

module.exports = {
  filterAiSlop,
  SLOP_PATTERNS
};
