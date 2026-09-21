/**
 * Flujo de Revisión Previa al Envío (Pre-Submission Review Card)
 * Presenta un resumen estructurado para feedback rápido por WhatsApp (texto o nota de voz).
 */

function buildDraftReviewCard(docSummary) {
  return (
    `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
    `  📝 *BORRADOR LISTO PARA REVISIÓN*\n` +
    `  ⚖️ _JusticIA WhatsApp — Litigio Educativo_\n` +
    `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
    `Hemos estructurado su solicitud bajo la regla de *3 páginas* y enfoque no patologizante:\n\n` +
    `👤 *Solicitante:* ${docSummary.nombre} (${docSummary.cedula})\n` +
    `🏛️ *Destinatario:* ${docSummary.autoridad}\n` +
    `📚 *Asignaturas a cancelar:* ${docSummary.asignaturas.join(', ')}\n` +
    `✨ *Tono:* Humano, con reconocimiento sincero de dificultades y vocación de permanencia.\n\n` +
    `👉 *Opciones de respuesta:*\n` +
    `1️⃣ Responda *1* o *Aprobar* para generar los archivos definitivos (.docx y .pdf).\n` +
    `2️⃣ Si desea cambios, envíe un *mensaje o nota de voz* (ej: "acórtalo a dos páginas", "ajusta las materias", "quítale lo clínico").`
  );
}

module.exports = {
  buildDraftReviewCard
};
