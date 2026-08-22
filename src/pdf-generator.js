const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const GENERATED_FOLDER = path.join(__dirname, '..', 'generated_docs');
if (!fs.existsSync(GENERATED_FOLDER)) fs.mkdirSync(GENERATED_FOLDER, { recursive: true });

function generateLegalPDF(caseData) {
  return new Promise((resolve, reject) => {
    try {
      const cat = caseData.categoriaAccion || 'TUTELA_SALUD';
      const cleanCedula = caseData.cedula || '12345678';
      const munSlug = (caseData.municipio || 'Antioquia').replace(/\s+/g, '');
      const prefix = cat.split('_')[0];
      const fileName = `${prefix}_${munSlug}_${cleanCedula}_${Date.now()}.pdf`;
      const filePath = path.join(GENERATED_FOLDER, fileName);

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 85, right: 72 }
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Cabecera Institucional
      doc.fontSize(10).font('Helvetica-Bold').text('REPÚBLICA DE COLOMBIA', { align: 'center' });
      doc.fontSize(9).font('Helvetica').text('RAMA JUDICIAL DEL PODER PÚBLICO / JURISDICCIÓN DE LO CONTENCIOSO ADMINISTRATIVO', { align: 'center' });
      doc.text('ECOSISTEMA LEGALTECH COMUNITARIO — AGENDA ANTIOQUIA 2040 | CÁTEDRA G8', { align: 'center' });
      doc.moveDown(1.5);

      // Despacho Destinatario
      doc.fontSize(11).font('Helvetica-Bold').text('SEÑOR(A):');
      if (cat.startsWith('TUTELA')) {
        doc.text(`JUEZ CONSTITUCIONAL DE REPARTO / JUZGADO PROMISCUO MUNICIPAL`);
        doc.fontSize(10).font('Helvetica').text(`Municipio de ${caseData.municipio}, Departamento de Antioquia.`);
        doc.fontSize(9).font('Helvetica-Oblique').text(`Buzón de Radicación: ${caseData.emailJuzgado || 'Buzón de Reparto Municipal'}`);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text(`JUEZ ADMINISTRATIVO DEL CIRCUITO JUDICIAL DE ANTIOQUIA (EN REPARTO)`);
        doc.fontSize(10).font('Helvetica').text(`Circuito correspondiente al Municipio de ${caseData.municipio}, Antioquia.`);
        doc.fontSize(9).font('Helvetica-Oblique').text(`Buzón de Radicación: ${caseData.emailJuzgado}`);
      } else if (cat === 'RECURSO_ADMINISTRATIVO') {
        doc.text(`REPRESENTANTE LEGAL / JEFE DE LA OFICINA JURÍDICA`);
        doc.fontSize(10).font('Helvetica').text(`${caseData.entidadAccionada}`);
      } else {
        doc.text(`REPRESENTANTE LEGAL / ATENCIÓN AL CIUDADANO`);
        doc.fontSize(10).font('Helvetica').text(`${caseData.entidadAccionada}`);
      }
      doc.moveDown(1.2);

      // Referencia del Trámite
      if (cat.startsWith('TUTELA')) {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: ACCIÓN DE TUTELA CON SOLICITUD DE MEDIDAS PROVISIONALES URGENTES (Art. 7 Decreto 2591 de 1991)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACCIONANTE: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACCIONADO: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
        doc.fontSize(10).font('Helvetica-Bold').text(`DERECHOS VULNERADOS: `, { continued: true }).font('Helvetica').text(`Salud, Vida Digna, Mínimo Vital e Integridad Personal (Arts. 11, 48, 49 y 86 C.P.).`);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: DEMANDA EN EJERCICIO DEL MEDIO DE CONTROL DE NULIDAD Y RESTABLECIMIENTO DEL DERECHO (Art. 138 CPACA - Ley 1437/11)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`DEMANDANTE: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`DEMANDADO: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACTO DEMANDADO: `, { continued: true }).font('Helvetica').text(`Acto Administrativo / Resolución / Decreto No. ${caseData.actoAdministrativoNumero || '[Por especificar]'}`);
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: PETICIÓN DE HÁBEAS DATA FINANCIERO Y CADUCIDAD DE REPORTE NEGATIVO (Ley 1266 de 2008 & Ley 2157 de 2021 "Borrón y Cuenta Nueva")', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`PETICIONARIO: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ENTIDAD FUENTE / OPERADOR: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      } else if (cat === 'RECURSO_ADMINISTRATIVO') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: RECURSO DE REPOSICIÓN Y EN SUBSIDIO DE APELACIÓN EN VÍA ADMINISTRATIVA (Arts. 74, 76 y ss. CPACA - Ley 1437/11)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`RECURRENTE: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACTO RECURRIDO: `, { continued: true }).font('Helvetica').text(`Resolución / Oficio No. ${caseData.actoAdministrativoNumero || '[Radicado de Acto]'}`);
      } else {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: DERECHO DE PETICIÓN EN INTERÉS PARTICULAR (Art. 23 C.P. y Ley 1755 de 2015)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`PETICIONARIO: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ENTIDAD: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      }

      doc.moveDown(1.2);

      // Declaración del Solicitante
      doc.fontSize(10).font('Helvetica').text(
        `Yo, ${caseData.nombre.toUpperCase()}, mayor de edad, identificado(a) con cédula de ciudadanía No. ${caseData.cedula}, domiciliado(a) y residente en el Municipio de ${caseData.municipio} (Antioquia), acudo de manera formal y respetuosa a interponer la presente solicitud, fundamentada en los siguientes:`
      );
      doc.moveDown(1);

      // I. HECHOS
      doc.fontSize(11).font('Helvetica-Bold').text('I. HECHOS Y ANTECEDENTES RELEVANTES');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);

      doc.text(`1. El/la accionante se encuentra domiciliado(a) en la ruralidad/cabecera del Municipio de ${caseData.municipio}, departamento de Antioquia.`);
      doc.moveDown(0.4);
      doc.text(`2. Motivo fáctico concreto: "${caseData.descripcionHechos}".`);
      doc.moveDown(0.4);
      doc.text(`3. La entidad ${caseData.entidadAccionada} ha omitido dar respuesta oportuna, ha impuesto barreras injustificadas o ha proferido un acto lesivo de mis derechos garantizados por la Constitución y la Ley.`);
      doc.moveDown(0.4);
      doc.text(`4. Debido a las condiciones territoriales del Municipio de ${caseData.municipio}, la vulnerabilidad se agrava, exigiendo la intervención célere de las autoridades correspondientes.`);
      doc.moveDown(1);

      // II. MEDIDAS PROVISIONALES / CAUTELARES
      if (cat.startsWith('TUTELA')) {
        doc.fontSize(11).font('Helvetica-Bold').text('II. SOLICITUD DE MEDIDAS PROVISIONALES / CAUTELARES URGENTES');
        doc.fontSize(9.5).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(
          `Con base en el Artículo 7 del Decreto 2591 de 1991, solicito muy respetuosamente a su Despacho ordenar como MEDIDA PROVISIONAL INMEDIATA a ${caseData.entidadAccionada} que, en un término perentorio no superior a 48 HORAS, proceda a garantizar el servicio de salud, entrega de medicamentos y/o insumos vitales para prevenir el agravamiento irreversible de mi estado de salud.`
        );
        doc.moveDown(1);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.fontSize(11).font('Helvetica-Bold').text('II. SOLICITUD DE MEDIDA CAUTELAR DE SUSPENSIÓN PROVISIONAL');
        doc.fontSize(9.5).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(
          `De conformidad con el Artículo 229 y 231 del CPACA (Ley 1437 de 2011), se solicita la SUSPENSIÓN PROVISIONAL DE LOS EFECTOS JURÍDICOS del acto administrativo demandado, por configurarse una manifiesta transgresión de normas superiores y riesgo de perjuicio irremediable patrimonial.`
        );
        doc.moveDown(1);
      }

      // III. FUNDAMENTOS DE DERECHO
      doc.fontSize(11).font('Helvetica-Bold').text('III. FUNDAMENTOS DE DERECHO Y PRECEDENTE JUDICIAL');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      if (cat.startsWith('TUTELA')) {
        doc.text('• Sentencia T-760 de 2008 (Principio de Integralidad y Continuidad en Salud - Corte Constitucional).');
        doc.text('• Sentencia T-546 de 2009 (Mínimo Vital de Agua Potable y Protección Rural).');
        doc.text('• Sentencia SU-092 de 2021 (Debido Proceso Administrativo y Silencio Injustificado).');
        doc.text('• Artículos 1, 11, 23, 48, 49 y 86 de la Constitución Política de Colombia.');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text('• Artículos 137, 138, 161, 164, 229 y 231 del Código de Procedimiento Administrativo y de lo Contencioso Administrativo (CPACA - Ley 1437 de 2011 reformado por Ley 2080 de 2021).');
        doc.text('• Artículo 29 y 209 de la Constitución Política (Debido Proceso y Principios de la Función Administrativa).');
        doc.text('• Jurisprudencia unificada del Consejo de Estado sobre Falsa Motivación y Desviación de Poder.');
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.text('• Ley Estatutaria 1266 de 2008 (Régimen de Habeas Data Financiero).');
        doc.text('• Ley 2157 de 2021 (Ley de Borrón y Cuenta Nueva - Régimen de Transición y Caducidad Máxima del Dato Negativo).');
        doc.text('• Sentencias C-1011 de 2008 y C-282 de 2021 de la Corte Constitucional.');
      } else {
        doc.text('• Artículo 23 de la Constitución Política de Colombia.');
        doc.text('• Ley Estatutaria 1755 de 2015 (Regulación Integral del Derecho Fundamental de Petición).');
        doc.text('• Código de Procedimiento Administrativo y de lo Contencioso Administrativo (CPACA).');
      }
      doc.moveDown(1);

      // IV. PRETENSIONES
      doc.fontSize(11).font('Helvetica-Bold').text('IV. PRETENSIONES');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      if (cat.startsWith('TUTELA')) {
        doc.text('PRIMERA: Tutelar y amparar mis derechos fundamentales a la Salud, Vida Digna y Mínimo Vital.');
        doc.moveDown(0.3);
        doc.text(`SEGUNDA: Ordenar a ${caseData.entidadAccionada} que en el término de 48 horas autorice, suministre y entregue integralmente lo requerido.`);
        doc.moveDown(0.3);
        doc.text('TERCERA: Ordenar el tratamiento integral preventivo para garantizar la continuidad médica.');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text(`PRIMERA: Declarar la NULIDAD del acto administrativo No. ${caseData.actoAdministrativoNumero || '[Resolución/Decreto]'}, proferido por ${caseData.entidadAccionada}.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: A título de RESTABLECIMIENTO DEL DERECHO, ordenar el reintegro, pago de sumas adeudadas o reconocimiento pleno del derecho subjetivo conculcado.');
        doc.moveDown(0.3);
        doc.text('TERCERA: Ordenar la actualización de sumas e intereses moratorios de conformidad con el Art. 187 del CPACA.');
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.text(`PRIMERA: Ordenar a ${caseData.entidadAccionada} y a los operadores de bases de datos (Datacrédito, TransUnion/CIFIN) la ELIMINACIÓN INMEDIATA del reporte negativo.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Actualizar mi historial crediticio al estado "Al Día / Normalizado" de conformidad con la Ley 2157 de 2021.');
      } else {
        doc.text(`PRIMERA: Dar respuesta de fondo, clara, precisa y congruente a la presente solicitud dentro del término legal estricto.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Remitir copia de la respuesta al correo electrónico / canal de contacto informado.');
      }
      doc.moveDown(1);

      // V. PRUEBAS Y ANEXOS
      doc.fontSize(11).font('Helvetica-Bold').text('V. PRUEBAS Y ANEXOS');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text('1. Fotocopia de la Cédula de Ciudadanía del accionante/peticionario.');
      doc.text('2. Copia de las fórmulas médicas, comprobantes, actos administrativos o solicitudes previas aportadas.');
      doc.moveDown(1);

      // VI. NOTIFICACIONES Y JURAMENTO
      doc.fontSize(11).font('Helvetica-Bold').text('VI. NOTIFICACIONES Y MANIFESTACIÓN');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(`• Domicilio: Municipio de ${caseData.municipio}, Antioquia.`);
      doc.text(`• Notificaciones electrónicas / WhatsApp: Canal asistido JusticIA Antioquia 2040.`);
      doc.moveDown(2);

      // Firma
      doc.fontSize(10).font('Helvetica-Bold').text('_____________________________________________');
      doc.text(`${caseData.nombre.toUpperCase()}`);
      doc.fontSize(9).font('Helvetica').text(`C.C. No. ${caseData.cedula}`);
      doc.text(`Municipio de ${caseData.municipio}, Antioquia`);
      doc.moveDown(1);
      doc.fontSize(8).font('Helvetica-Oblique').text('Documento compilado mediante el Harness Constitucional JusticIA — Agenda Antioquia 2040 / Cátedra G8 (EAFIT, UPB, UdeA, Unilasallista)', { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateLegalPDF };
