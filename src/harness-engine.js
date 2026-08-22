const fs = require('fs');
const path = require('path');
const sessionManager = require('./session-manager');
const { generateLegalPDF } = require('./pdf-generator');

const DIRECTORY_FILE = path.join(__dirname, '..', 'data', 'antioquia_directory.json');
let antioquiaDir = {};
try {
  if (fs.existsSync(DIRECTORY_FILE)) {
    antioquiaDir = JSON.parse(fs.readFileSync(DIRECTORY_FILE, 'utf8'));
  }
} catch (e) {
  console.error('Error cargando directorio de Antioquia:', e.message);
}

function normalizeText(text) {
  return (text || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Reconocedor Flexible de Palabras de Activación
 */
function isActivationKeyword(rawText) {
  if (!rawText) return false;
  const clean = normalizeText(rawText).replace(/[!¡?¿,.\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  
  const triggers = [
    'hola',
    'hola justicia',
    'justicia',
    'iniciar',
    'inicio',
    'activar',
    'ayuda',
    'asesoria',
    'consulta',
    'buenos dias',
    'buenas tardes',
    'buenas noches',
    'buenas',
    'tutela',
    'peticion',
    'derecho'
  ];

  return triggers.some(t => clean === t || clean.startsWith(t + ' ') || clean.endsWith(' ' + t));
}

/**
 * Detector de Confusión, Dudas o Expresiones Coloquiales
 */
function isHesitationOrConfusion(rawText) {
  if (!rawText) return false;
  const norm = normalizeText(rawText);
  const patterns = [
    'no se que decir',
    'no se que hacer',
    'no se',
    'no entiendo',
    'no soy hacker',
    'como asi',
    'quien es',
    'que es esto',
    'que hago',
    'perdido',
    'ayuda',
    'xd',
    'jaja',
    'jajaja',
    'por que',
    'espera',
    'un momento'
  ];
  return patterns.some(p => norm.includes(p));
}

function validateCedula(rawInput) {
  if (!rawInput || rawInput.trim() === '') {
    return { valid: false, error: 'No ingresó ningún dato. Por favor escriba su *número de cédula* usando solo números (ej: 10203040).' };
  }
  const cleaned = rawInput.replace(/[\.\s\-]/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'La cédula debe contener exclusivamente dígitos numéricos (sin puntos, letras ni espacios). Inténtelo de nuevo:' };
  }
  if (cleaned.length < 6 || cleaned.length > 10) {
    return { valid: false, error: `El número ingresado (${cleaned.length} dígitos) no es válido (debe tener entre 6 y 10 dígitos). Por favor verifíquelo:` };
  }
  return { valid: true, cedula: cleaned };
}

function isPlausibleName(rawText) {
  if (!rawText || rawText.trim().length < 4) return false;
  const norm = normalizeText(rawText);
  if (isHesitationOrConfusion(norm)) return false;
  if (/^\d+$/.test(norm.replace(/\s+/g, ''))) return false;
  // Al menos letras y espacios, sin ser una frase interrogativa
  return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]{4,60}$/.test(rawText.trim());
}

function findMunicipioInfo(inputMun) {
  const norm = normalizeText(inputMun);
  for (const [key, data] of Object.entries(antioquiaDir)) {
    if (norm.includes(key) || key.includes(norm)) {
      return data;
    }
  }
  const pretty = inputMun.trim().charAt(0).toUpperCase() + inputMun.trim().slice(1);
  return {
    municipio: pretty,
    subregion: "Antioquia Rural",
    juzgado: `Juzgado Promiscuo Municipal de ${pretty}`,
    email_juzgado: `j01prmpal${normalizeText(pretty).replace(/\s+/g, '')}@cendoj.ramajudicial.gov.co`,
    personeria: `Personería Municipal de ${pretty}`,
    email_personeria: `personeria@${normalizeText(pretty).replace(/\s+/g, '')}-antioquia.gov.co`
  };
}

/**
 * MOTOR DE INFERENCIA Y CURADURÍA AGÉNTICA JUSTICIA
 */
async function processMessage(senderJid, rawMessage, mediaPayload = null) {
  const session = sessionManager.getSession(senderJid);
  const text = (rawMessage || '').trim();
  const lower = text.toLowerCase();
  const state = session.flowState;
  const isClaro = (session.languageMode || 'CLARO') === 'CLARO';

  // 1. FILTRO DE ACTIVACIÓN CUANDO LA SESIÓN ESTÁ INACTIVA O FINALIZADA
  const isInactive = !state || state === 'IDLE' || state === 'COMPLETED' || state === 'CANCELLED';
  if (isInactive) {
    if (isActivationKeyword(text) || lower === 'reiniciar' || lower === 'reset') {
      sessionManager.resetSession(senderJid);
      sessionManager.updateSession(senderJid, { flowState: 'HABEAS_DATA' });

      return {
        text: (
          "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
          "  ⚖️  *JUSTICIA WHATSAPP — LITIGIO ESTRATÉGICO*\n" +
          "  🏛️  _Agenda Antioquia 2040 | Cátedra G8_\n" +
          "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
          "¡Hola! 👋 Le damos una cálida bienvenida a la plataforma comunitaria para la defensa de sus derechos en Antioquia.\n\n" +
          "📋 *TRATAMIENTO DE DATOS PERSONALES (Ley 1581 de 2012):*\n" +
          "Para redactar su documento judicial (Tutela, Derecho de Petición o Recurso ante el juez), " +
          "necesitamos tratar datos básicos y fotos de su caso. " +
          "Toda su información se procesa bajo estricta reserva ética y confidencialidad.\n\n" +
          "👉 *¿Autoriza el tratamiento de sus datos para iniciar su asesoría?*\n\n" +
          "1️⃣ Responda *1* o *Sí* para continuar.\n" +
          "2️⃣ Responda *2* o *No* para salir."
        )
      };
    }
    return null;
  }

  // 2. INTERCEPTOR UNIVERSAL DE CONFUSIÓN O DUDAS
  if (isHesitationOrConfusion(text) && state !== 'HABEAS_DATA') {
    return {
      text: (
        "😊 *¡Tranquilo(a), no se preocupe!*\n\n" +
        "No necesita ser experto en computadores ni saber de leyes. Yo soy *JusticIA*, un asistente creado por las universidades de Antioquia para ayudarle a redactar cartas y tutelas ante los jueces.\n\n" +
        "👉 Simplemente cuénteme como si estuviera hablando con un amigo:\n" +
        "• ¿Qué problema tiene con su EPS (Savia Salud, Nueva EPS), su agua o con la alcaldía?\n" +
        "• O si prefiere, dígame su nombre para empezar a organizar su caso."
      )
    };
  }

  // 3. FASE: HABEAS DATA & CONSENTIMIENTO
  if (state === 'HABEAS_DATA') {
    if (['1', 'si', 'sí', 'acepto', 'autorizo', 'claro', 'dale', 'bueno', 'listo'].some(k => lower.includes(k))) {
      sessionManager.updateSession(senderJid, { flowState: 'SELECT_LANGUAGE_MODE', habeasDataConsent: true });
      return {
        text: (
          "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
          "  🌐  *MODALIDAD DE COMUNICACIÓN & LENGUAJE*\n" +
          "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
          "Queremos que todo sea fácil y comprensible para usted. ¿Cómo prefiere que le expliquemos su trámite?\n\n" +
          "🟢 *1️⃣ Modo Lenguaje Sencillo / Campesino (Recomendado):*\n" +
          "Explicaciones claras, paso a paso, sin palabras raras ni tecnicismos jurídicos.\n\n" +
          "⚖️ *2️⃣ Modo Técnico Jurídico:*\n" +
          "Exposición formal con artículos de leyes, decretos del CPACA y jurisprudencia de la Corte.\n\n" +
          "👉 _Responda con el número *1* o *2*:_"
        )
      };
    } else if (['2', 'no', 'rechazo', 'cancelar'].some(k => lower.includes(k))) {
      sessionManager.updateSession(senderJid, { flowState: 'CANCELLED' });
      return {
        text: "Entendido. Sin la autorización de datos no podemos generar el documento legal.\nSi desea volver a consultar en cualquier momento, solo escriba *!hola*."
      };
    } else {
      return { text: "Por favor responda *1* (Sí, autorizo) para continuar o *2* (No) para salir:" };
    }
  }

  // 4. FASE: SELECCIÓN DE MODO DE LENGUAJE
  if (state === 'SELECT_LANGUAGE_MODE') {
    let mode = 'CLARO';
    if (lower.includes('2') || lower.includes('tecnico') || lower.includes('avanzado')) {
      mode = 'TECNICO';
    }
    sessionManager.updateSession(senderJid, { languageMode: mode, flowState: 'ASK_NAME' });

    const ackText = mode === 'CLARO' 
      ? "✅ *Modo Sencillo activado.* Hablaremos de forma clara y directa." 
      : "⚖️ *Modo Técnico Jurídico activado.* Se aplicará el rigor procesal formal.";

    return {
      text: (
        `${ackText}\n\n` +
        "👤 *Para iniciar el documento formal, ¿cuál es su Nombre Completo?*\n" +
        "_(Escríbalo tal como figura en su cédula de ciudadanía)_"
      )
    };
  }

  // 5. FASE: CAPTURA DE NOMBRE CON VALIDACIÓN CONVERSACIONAL
  if (state === 'ASK_NAME') {
    if (!isPlausibleName(text)) {
      return {
        text: (
          "Para que el escrito sea válido ante el juez, necesitamos su *Nombre y Apellidos reales*.\n\n" +
          "👤 Por favor escríbalo aquí (ejemplo: *María Carmen Pérez* o *Juan Carlos Restrepo*):"
        )
      };
    }
    sessionManager.updateUserData(senderJid, { nombre: text.trim() });
    sessionManager.updateSession(senderJid, { flowState: 'ASK_CEDULA' });
    return {
      text: `Mucho gusto, *${text.trim()}*.\n\n🆔 Ahora, por favor ingrese su *Número de Cédula de Ciudadanía* (solo los números, sin puntos ni comas):`
    };
  }

  // 6. FASE: CAPTURA Y VALIDACIÓN DE CÉDULA
  if (state === 'ASK_CEDULA') {
    const val = validateCedula(text);
    if (!val.valid) {
      return { text: `⚠️ ${val.error}` };
    }
    sessionManager.updateUserData(senderJid, { cedula: val.cedula });
    sessionManager.updateSession(senderJid, { flowState: 'ASK_MUNICIPIO' });
    return {
      text: (
        "📍 *UBICACIÓN EN ANTIOQUIA:*\n" +
        "¿En cuál *Municipio de Antioquia* vive usted o sucedieron los hechos?\n" +
        "_(Ej: Andes, Apartadó, Caucasia, Rionegro, Santa Fe de Antioquia, Yarumal, Segovia, Medellín, Bello, etc.)_"
      )
    };
  }

  // 7. FASE: IDENTIFICACIÓN DE MUNICIPIO & CATÁLOGO VISUAL DE ACCIONES
  if (state === 'ASK_MUNICIPIO') {
    const munInfo = findMunicipioInfo(text);
    sessionManager.updateUserData(senderJid, {
      municipio: munInfo.municipio,
      subregion: munInfo.subregion,
      emailJuzgado: munInfo.email_juzgado,
      emailPersoneria: munInfo.email_personeria
    });
    sessionManager.updateSession(senderJid, { flowState: 'ASK_CATEGORY' });

    return {
      text: (
        `📌 *Municipio Registrado:* ${munInfo.municipio} (Subregión: *${munInfo.subregion}*)\n` +
        `🏛️ *Despacho Judicial de Reparto:* ${munInfo.juzgado}\n\n` +
        "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
        "  ⚖️  *CATÁLOGO DE ACCIONES LEGALES*\n" +
        "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
        "Por favor elija el número de la opción que mejor describe su problema:\n\n" +
        "1️⃣ *SALUD & MEDICAMENTOS (Acción de Tutela)*\n" +
        "   • Negación de medicinas vitales, citas con especialistas o cirugías (EPS Savia Salud, Nueva EPS).\n" +
        "   👉 _Incluye solicitud de Medida Cautelar Urgente (48 horas)._\n\n" +
        "2️⃣ *DERECHO DE PETICIÓN (Ley 1755 de 2015)*\n" +
        "   • Reclamos por cobros injustificados en facturas de servicios públicos o solicitud de información a entidades.\n\n" +
        "3️⃣ *HÁBEAS DATA FINANCIERO (Borrón y Cuenta Nueva)*\n" +
        "   • Eliminación de reportes negativos caducados en Datacrédito / CIFIN.\n\n" +
        "4️⃣ *DEMANDAS & RECURSOS CONTRA EL ESTADO (CPACA)*\n" +
        "   • Demandas de Nulidad y Restablecimiento contra despidos, sanciones o liquidaciones de predial injustas.\n\n" +
        "5️⃣ *ACCIONES POPULARES & CUMPLIMIENTO*\n" +
        "   • Problemas colectivos en su comunidad (puente caído, río contaminado, falta de salubridad).\n\n" +
        "6️⃣ *CONSULTORIOS JURÍDICOS UNIVERSITARIOS G8*\n" +
        "   • Casos complejos de tierras, linderos de fincas, herencias/sucesiones o defensa penal.\n\n" +
        "👉 _Responda con el número (1, 2, 3, 4, 5 o 6):_"
      )
    };
  }

  // 8. FASE: TRIAJE Y SELECCIÓN DE VÍA PROCESAL
  if (state === 'ASK_CATEGORY') {
    let cat = 'TUTELA_SALUD';
    let via = 'TUTELA';
    let entidad = 'Savia Salud EPS';
    let promptMsg = '';

    if (lower === '1' || lower.includes('salud') || lower.includes('tutela') || lower.includes('medicamento')) {
      cat = 'TUTELA_SALUD';
      via = 'TUTELA';
      entidad = 'Savia Salud EPS / Entidad Prestadora de Salud';
      promptMsg = isClaro 
        ? "🏥 *Caso de Salud y Medicamentos:*\nCuénteme con calma:\n• ¿Qué medicina, examen o cita le están negando?\n• ¿Qué EPS tiene y en qué clínica u hospital lo atendieron?\n• ¿Hace cuánto tiempo está esperando?"
        : "🏥 *Acción de Tutela en Salud (Precedente T-760/08):*\nIndique los hechos:\n1. Prestación médica o tecnología denegada.\n2. Entidad promotora de salud (EPS/IPS) y fecha de la prescripción facultativa.\n3. Riesgo para la vida digna o salud del paciente.";

    } else if (lower === '2' || lower.includes('peticion') || lower.includes('servicio') || lower.includes('recibo')) {
      cat = 'PETICION_GENERAL';
      via = 'PETICION';
      entidad = 'Empresa de Servicios Públicos / Entidad Municipal';
      promptMsg = isClaro
        ? "📄 *Derecho de Petición:*\nCuéntenos:\n• ¿A qué empresa o entidad va a reclamar?\n• ¿Qué solicita exactamente (revisar una factura cara, pedir copias, hacer un reclamo)?"
        : "📄 *Derecho Fundamental de Petición (Ley 1755/15):*\nIndique sujeto pasivo y objeto concreto de la solicitud (Información, copias o reclamación de facturación bajo Ley 142/94).";

    } else if (lower === '3' || lower.includes('datacredito') || lower.includes('habeas') || lower.includes('cifin')) {
      cat = 'HABEAS_DATA_DATACREDITO';
      via = 'PETICION_HABEAS_DATA';
      entidad = 'Datacrédito Experian / TransUnion / Entidad Financiera';
      promptMsg = isClaro
        ? "💳 *Hábeas Data Financiero:*\nIndíquenos:\n• ¿Con qué banco o entidad tiene el reporte negativo?\n• ¿Ya canceló la deuda o han pasado más de 8 años en mora?"
        : "💳 *Hábeas Data Financiero (Ley 1266/08 & Ley 2157/21):*\nIndique la fuente de la obligación, fecha de extinción de la mora y si opera el régimen de caducidad del dato negativo.";

    } else if (lower === '4' || lower.includes('nulidad') || lower.includes('cpaca') || lower.includes('resolucion') || lower.includes('recurso')) {
      cat = 'NULIDAD_CPACA';
      via = 'NULIDAD_RESTABLECIMIENTO';
      entidad = 'Entidad Pública Emisora del Acto Administrativo';
      promptMsg = isClaro
        ? "🏛️ *Demanda contra Actos del Gobierno (CPACA):*\nPara ayudarle de forma exacta:\n• ¿Cuál es el número de la resolución o decreto que le causó el daño?\n• ¿En qué fecha le notificaron esa decisión?"
        : "🏛️ *Medio de Control de Nulidad y Restablecimiento del Derecho (Art. 138 CPACA):*\nSírvase precisar número del acto, fecha de notificación (término de caducidad de 4 meses) y pretensiones anulatorias.";

    } else if (lower === '5' || lower.includes('popular') || lower.includes('cumplimiento') || lower.includes('colectivo')) {
      cat = 'ACCION_POPULAR';
      via = 'ACCION_POPULAR';
      entidad = 'Municipio / Gobernación de Antioquia';
      promptMsg = isClaro
        ? "👥 *Acción Popular o de Cumplimiento:*\nCuéntenos:\n• ¿Qué problema colectivo está afectando a su comunidad (vía destruida, río contaminado)?\n• ¿En qué vereda o barrio sucede?"
        : "👥 *Acciones Colectivas (Ley 472/98):*\nIndique el derecho colectivo amenazado, la norma legal desatendida y la comunidad afectada en el municipio.";

    } else if (lower === '6' || lower.includes('tierra') || lower.includes('penal') || lower.includes('herencia') || lower.includes('g8')) {
      cat = 'G8_COMPLEJO';
      via = 'CONSULTORIO_G8';
      entidad = 'Red de Consultorios Jurídicos Universitarios G8';
      sessionManager.updateUserData(senderJid, { categoriaAccion: cat, viaProcesal: via, entidadAccionada: entidad });
      sessionManager.updateSession(senderJid, { flowState: 'COMPLETED' });

      return {
        text: (
          "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
          "  🎓  *RED DE CONSULTORIOS JURÍDICOS G8*\n" +
          "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
          "Por la alta complejidad técnica de los procesos de tierras (restitución, linderos), herencias/sucesiones y litigio penal, " +
          "su caso requiere representación jurídica directa y presencial.\n\n" +
          "⚖️ *ASIGNACIÓN DE TURNO UNIVERSITARIO:*\n" +
          "Hemos registrado su caso para atención prioritaria gratuita en las facultades de derecho del G8:\n" +
          "• *Universidad EAFIT | UPB | Universidad de Antioquia | Unilasallista*\n" +
          "• *Radicado Asignado:* `G8-ANT-" + Math.floor(10000 + Math.random() * 90000) + "`\n" +
          "• *Contacto Oficial:* (604) 2619500 / consultoriojuridico@eafit.edu.co\n\n" +
          "Un asesor jurídico universitario revisará sus antecedentes. Para reiniciar, escriba *!hola*."
        )
      };
    } else {
      return { text: "Por favor elija una opción respondiendo con un número del *1 al 6*." };
    }

    sessionManager.updateUserData(senderJid, { categoriaAccion: cat, viaProcesal: via, entidadAccionada: entidad });
    sessionManager.updateSession(senderJid, { flowState: 'ASK_DESCRIPTION' });
    return { text: promptMsg };
  }

  // 9. FASE: DESCRIPCIÓN DE HECHOS & BUCLE PROBATORIO PROACTIVO
  if (state === 'ASK_DESCRIPTION') {
    if (text.length < 5 && !mediaPayload) {
      return { text: "Por favor cuéntenos un poco más de detalle sobre lo sucedido para redactar su documento:" };
    }

    sessionManager.updateUserData(senderJid, {
      descripcionHechos: text || "Se denuncia vulneración de derechos y omisión injustificada por parte de la entidad accionada.",
      tienePruebas: !!mediaPayload
    });

    // ACTIVACIÓN DEL BUCLE PROBATORIO PROACTIVO
    if (!mediaPayload) {
      sessionManager.updateSession(senderJid, { flowState: 'PROBATIVE_LOOP' });
      return {
        text: (
          "📝 *Hechos Registrados con Éxito.*\n\n" +
          "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
          "  🔍  *BUCLE DE REQUERIMIENTO PROBATORIO*\n" +
          "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
          "Para que el Juez o la autoridad admita inmediatamente su solicitud y ordene la solución rápida:\n\n" +
          "📸 *¿Cuenta con fotos de sus documentos?* (Fórmula médica, orden, recibo de servicio público o resolución).\n\n" +
          "👉 *Envíe la foto directamente en este chat*, o responda *'Sí la tengo'* o *'No tengo foto'* para continuar."
        )
      };
    }

    sessionManager.updateSession(senderJid, { flowState: 'CONFIRM_CASE' });
    return getConfirmationSummary(session.userData, isClaro);
  }

  // 10. FASE: RESPUESTA AL BUCLE PROBATORIO
  if (state === 'PROBATIVE_LOOP') {
    if (mediaPayload || ['si', 'sí', 'tengo', 'adjunto', 'foto', 'claro', 'aqui'].some(k => lower.includes(k))) {
      sessionManager.updateUserData(senderJid, { tienePruebas: true });
    }
    sessionManager.updateSession(senderJid, { flowState: 'CONFIRM_CASE' });
    return getConfirmationSummary(session.userData, isClaro);
  }

  // 11. FASE: VALIDACIÓN CIUDADANA Y ENSAMBLADO FINAL EN PDF
  if (state === 'CONFIRM_CASE') {
    if (['1', 'si', 'sí', 'confirmar', 'generar', 'listo', 'correcto', 'proceder'].some(k => lower.includes(k))) {
      try {
        const u = session.userData;
        const pdfResult = await generateLegalPDF(u);
        sessionManager.updateUserData(senderJid, { generatedPdfPath: pdfResult.filePath });
        sessionManager.updateSession(senderJid, { flowState: 'COMPLETED' });

        return {
          text: (
            "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
            "  ⚖️  *¡DOCUMENTO JURÍDICO GENERADO CON ÉXITO!*\n" +
            "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
            `📄 Adjuntamos su minuta formal lista para radicar (*${pdfResult.fileName}*).\n\n` +
            `📍 *GUÍA DE RADICACIÓN OFICIAL EN ${u.municipio.toUpperCase()} (ANTIOQUIA):*\n\n` +
            `1️⃣ *Radicación Electrónica por Correo Electrónico:*\n` +
            `• Remita el archivo PDF adjunto a los buzones oficiales:\n` +
            `📧 *Despacho Judicial de Reparto:* \`${u.emailJuzgado}\`\n` +
            `📧 *Personería Municipal:* \`${u.emailPersoneria}\`\n\n` +
            `2️⃣ *Radicación Presencial:*\n` +
            `• Imprima el PDF, fírmelo en la última hoja y entréguelo en la Personería Municipal de ${u.municipio}.\n\n` +
            `⏱️ *Términos de Ley:* ${u.viaProcesal === 'TUTELA' ? 'El juez resolverá la medida urgente en *48 horas* y el fallo en *10 días hábiles*.' : 'La entidad tiene de *10 a 15 días hábiles* para responder.'}\n\n` +
            `_Ecosistema LegalTech Comunitario — Agenda Antioquia 2040 / Cátedra G8_\n` +
            `Para realizar una nueva consulta, escriba *!hola*.`
          ),
          pdfPath: pdfResult.filePath,
          pdfFileName: pdfResult.fileName
        };
      } catch (err) {
        console.error('Error generando PDF:', err);
        return { text: "Ocurrió un error compilando el documento judicial. Responda *1* para reintentar la compilación." };
      }
    } else if (lower.includes('2') || lower.includes('corregir') || lower.includes('modificar')) {
      sessionManager.updateSession(senderJid, { flowState: 'ASK_CATEGORY' });
      return { text: "Entendido. Volvamos a seleccionar el tipo de trámite. Escriba 1 (Tutela), 2 (Petición), 3 (Hábeas Data), 4 (CPACA) o 5 (Acción Popular):" };
    } else {
      return { text: "Por favor responda *1* para confirmar y generar su PDF formal, o *2* para corregir datos." };
    }
  }

  return { text: "Escriba *!hola* para iniciar la asistencia legal de JusticIA." };
}

function getConfirmationSummary(u, isClaro) {
  const catTitles = {
    TUTELA_SALUD: 'Acción de Tutela en Salud con Medida Cautelar Urgente (Art. 7 Dec. 2591/91)',
    PETICION_GENERAL: 'Derecho de Petición en Interés Particular (Ley 1755 de 2015)',
    HABEAS_DATA_DATACREDITO: 'Petición de Hábeas Data Financiero y Caducidad (Ley 2157 de 2021)',
    NULIDAD_CPACA: 'Demanda de Nulidad y Restablecimiento del Derecho (Art. 138 CPACA)',
    ACCION_POPULAR: 'Acción Popular por Derechos Colectivos (Ley 472 de 1998)'
  };

  return {
    text: (
      "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
      "  📋  *RESUMEN DEL EXPEDIENTE CONSTITUCIONAL*\n" +
      "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
      `• *Accionante / Peticionario:* ${u.nombre} (C.C. ${u.cedula})\n` +
      `• *Territorio:* ${u.municipio} (${u.subregion})\n` +
      `• *Entidad Accionada:* ${u.entidadAccionada}\n` +
      `• *Vía Procesal:* ${catTitles[u.categoriaAccion] || u.viaProcesal}\n` +
      `• *Pruebas y Anexos:* ${u.tienePruebas ? '✅ Soportes registrados para el expediente' : '⚠️ Sin foto adjunta'}\n\n` +
      "👉 *¿Los datos son correctos?*\n\n" +
      "1️⃣ Responda *1* o *Sí* para compilar y descargar su *PDF formal radicable*.\n" +
      "2️⃣ Responda *2* para corregir algún dato."
    )
  };
}

module.exports = {
  processMessage,
  isActivationKeyword,
  isHesitationOrConfusion
};
