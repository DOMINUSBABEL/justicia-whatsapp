/**
 * Exportador Dual (DOCX para Edición Ciudadana y PDF para Radicación Inmediata)
 */

const { generateLegalPDF } = require('./pdf-generator');
const { generateAcademicDocx } = require('./docx-generator');

async function exportDualLegalDocs(caseData) {
  const [pdfPath, docxPath] = await Promise.all([
    generateLegalPDF(caseData),
    generateAcademicDocx(caseData)
  ]);

  return {
    pdfPath,
    docxPath,
    generatedAt: Date.now()
  };
}

module.exports = {
  exportDualLegalDocs
};
