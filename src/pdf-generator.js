let PDFDocument = null;
try {
  PDFDocument = require('pdfkit');
} catch {
  PDFDocument = null;
}
const fs = require('fs');
const path = require('path');

const GENERATED_FOLDER = path.join(__dirname, '..', 'generated_docs');
if (!fs.existsSync(GENERATED_FOLDER)) fs.mkdirSync(GENERATED_FOLDER, { recursive: true });

function buildFallbackPdfBuffer(title, bodyLines) {
  const safeText = [title, '', ...bodyLines]
    .join('\n')
    .replace(/[()\\]/g, '')
    .slice(0, 3500);
  const contentStream = `BT /F1 10 Tf 50 740 Td 14 TL (${safeText.split('\n').join(') Tj T* (')}) Tj ET`;
  const pdf = [
    '%PDF-1.4',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${contentStream.length} >> stream\n${contentStream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    'trailer << /Root 1 0 R >>',
    '%%EOF'
  ].join('\n');
  return Buffer.from(pdf, 'utf8');
}

function generateLegalPDF(caseData) {
  return new Promise((resolve, reject) => {
    try {
      const cat = caseData.categoriaAccion || 'TUTELA_SALUD';
      const cleanCedula = caseData.cedula || '12345678';
      const munSlug = (caseData.municipio || 'Antioquia').replace(/\s+/g, '');
      const prefix = cat.split('_')[0];
      const fileName = `${prefix}_${munSlug}_${cleanCedula}_${Date.now()}.pdf`;
      const filePath = path.join(GENERATED_FOLDER, fileName);

      if (!PDFDocument) {
        const buf = buildFallbackPdfBuffer(
          `REPUBLICA DE COLOMBIA - EXPEDIENTE ${cat}`,
          [
            `Accionante: ${caseData.nombre || 'Ciudadano'} (CC ${cleanCedula})`,
            `Municipio: ${caseData.municipio || 'Medellin'} (${caseData.subregion || 'Antioquia'})`,
            `Entidad Accionada: ${caseData.entidadAccionada || 'Entidad Competente'}`,
            `Hechos Curados: ${caseData.descripcionHechos || ''}`
          ]
        );
        fs.writeFileSync(filePath, buf);
        return resolve({ filePath, fileName });
      }

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
      if (cat.startsWith('TUTELA') || cat === 'ESTABILIDAD_LABORAL_MINIMO_VITAL') {
        doc.text('JUEZ CONSTITUCIONAL DE REPARTO / JUZGADO PROMISCUO MUNICIPAL');
        doc.fontSize(10).font('Helvetica').text(`Municipio de ${caseData.municipio || 'Medellín'}, Departamento de Antioquia.`);
        doc.fontSize(9).font('Helvetica-Oblique').text(`Buzón de Radicación Judicial: ${caseData.emailJuzgado || 'recepcionmemoriales@cendoj.ramajudicial.gov.co'}`);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text('JUEZ ADMINISTRATIVO DEL CIRCUITO JUDICIAL DE ANTIOQUIA (EN REPARTO)');
        doc.fontSize(10).font('Helvetica').text(`Circuito correspondiente al Municipio de ${caseData.municipio || 'Medellín'}, Antioquia.`);
        doc.fontSize(9).font('Helvetica-Oblique').text(`Buzón de Radicación: ${caseData.emailJuzgado || 'recepcionmemoriales@cendoj.ramajudicial.gov.co'}`);
      } else if (cat === 'CANCELACION_ACADEMICA_SALUD') {
        doc.text('HONORABLE CONSEJO DE FACULTAD / COMITÉ DE ASUNTOS ESTUDIANTILES');
        doc.fontSize(10).font('Helvetica').text(`${caseData.entidadAccionada || 'Facultad de Derecho y Ciencias Políticas - Universidad de Antioquia'}`);
      } else if (cat === 'PROTECCION_CAMPESINADO_TIERRAS') {
        doc.text('AGENCIA NACIONAL DE TIERRAS (ANT) / JUEZ CONSTITUCIONAL Y AGRARIO DE REPARTO');
        doc.fontSize(10).font('Helvetica').text(`Jurisdicción del Municipio de ${caseData.municipio || 'Antioquia'}, Subregión ${caseData.subregion || 'Antioquia'}.`);
      } else if (cat === 'RECURSO_ADMINISTRATIVO') {
        doc.text('REPRESENTANTE LEGAL / JEFE DE LA OFICINA JURÍDICA');
        doc.fontSize(10).font('Helvetica').text(`${caseData.entidadAccionada}`);
      } else {
        doc.text('REPRESENTANTE LEGAL / OFICINA DE ATENCIÓN AL CIUDADANO');
        doc.fontSize(10).font('Helvetica').text(`${caseData.entidadAccionada || 'Entidad Competente'}`);
      }
      doc.moveDown(1.2);

      // Referencia del Trámite
      if (cat.startsWith('TUTELA') || cat === 'ESTABILIDAD_LABORAL_MINIMO_VITAL') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: ACCIÓN DE TUTELA CON SOLICITUD DE MEDIDAS PROVISIONALES Y DECRETO DE PRUEBAS DE OFICIO (Decreto 2591 de 1991)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('ACCIONANTE: ', { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text('ACCIONADO: ', { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
        doc.fontSize(10).font('Helvetica-Bold').text('DERECHOS VULNERADOS: ', { continued: true }).font('Helvetica').text('Salud, Vida Digna, Mínimo Vital, Agua Potable, Estabilidad Ocupacional e Integridad Personal (Arts. 11, 23, 48, 49, 53 y 86 C.P.).');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: MEDIO DE CONTROL DE NULIDAD Y RESTABLECIMIENTO DEL DERECHO / REVOCATORIA DIRECTA (Arts. 93 y 138 CPACA - Ley 1437/11)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('DEMANDANTE: ', { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text('DEMANDADO: ', { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
        doc.fontSize(10).font('Helvetica-Bold').text('ACTO CUESTIONADO: ', { continued: true }).font('Helvetica').text(`Acto Administrativo / Resolución No. ${caseData.actoAdministrativoNumero || '[Individualizado en traslado]'}`);
      } else if (cat === 'CANCELACION_ACADEMICA_SALUD') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: SOLICITUD DE CANCELACIÓN EXTEMPORÁNEA DE ASIGNATURAS Y PROTECCIÓN DE PERMANENCIA UNIVERSITARIA POR FUERZA MAYOR EN SALUD', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('SOLICITANTE: ', { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text('PROGRAMA: ', { continued: true }).font('Helvetica').text(`${caseData.programa || 'Pregrado Universitario'} (Estudiante Activo Regular)`);
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: RECLAMACIÓN CONSTITUCIONAL DE HÁBEAS DATA FINANCIERO, OMISIÓN DE PREAVISO DE 20 DÍAS Y CADUCIDAD (Ley 1266 de 2008 & Ley 2157 de 2021)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('TITULAR DEL DATO: ', { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text('ENTIDAD FUENTE / OPERADOR: ', { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      } else if (cat === 'PROTECCION_CAMPESINADO_TIERRAS') {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: ACCIÓN Y PETICIÓN ESPECIAL AGRARIA DE PROTECCIÓN AL CAMPESINADO Y TERRITORIO (Art. 64 C.P. - Acto Legislativo 01 de 2023)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('ACCIONANTE RURAL: ', { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text('AUTORIDAD REQUERIDA: ', { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      } else {
        doc.fontSize(11).font('Helvetica-Bold').text('REFERENCIA: DERECHO DE PETICIÓN CONSTITUCIONAL EN INTERÉS PARTICULAR Y DE INFORMACIÓN (Art. 23 C.P. y Ley 1755 de 2015)', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Bold').text('PETICIONARIO: ', { continued: true }).font('Helvetica').text(`${caseData.nombre} (C.C. No. ${caseData.cedula})`);
        doc.fontSize(10).font('Helvetica-Bold').text('ENTIDAD DESTINATARIA: ', { continued: true }).font('Helvetica').text(`${caseData.entidadAccionada}`);
      }

      doc.moveDown(1.2);

      // Declaración del Solicitante
      doc.fontSize(10).font('Helvetica').text(
        `Yo, ${(caseData.nombre || 'CIUDADANO').toUpperCase()}, mayor de edad, identificado(a) con cédula de ciudadanía No. ${caseData.cedula}, domiciliado(a) y residente en el Municipio de ${caseData.municipio || 'Medellín'} (Antioquia), acudo de manera respetuosa ante su Despacho / Entidad para formular la presente acción, fundamentada en la siguiente teoría fáctica y jurídica:`
      );
      doc.moveDown(1);

      // I. HECHOS
      doc.fontSize(11).font('Helvetica-Bold').text('I. HECHOS Y ANTECEDENTES RELEVANTES');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);

      doc.text(`1. El/la suscrito(a) reside en el Municipio de ${caseData.municipio || 'Medellín'}, departamento de Antioquia (${caseData.subregion || 'Valle de Aburrá'}), actuando bajo el amparo del principio constitucional de buena fe (Art. 83 C.P.).`);
      doc.moveDown(0.4);
      doc.text(`2. Relato fáctico circunstanciado y depurado: "${caseData.descripcionHechos}".`);
      doc.moveDown(0.4);
      doc.text(`3. La situación expuesta frente a ${caseData.entidadAccionada} compromete de forma directa y actual el goce efectivo de mis garantías constitucionales fundamentales.`);
      doc.moveDown(0.4);
      doc.text('4. Configuración de Inmediatez y Subsidiariedad: La afectación continúa desplegando efectos en la actualidad y se requiere pronunciamiento oportuno, congruente y de fondo.');
      doc.moveDown(1);

      // II. MEDIDAS PROVISIONALES
      if (cat.startsWith('TUTELA') || cat === 'ESTABILIDAD_LABORAL_MINIMO_VITAL') {
        doc.fontSize(11).font('Helvetica-Bold').text('II. SOLICITUD DE MEDIDAS PROVISIONALES URGENTES (Art. 7 Dec. 2591/91)');
        doc.fontSize(9.5).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(
          `Conforme al Artículo 7 del Decreto 2591 de 1991, solicito a su Despacho ORDENAR COMO MEDIDA PROVISIONAL INMEDIATA a ${caseData.entidadAccionada} que, en un término perentorio no superior a 48 HORAS, garantice la prestación efectiva del derecho vulnerado, evitando la consumación de un perjuicio irremediable.`
        );
        doc.moveDown(1);
      } else if (cat === 'NULIDAD_CPACA') {
        doc.fontSize(11).font('Helvetica-Bold').text('II. SOLICITUD DE MEDIDA CAUTELAR DE SUSPENSIÓN PROVISIONAL');
        doc.fontSize(9.5).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(
          'De conformidad con el Artículo 229 del CPACA (Ley 1437/11), solicito decretar la SUSPENSIÓN PROVISIONAL de los efectos jurídicos del acto administrativo cuestionado por manifiesta infracción de normas superiores.'
        );
        doc.moveDown(1);
      }

      // III. FUNDAMENTOS DE DERECHO
      doc.fontSize(11).font('Helvetica-Bold').text('III. FUNDAMENTOS DE DERECHO Y PRECEDENTE JURISPRUDENCIAL');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      if (cat === 'CANCELACION_ACADEMICA_SALUD') {
        doc.text('• Artículos 13, 26, 49, 67 y 69 de la Constitución Política (Límites Constitucionales a la Autonomía Universitaria).');
        doc.text('• Ley 1616 de 2013 (Ley Nacional de Salud Mental - Garantía de atención preferente y ajustes razonables).');
        doc.text('• Sentencias T-441 de 2012, T-574 de 2017, T-310 de 2021, T-173 de 2023 y T-238 de 2024 de la Corte Constitucional (Deber de flexibilización reglamentaria y exoneración de sanciones o notas reprobatorias ante fuerza mayor en salud mental).');
      } else if (cat === 'TUTELA_AGUA') {
        doc.text('• Artículos 1, 11, 49, 79 y 366 de la Constitución Política y Observación General No. 15 del Comité DESC.');
        doc.text('• Sentencias T-740 de 2011, T-118 de 2018 y T-223 de 2018 (Garantía de mínimo vital de 50 litros diarios de agua potable por persona).');
      } else if (cat === 'ESTABILIDAD_LABORAL_MINIMO_VITAL') {
        doc.text('• Artículos 13, 25, 43, 47 y 53 de la Constitución Política y Artículo 26 de la Ley 361 de 1997.');
        doc.text('• Sentencias SU-049 de 2017, SU-075 de 2018 y T-386 de 2020 de la Corte Constitucional (Estabilidad laboral y ocupacional reforzada).');
      } else if (cat === 'PROTECCION_CAMPESINADO_TIERRAS') {
        doc.text('• Artículo 64 de la Constitución Política modificado por el Acto Legislativo 01 de 2023 (El campesinado como sujeto de derechos y de especial protección constitucional).');
        doc.text('• Decreto Ley 902 de 2017 y Sentencias C-077 de 2017 y T-461 de 2016 de la Corte Constitucional.');
      } else if (cat.startsWith('TUTELA')) {
        doc.text('• Sentencia T-760 de 2008 y SU-508 de 2020 (Principio de Integralidad y Continuidad en el Servicio de Salud - Corte Constitucional).');
        doc.text('• Sentencia T-238 de 2024 y SU-092 de 2021 (Prohibición de barreras administrativas y dilaciones injustificadas).');
        doc.text('• Artículos 1, 11, 13, 23, 48, 49 y 86 de la Constitución Política de Colombia y Ley Estatutaria 1751 de 2015.');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text('• Artículos 93, 137, 138, 161, 164, 229 y 231 del CPACA (Ley 1437 de 2011 reformado por Ley 2080 de 2021).');
        doc.text('• Artículo 29 de la Constitución Política (Debido Proceso Administrativo).');
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.text('• Artículo 15 de la Constitución Política, Ley Estatutaria 1266 de 2008 (Art. 12 - Preaviso obligatorio de 20 días calendario) y Ley 2157 de 2021.');
        doc.text('• Sentencias C-1011 de 2008, T-883 de 2013 y C-282 de 2021 de la Corte Constitucional.');
      } else {
        doc.text('• Artículo 23 de la Constitución Política de Colombia.');
        doc.text('• Ley Estatutaria 1755 de 2015 y Sentencias C-951 de 2014 y T-206 de 2018 (Núcleo esencial del Derecho Fundamental de Petición).');
      }
      doc.moveDown(1);

      // IV. CAPÍTULO ESPECIAL: SOLICITUD DE PRUEBAS DE OFICIO E INVERSIÓN DE LA CARGA DE LA PRUEBA
      doc.fontSize(11).font('Helvetica-Bold').text('IV. SOLICITUD DE PRUEBAS DE OFICIO E INVERSIÓN DE LA CARGA PROBATORIA');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(
        `Habida cuenta de la asimetría material del ciudadano frente a la entidad requerida (quien custodia los archivos, registros e historias institucionales), solicito respetuosamente:\n` +
        `1. OFICIAR a ${caseData.entidadAccionada} para que allegue copia íntegra de los antecedentes clínicos, académicos o administrativos del caso (Arts. 19 y 21 Dec. 2591/91).\n` +
        `2. APLICAR la Presunción de Veracidad y Buena Fe (Art. 83 C.P. y Art. 20 Dec. 2591/91) sobre los hechos expuestos.`
      );
      doc.moveDown(1);

      // V. PRETENSIONES
      doc.fontSize(11).font('Helvetica-Bold').text('V. PRETENSIONES INCONDICIONADAS');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      if (cat === 'CANCELACION_ACADEMICA_SALUD') {
        doc.text('PRIMERA: Autorizar la cancelación extemporánea de las asignaturas matriculadas en el período académico por configurarse causal sobrevenida de fuerza mayor en salud y bienestar psicológico (Ley 1616 de 2013 y Sentencia T-574 de 2017).');
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Disponer el retiro o anulación de las notas reprobatorias derivadas de la inasistencia involuntaria, de modo que NO se computen en el promedio de crédito ni afecten el rendimiento académico.');
        doc.moveDown(0.3);
        doc.text('TERCERA: Salvaguardar de manera afirmativa e incondicionada mi permanencia y cupo universitario como estudiante regular, garantizando mi derecho a continuar normalmente mis estudios en los niveles correspondientes hasta optar al título profesional.');
      } else if (cat === 'TUTELA_AGUA') {
        doc.text('PRIMERA: Tutelar el derecho fundamental al agua potable para consumo humano, a la vida digna y a la salubridad pública.');
        doc.moveDown(0.3);
        doc.text(`SEGUNDA: Ordenar a ${caseData.entidadAccionada} la reconexión o garantía inmediata del suministro mínimo vital de 50 litros diarios de agua potable por persona (Sentencia T-740 de 2011).`);
      } else if (cat === 'ESTABILIDAD_LABORAL_MINIMO_VITAL') {
        doc.text('PRIMERA: Tutelar mis derechos fundamentales a la estabilidad laboral reforzada, al mínimo vital y a la seguridad social (Sentencia SU-049 de 2017).');
        doc.moveDown(0.3);
        doc.text(`SEGUNDA: Declarar la ineficacia del despido efectuado sin autorización del Inspector del Trabajo y ordenar a ${caseData.entidadAccionada} el reintegro inmediato junto con el pago de salarios y aportes dejados de percibir.`);
      } else if (cat === 'PROTECCION_CAMPESINADO_TIERRAS') {
        doc.text('PRIMERA: Amparar mis derechos fundamentales como sujeto de especial protección constitucional campesina (Art. 64 C.P. - Acto Legislativo 01 de 2023) y al debido proceso agrario.');
        doc.moveDown(0.3);
        doc.text(`SEGUNDA: Ordenar a ${caseData.entidadAccionada} abstenerse de ejecutar medidas de desalojo o afectación predial sin agotar las garantías de defensa técnica y caracterización rural.`);
      } else if (cat.startsWith('TUTELA')) {
        doc.text('PRIMERA: Tutelar y amparar mis derechos fundamentales a la Salud, Vida Digna e Integridad Personal.');
        doc.moveDown(0.3);
        doc.text(`SEGUNDA: Ordenar a ${caseData.entidadAccionada} que en un término no superior a 48 horas suministre integralmente los medicamentos, procedimientos o servicios requeridos.`);
        doc.moveDown(0.3);
        doc.text('TERCERA: Ordenar el Tratamiento Integral (Art. 8 Ley 1751 de 2015) con el fin de evitar la interposición sucesiva de nuevas acciones judiciales.');
      } else if (cat === 'NULIDAD_CPACA') {
        doc.text(`PRIMERA: Declarar la NULIDAD o REVOCATORIA DIRECTA del acto administrativo cuestionado, expedido por ${caseData.entidadAccionada}.`);
        doc.moveDown(0.3);
        doc.text('SEGUNDA: A título de RESTABLECIMIENTO DEL DERECHO, ordenar la cesación de efectos lesivos y la reparación integral correspondiente.');
      } else if (cat === 'HABEAS_DATA_DATACREDITO') {
        doc.text('PRIMERA: Ordenar la ELIMINACIÓN INMEDIATA del reporte negativo en centrales de riesgo por omisión del preaviso legal de 20 días calendario (Art. 12 Ley 1266/08) o configuración de caducidad (Ley 2157/21).');
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Actualizar el historial crediticio a estado normalizado y expedir constancia escrita al titular.');
      } else {
        doc.text('PRIMERA: Emitir respuesta de fondo, clara, precisa y congruente dentro de los términos perentorios del artículo 14 de la Ley 1755 de 2015.');
        doc.moveDown(0.3);
        doc.text('SEGUNDA: Remitir copia íntegra de la actuación al correo electrónico y canal de contacto registrado.');
      }
      doc.moveDown(1);

      // VI. PRUEBAS Y ANEXOS
      doc.fontSize(11).font('Helvetica-Bold').text('VI. PRUEBAS Y ANEXOS');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text('1. Fotocopia de la Cédula de Ciudadanía del accionante/peticionario.');
      doc.text('2. Soportes fácticos, constancias médicas/psicológicas, comunicaciones institucionales o recibos aportados al expediente.');
      doc.moveDown(1);

      // VII. NOTIFICACIONES
      doc.fontSize(11).font('Helvetica-Bold').text('VII. NOTIFICACIONES Y DIRECCIONES');
      doc.fontSize(9.5).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(`• Domicilio del Accionante: Municipio de ${caseData.municipio || 'Medellín'}, Antioquia.`);
      doc.text('• Canal Digital Autorizado (Art. 56 CPACA): WhatsApp Asistido JusticIA Antioquia 2040.');
      doc.text(`• Buzón Institucional de Referencia: ${caseData.emailPersoneria || 'Atención al Usuario / Secretaría Jurídica'}.`);
      doc.moveDown(2);

      // Firma
      doc.fontSize(10).font('Helvetica-Bold').text('_____________________________________________');
      doc.text(`${(caseData.nombre || 'CIUDADANO').toUpperCase()}`);
      doc.fontSize(9).font('Helvetica').text(`C.C. No. ${caseData.cedula}`);
      doc.text(`Municipio de ${caseData.municipio || 'Medellín'}, Antioquia`);
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
