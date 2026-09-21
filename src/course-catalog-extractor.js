/**
 * Extractor de Asignaturas y Códigos Numéricos Universitarios
 * Parsea nombres de materias y códigos de 5 a 7 dígitos (ej: 1035056, 1035701).
 */

function extractCoursesAndCodes(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  const results = [];
  const lines = rawText.split(/[\n\/\|]/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const codeMatch = trimmed.match(/\b(\d{6,8})\b/);
    if (codeMatch) {
      const code = codeMatch[1];
      const name = trimmed
        .replace(/c[oó]digo:?/gi, '')
        .replace(code, '')
        .replace(/^[\s\-\:\•\*]+/, '')
        .trim();

      results.push({
        codigo: code,
        nombre: name || 'Asignatura Universitaria',
        docente: 'Docente Titular / Asesor'
      });
    }
  }

  return results;
}

module.exports = {
  extractCoursesAndCodes
};
