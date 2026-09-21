/**
 * Normalizador de Español Colombiano (es-CO) y Corrección Fonética
 * Previene subrayados ortográficos en procesadores de texto y ajusta vocablos regionales.
 */

const REGIONAL_TERMS_MAP = {
  "pregrado": "pregrado",
  "pensum": "plan de estudios",
  "semestre": "semestre académico",
  "reingreso": "reingreso académico",
  "cancelacion extemporanea": "cancelación extemporánea",
  "cupo": "cupo universitario"
};

function normalizeColombianText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function getLocaleMetadata() {
  return {
    lang: 'es-CO',
    xmlLang: 'es-CO',
    country: 'Colombia',
    standardFont: 'Arial',
    standardFontSizePt: 11
  };
}

module.exports = {
  normalizeColombianText,
  getLocaleMetadata,
  REGIONAL_TERMS_MAP
};
