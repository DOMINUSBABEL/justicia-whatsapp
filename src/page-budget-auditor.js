/**
 * Auditor Automático de Presupuesto de Páginas
 * Verifica que el memorial no exceda las 3 páginas prescritas.
 */

const { calculateWordCount, MAX_TOTAL_DOCUMENT_WORDS } = require('./page-budget-engine');

function auditDocumentLength(documentText) {
  const words = calculateWordCount(documentText);
  const estimatedPages = Number((words / 380).toFixed(1));
  const compliant = words <= MAX_TOTAL_DOCUMENT_WORDS;

  return {
    words,
    estimatedPages,
    compliant,
    verdict: compliant
      ? `Aprobado: Memorial acotado a ${estimatedPages} páginas (Regla de 3 páginas cumplida).`
      : `Alerta: El memorial tiene ${words} palabras (~${estimatedPages} páginas), excede el límite recomendado de 3 páginas.`
  };
}

module.exports = {
  auditDocumentLength
};
