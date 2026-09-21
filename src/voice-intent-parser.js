/**
 * Parser de Intenciones Coloquiales en Notas de Voz (PTT Feedback Parser)
 * Extrae directivas editoriales y jurídicas de transcripciones orales.
 */

function parseVoiceFeedback(transcriptText) {
  if (!transcriptText || typeof transcriptText !== 'string') {
    return { hasFeedback: false };
  }

  const raw = transcriptText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const intent = {
    hasFeedback: true,
    wantsShorten: false,
    wantsDeclinicalize: false,
    wantsRemorseOrHumanTouch: false,
    wantsUnconditionedStatus: false,
    rawTranscript: transcriptText
  };

  // 1. Reducción y acotamiento (regla de 3 páginas)
  if (raw.includes('tres hojitas') || raw.includes('tres paginas') || raw.includes('mas corto') ||
      raw.includes('acotar') || raw.includes('acotadito') || raw.includes('muy tosco') || raw.includes('mas digerible')) {
    intent.wantsShorten = true;
  }

  // 2. Despatologización (quitar "clínico")
  if (raw.includes('clinico') || raw.includes('palabras de tratamiento clinico') ||
      raw.includes('solo psicologico') || raw.includes('no tan medico')) {
    intent.wantsDeclinicalize = true;
  }

  // 3. Arrepentimiento y toque humano
  if (raw.includes('arrepentimiento') || raw.includes('por los laditos') ||
      raw.includes('mas humano') || raw.includes('hecho con ia') || raw.includes('se nota')) {
    intent.wantsRemorseOrHumanTouch = true;
  }

  // 4. Descondicionamiento (evitar que parezca que no va a estudiar)
  if (raw.includes('condiciona') || raw.includes('no voy a estudiar') ||
      raw.includes('mientras yo me alivio') || raw.includes('tercera peticion')) {
    intent.wantsUnconditionedStatus = true;
  }

  return intent;
}

module.exports = {
  parseVoiceFeedback
};
