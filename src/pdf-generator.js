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
      doc.fontSize(9).font('Helvetica').text('RAMA JUDICIAL DEL PODER PÚBLICO / JURISDICCIÓN CONSTITUCIONAL Y CONTENCIOSA', { align: 'center' });
      doc.text('ECOSISTEMA LEGALTECH COMUNITARIO — AGENDA ANTIOQUIA 2040 | CÁTEDRA G8', { align: 'center' });
      doc.moveDown(1.5);

      // Despacho Destinatario
      doc.fontSize(11).font('Helvetica-Bold').text('SEÑOR(A):');
      if (cat.startsWith('TUTELA')) {
        doc.text(`JUEZ CONSTITUCIONAL DE REPARTO / JUZGADO PROMISCUO MUNICIPAL`);
        doc.fontSize(10).font('Helvetica').text(`Municipio de ${caseData.municipio}, Departamento de Antioquia.`);
        doc.fontSize(9).font('Helvetica-Oblique').text(`Buzón de Radicación Judicial: ${caseData.emailJuzgado || 'Buzón de Reparto Municipal'}`);
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
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: ACCIÓN DE TUTELA CON SOLICITUD DE MEDIDAS PROVISIONALES Y DECRETO DE PRUEBAS DE OFICIO (Decreto 2591 de 1991)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACCIONANTE: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACCIONADO: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
        doc.fontSize(10).font('Helvetica-Bold').text(`DERECHOS VULNERADOS: `, { continued: true }).font('Helvetica').text(`Salud, Vida Digna, Mínimo Vital e Integridad Personal (Arts. 11, 48, 49 y 86 C.P.).`);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: DEMANDA EN EJERCICIO DEL MEDIO DE CONTROL DE NULIDAD Y RESTABLECIMIENTO DEL DERECHO (Art. 138 CPACA - Ley 1437/11)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`DEMANDANTE: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`DEMANDADO: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACTO DEMANDADO: `, { continued: true }).font('Helvetica').text(`Acto Administrativo / Resolución No. ${caseData.actoAdministrativoNumero || '[Por individualizar en traslado]'}`);
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: PETICIÓN DE HÁBEAS DATA FINANCIERO Y CADUCIDAD DE REPORTE NEGATIVO (Ley 1266 de 2008 & Ley 2157 de 2021)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`PETICIONARIO: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ENTIDAD FUENTE / OPERADOR: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      } else if (cat === 'RECURSO_ADMINISTRATIVO') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: RECURSO DE REPOSICIÓN Y EN SUBSIDIO DE APELACIÓN EN VÍA ADMINISTRATIVA (Arts. 74 y 76 CPACA)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`RECURRENTE: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ACTO RECURRIDO: `, { continued: true }).font('Helvetica').text(`Resolución / Oficio No. ${caseData.actoAdministrativoNumero || '[Radicado]'}`);
      } else {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: DERECHO DE PETICIÓN DE INFORMACIÓN Y COPIA DE EXPEDIENTE / RECLAMACIÓN FORMAL (Art. 23 C.P. y Ley 1755 de 2015)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text(`PETICIONARIO: `, { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text(`ENTIDAD DESTINATARIA: `, { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      }

      doc.moveDown(1.2);

      // Declaración del Solicitante
      doc.fontSize(10).font('Helvetica').text(
        `Yo, ${caseData.nombre.toUpperCase()}, mayor de edad, identificado(a) con cédula de ciudadanía No. ${caseData.cedula}, domiciliado(a) y residente en el Municipio de ${caseData.municipio} (Antioquia), acudo de manera respetuosa ante su Despacho / Entidad para formular la presente acción, fundamentada en la siguiente teoría fáctica y jurídica:`
      );
      doc.moveDown(1);

      // I. HECHOS
      doc.fontSize(11).font('Helvetica-Bold').text('I. HECHOS Y ANTECEDENTES RELEVANTES');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);

      doc.text(`1. El/la accionante reside en el Municipio de ${caseData.municipio}, departamento de Antioquia, encontrándose en situación de especial protección y vulnerabilidad territorial.`);
      doc.moveDown(0.4);
      doc.text(`2. Relato fáctico circunstanciado: "${caseData.descripcionHechos}".`);
      doc.moveDown(0.4);
      doc.text(`3. La entidad ${caseData.entidadAccionada} ha incurrido en omisión injustificada, negación de servicios o dilaciones indebidas que vulneran mis derechos fundamentales.`);
      doc.moveDown(0.4);
      doc.text(`4. Configuración de Inmediatez y Subsidiariedad: La omisión continúa desplegando efectos lesivos en la actualidad y no existe otro medio de defensa judicial eficaz y expedito para conjurar el perjuicio.`);
      doc.moveDown(1);

      // II. MEDIDAS PROVISIONALES
      if (cat.startsWith('TUTELA')) {
        doc.fontSize(11).font('Helvetica-Bold').text('II. SOLICITUD DE MEDIDAS PROVISIONALES URGENTES (Art. 7 Dec. 2591/91)');
        doc.fontSize(9.5).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(
          `Conforme al Artículo 7 del Decreto 2591 de 1991, solicito a su Despacho ORDENAR COMO MEDIDA PROVISIONAL INMEDIATA a ${caseData.entidadAccionada} que, en un término perentorio no superior a 48 HORAS, garantice el servicio de salud, entrega de medicamentos requeridos o autorización del procedimiento médico para evitar el agravamiento irreversible de mi integridad física.`
        );
        doc.moveDown(1);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.fontSize(11).font('Helvetica-Bold').text('II. SOLICITUD DE MEDIDA CAUTELAR DE SUSPENSIÓN PROVISIONAL');
        doc.fontSize(9.5).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(
          `De conformidad con el Artículo 229 del CPACA (Ley 1437/11), solicito decretar la SUSPENSIÓN PROVISIONAL de los efectos jurídicos del acto demandado por manifiesta infracción de disposiciones superiores.`
        );
        doc.moveDown(1);
      }

      // III. FUNDAMENTOS DE DERECHO
      doc.fontSize(11).font('Helvetica-Bold').text('III. FUNDAMENTOS DE DERECHO Y PRECEDENTE JURISPRUDENCIAL');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      if (cat.startsWith('TUTELA')) {
        doc.text('• Sentencia T-760 de 2008 (Principio de Integralidad y Continuidad en el Servicio de Salud - Corte Constitucional).');
        doc.text('• Sentencia T-546 de 2009 y T-028 de 2014 (Mínimo Vital y Protección Reforzada en Territorios Rurales).');
        doc.text('• Sentencia SU-092 de 2021 (Debido Proceso Administrativo y Prohibición de Barreras Dilatorias).');
        doc.text('• Artículos 1, 11, 13, 23, 48, 49 y 86 de la Constitución Política de Colombia.');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text('• Artículos 137, 138, 161, 164, 229 y 231 del CPACA (Ley 1437 de 2011 reformado por Ley 2080 de 2021).');
        doc.text('• Artículo 29 de la Constitución Política (Debido Proceso Administrativo).');
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.text('• Ley Estatutaria 1266 de 2008 y Ley 2157 de 2021 (Borrón y Cuenta Nueva).');
        doc.text('• Sentencias C-1011 de 2008 y C-282 de 2021 de la Corte Constitucional.');
      } else {
        doc.text('• Artículo 23 de la Constitución Política de Colombia.');
        doc.text('• Ley Estatutaria 1755 de 2015 (Regulación Integral del Derecho Fundamental de Petición).');
      }
      doc.moveDown(1);

      // IV. CAPÍTULO ESPECIAL: SOLICITUD DE PRUEBAS DE OFICIO E INVERSIÓN DE LA CARGA DE LA PRUEBA
      doc.fontSize(11).font('Helvetica-Bold').text('IV. SOLICITUD DE PRUEBAS DE OFICIO E INVERSIÓN DE LA CARGA PROBATORIA');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(
        `Habida cuenta de la asimetría material e indefensión del ciudadano frente a la entidad accionada (quien custodia los archivos, historias clínicas y sistemas informáticos), solicito respetuosamente al Juez / Autoridad:\n` +
        `1. OFICIAR a ${caseData.entidadAccionada} para que, dentro del informe de contestación, remita copia íntegra de los antecedentes médicos y administrativos del caso (Arts. 19 y 21 Dec. 2591/91).\n` +
        `2. APLICAR la Inversión de la Carga de la Prueba (Corte Constitucional T-760/08), teniendo como veraces los hechos fácticos expuestos si la entidad requerida no desvirtúa documentalmente lo denunciado.`
      );
      doc.moveDown(1);

      // V. PRETENSIONES
      doc.fontSize(11).font('Helvetica-Bold').text('V. PRETENSIONES');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      if (cat.startsWith('TUTELA')) {
        doc.text('PRIMERA: Tutelar y amparar mis derechos fundamentales a la Salud, Vida Digna e Integridad Personal.');
        doc.moveDown(0.3);
        doc.text(`SEGUNDA: Ordenar a ${caseData.entidadAccionada} que en un término no superior a 48 horas suministre integralmente los medicamentos, procedimientos o citas requeridas.`);
        doc.moveDown(0.3);
        doc.text('TERCERA: Ordenar el Tratamiento Integral con el fin de evitar la interposición sistemática de nuevas acciones judiciales.');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text(`PRIMERA: Declarar la NULIDAD del acto administrativo No. ${caseData.actoAdministrativoNumero || '[Resolución]'}, expedido por ${caseData.entidadAccionada}.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: A título de RESTABLECIMIENTO DEL DERECHO, ordenar el reintegro o satisfacción patrimonial plena del derecho desconocido.');
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.text(`PRIMERA: Ordenar la ELIMINACIÓN INMEDIATA del reporte negativo caducado en centrales de riesgo.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Actualizar el historial crediticio a estado normalizado sin costo para el titular.');
      } else {
        doc.text(`PRIMERA: Responder de fondo, de manera clara, precisa y de fondo la solicitud radicada.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Remitir copia de la respuesta al correo electrónico y canal de contacto registrado.');
      }
      doc.moveDown(1);

      // VI. PRUEBAS Y ANEXOS
      doc.fontSize(11).font('Helvetica-Bold').text('VI. PRUEBAS Y ANEXOS');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text('1. Fotocopia de la Cédula de Ciudadanía del accionante/peticionario.');
      doc.text('2. Evidencias fácticas, recibos, órdenes médicas y capturas de pantalla aportadas al expediente.');
      doc.moveDown(1);

      // VII. NOTIFICACIONES
      doc.fontSize(11).font('Helvetica-Bold').text('VII. NOTIFICACIONES Y DIRECCIONES');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(`• Domicilio del Accionante: Municipio de ${caseData.municipio}, Antioquia.`);
      doc.text(`• Canal Digital de Notificaciones: WhatsApp Asistido JusticIA Antioquia 2040.`);
      doc.text(`• Buzón Electrónico de la Entidad Accionada: ${caseData.emailPersoneria || 'Atención al Usuario / Secretaría Jurídica'}.`);
      doc.moveDown(2);

      // Firma
      doc.fontSize(10).font('Helvetica-Bold').text('_____________________________________________');
      doc.text(`${caseData.nombre.toUpperCase()}`);
      doc.fontSize(9).font('Helvetica').text(`C.C. No. ${caseData.cedula}`);
      doc.text(`Municipio de ${caseData.municipio}, Antioquia`);
      doc.moveDown(1);
      doc.fontSize(8).font('Helvetica-Oblique').text('Minuta formal compilada mediante el Harness Constitucional JusticIA — Agenda Antioquia 2040 / Cátedra G8 (EAFIT, UPB, UdeA, Unilasallista)', { align: 'center' });

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
