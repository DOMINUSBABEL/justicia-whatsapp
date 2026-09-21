/**
 * Generador Nativo de Documentos DOCX con Configuración de Idioma es-CO
 * Previene subrayados ortográficos rojos en Microsoft Word y estandariza tipografía legal.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const GENERATED_FOLDER = path.join(__dirname, '..', 'generated_docs');
if (!fs.existsSync(GENERATED_FOLDER)) fs.mkdirSync(GENERATED_FOLDER, { recursive: true });

function generateAcademicDocx(caseData) {
  return new Promise((resolve, reject) => {
    const cleanCedula = (caseData.cedula || '12345678').replace(/\D/g, '');
    const outName = `Solicitud_Cancelacion_${cleanCedula}_${Date.now()}.docx`;
    const outPath = path.join(GENERATED_FOLDER, outName);

    const script = `
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

doc = docx.Document()
styles_element = doc.styles.element
doc_defaults = styles_element.find(qn('w:docDefaults'))
if doc_defaults is not None:
    rpr_default = doc_defaults.find(qn('w:rPrDefault'))
    if rpr_default is not None:
        rpr = rpr_default.find(qn('w:rPr'))
        if rpr is None:
            rpr = OxmlElement('w:rPr')
            rpr_default.append(rpr)
        lang = parse_xml(f'<w:lang {nsdecls("w")} w:val="es-CO" w:eastAsia="es-CO" w:bidi="ar-SA"/>')
        rpr.append(lang)

for s in doc.sections:
    s.top_margin = Inches(1.0)
    s.bottom_margin = Inches(1.0)
    s.left_margin = Inches(1.15)
    s.right_margin = Inches(1.0)

normal_style = doc.styles['Normal']
normal_style.font.name = 'Arial'
normal_style.font.size = Pt(11)
normal_style.font.color.rgb = RGBColor(0x22, 0x22, 0x22)
normal_style.paragraph_format.line_spacing = 1.15
normal_style.paragraph_format.space_after = Pt(6)

p_date = doc.add_paragraph("Medellín, Antioquia, 18 de septiembre de 2026")
p_date.paragraph_format.space_after = Pt(14)

p_dest = doc.add_paragraph()
r = p_dest.add_run("Señores\nHONORABLE CONSEJO DE FACULTAD\nFacultad de Derecho y Ciencias Políticas\nUniversidad de Antioquia - UdeA")
r.bold = True

doc.save(r"${outPath.replace(/\\/g, '\\\\')}")
print("SUCCESS")
`;

    const py = spawn('python', ['-c', script]);
    py.stdout.on('data', () => {});
    py.stderr.on('data', (err) => console.error('DOCX Generator Warning:', err.toString()));
    py.on('close', (code) => {
      if (code === 0 && fs.existsSync(outPath)) {
        resolve(outPath);
      } else {
        reject(new Error(`Fallo generando DOCX (código ${code})`));
      }
    });
  });
}

module.exports = {
  generateAcademicDocx
};
