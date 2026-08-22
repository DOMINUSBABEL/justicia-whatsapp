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
 * Detector de Intención de Cierre, Cancelación o Salida
 */
function isExitOrCancelIntent(rawText, currentState) {
  if (!rawText) return false;
  const clean = normalizeText(rawText).replace(/[!¡?¿,.\-_]/g, ' ').replace(/\s+/g, ' ').trim();

  // Si el mensaje es largo (> 40 caracteres), es una narrativa fáctica, no una salida
  if (clean.length > 40) return false;

  const explicitExitKeywords = [
    'salir',
    'cancelar',
    'cancel',
    'exit',
    'stop',
    'parar',
    'cerrar',
    'terminar',
    'chao',
    'adios',
    'hasta luego',
    'no deseo continuar',
    'no quiero continuar',
    'no quiero nada',
    'no gracias',
    'dejar asi',
    'no autorizo',
    'rechazo',
    'nada mas'
  ];

  if (explicitExitKeywords.some(k => clean === k || clean.startsWith(k + ' ') || clean.endsWith(' ' + k))) {
    return true;
  }

  if (['HABEAS_DATA', 'SELECT_LANGUAGE_MODE'].includes(currentState)) {
    const cancelTokens = ['2', 'no', 'rechazo', 'no autorizo', 'no acepto', 'cancelar', 'salir'];
    if (cancelTokens.includes(clean)) {
      return true;
    }
  }

  if (clean === 'no' || clean === 'no gracias' || clean === 'no quiero' || clean === 'no me interesa') {
    return true;
  }

  return false;
}

/**
 * Detector de Confusión, Dudas o Expresiones Coloquiales Breves
 */
function isHesitationOrConfusion(rawText) {
  if (!rawText) return false;
  const clean = normalizeText(rawText).replace(/[!¡?¿,.\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Si el mensaje es una narrativa de más de 35 caracteres, NO es vacilación
  if (clean.length > 35) return false;

  const shortHesitations = [
    'no se que decir',
    'no se que hacer',
    'no se',
    'no se que responder',
    'no entiendo',
    'no soy hacker',
    'como asi',
    'quien es',
    'que es esto',
    'que hago',
    'perdido',
    'xd',
    'jaja',
    'jajaja',
    'por que',
    'espera',
    'un momento'
  ];

  return shortHesitations.some(p => clean === p || clean.startsWith(p + ' ') || clean.endsWith(' ' + p));
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
 * Extractor Semántico de Entidades y Hechos Clave
 */
function extractEntitiesAndFacts(rawText) {
  const norm = normalizeText(rawText);
  let entidad = 'Entidad / Autoridad Competente';
  let categoria = 'TUTELA_SALUD';

  if (norm.includes('savia') || norm.includes('salud') || norm.includes('sura') || norm.includes('nueva eps') || norm.includes('sanitas') || norm.includes('coomeva') || norm.includes('medisalud') || norm.includes('insulina') || norm.includes('droga') || norm.includes('pastilla') || norm.includes('medicina') || norm.includes('cita')) {
    categoria = 'TUTELA_SALUD';
    if (norm.includes('savia')) entidad = 'Savia Salud EPS';
    else if (norm.includes('sura')) entidad = 'EPS Sura';
    else if (norm.includes('nueva eps')) entidad = 'Nueva EPS';
    else if (norm.includes('sanitas')) entidad = 'EPS Sanitas';
    else entidad = 'Entidad Promotora de Salud (EPS)';
  } else if (norm.includes('epm') || norm.includes('agua') || norm.includes('luz') || norm.includes('energia') || norm.includes('factura') || norm.includes('recibo') || norm.includes('servicios publicos')) {
    categoria = 'PETICION_GENERAL';
    entidad = norm.includes('epm') ? 'Empresas Públicas de Medellín (EPM)' : 'Empresa de Servicios Públicos Domiciliarios';
  } else if (norm.includes('datacredito') || norm.includes('cifin') || norm.includes('credito') || norm.includes('banco') || norm.includes('reporte')) {
    categoria = 'HABEAS_DATA_DATACREDITO';
    entidad = 'Datacrédito Experian / TransUnion CIFIN';
  } else if (norm.includes('alcaldia') || norm.includes('resolucion') || norm.includes('decreto') || norm.includes('despido') || norm.includes('sancion') || norm.includes('predial')) {
    categoria = 'NULIDAD_CPACA';
    entidad = 'Alcaldía Municipal / Entidad Administrativa';
  }

  return { entidad, categoria };
}

/**
 * MOTOR DE INFERENCIA, CURADURÍA Y LITIGIO ESTRATÉGICO JUSTICIA
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
          "¡Hola! 👋 Le damos una cálida bienvenida a la plataforma comunitaria para la defensa integral de sus derechos en Antioquia.\n\n" +
          "📋 *TRATAMIENTO ÉTICO DE DATOS (Ley 1581 de 2012):*\n" +
          "Para analizar la teoría de su caso y construir una estrategia jurídica sólida y verificada, " +
          "necesitamos tratar datos básicos y soportes de su situación. " +
          "Su información se procesa bajo estricta reserva y confidencialidad.\n\n" +
          "👉 *¿Autoriza el tratamiento de sus datos para iniciar la asesoría?*\n\n" +
          "1️⃣ Responda *1* o *Sí* para autorizar e iniciar.\n" +
          "2️⃣ Responda *2* o *No* para cancelar y salir."
        )
      };
    }
    return null;
  }

  // 2. INTERCEPTOR UNIVERSAL DE SALIDA / CANCELACIÓN INMEDIATA
  if (isExitOrCancelIntent(text, state)) {
    sessionManager.resetSession(senderJid);
    sessionManager.updateSession(senderJid, { flowState: 'IDLE' });

    return {
      text: (
        "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
        "  👋  *SESIÓN FINALIZADA — JUSTICIA*\n" +
        "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
        "Entendido. Hemos cerrado su consulta de forma segura y confidencial.\n\n" +
        "💡 Si en algún momento desea retomar o analizar un caso, " +
        "simplemente escriba *!hola* o *Hola*. ¡Que tenga un excelente día!"
      )
    };
  }

  // 3. INTERCEPTOR UNIVERSAL DE CONFUSIÓN O DUDAS
  if (isHesitationOrConfusion(text) && state !== 'HABEAS_DATA') {
    return {
      text: (
        "😊 *¡Tranquilo(a), no se preocupe!*\n\n" +
        "No necesita saber términos de leyes ni ser experto en computadores. Yo soy *JusticIA*, un asistente universitario para ayudarle a defender sus derechos.\n\n" +
        "👉 Simplemente cuénteme con sus palabras como si hablara con un amigo:\n" +
        "• ¿Qué problema tiene con su EPS (Savia Salud, Nueva EPS), con su agua potable o con alguna entidad?\n" +
        "• O si prefiere, indíqueme su nombre completo para empezar a organizar su caso."
      )
    };
  }

  // 4. FASE: HABEAS DATA & CONSENTIMIENTO
  if (state === 'HABEAS_DATA') {
    if (['1', 'si', 'sí', 'acepto', 'autorizo', 'claro', 'dale', 'bueno', 'listo'].some(k => lower.includes(k))) {
      sessionManager.updateSession(senderJid, { flowState: 'SELECT_LANGUAGE_MODE', habeasDataConsent: true });
      return {
        text: (
          "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
          "  🌐  *MODALIDAD DE COMUNICACIÓN & LENGUAJE*\n" +
          "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
          "Queremos que cada paso sea claro y transparente para usted. ¿Cómo prefiere que formulemos la asesoría?\n\n" +
          "🟢 *1️⃣ Modo Lenguaje Sencillo / Campesino (Recomendado):*\n" +
          "Explicaciones directas, paso a paso, sin tecnicismos difíciles.\n\n" +
          "⚖️ *2️⃣ Modo Técnico Jurídico:*\n" +
          "Exposición con artículos del CPACA, precedentes de la Corte Constitucional y dogmática formal.\n\n" +
          "👉 _Responda con el número *1* o *2*:_"
        )
      };
    } else {
      return { text: "Por favor responda *1* (Sí, autorizo) para continuar o *2* (No, deseo salir):" };
    }
  }

  // 5. FASE: SELECCIÓN DE MODO DE LENGUAJE
  if (state === 'SELECT_LANGUAGE_MODE') {
    let mode = 'CLARO';
    if (lower.includes('2') || lower.includes('tecnico') || lower.includes('avanzado')) {
      mode = 'TECNICO';
    }
    sessionManager.updateSession(senderJid, { languageMode: mode, flowState: 'IDENTIFICACION_SUJETO' });

    const ackText = mode === 'CLARO' 
      ? "✅ *Modo Sencillo activado.* Construiremos su caso con lenguaje claro y cercano." 
      : "⚖️ *Modo Técnico Jurídico activado.* Se aplicará el rigor sustantivo y procesal.";

    return {
      text: (
        `${ackText}\n\n` +
        "👤 *Para iniciar la formulación de la Teoría del Caso, ¿cuál es su Nombre Completo?*\n" +
        "_(Tal como figura en su documento de identidad)_"
      )
    };
  }

  // 6. FASE: CAPTURA DE NOMBRE
  if (state === 'IDENTIFICACION_SUJETO') {
    if (!isPlausibleName(text)) {
      return {
        text: (
          "Para que el expediente tenga plena validez jurídica, necesitamos su *Nombre y Apellidos reales*.\n\n" +
          "👤 Por favor escríbalo aquí (ejemplo: *María Carmen Pérez* o *Juan Carlos Restrepo*):"
        )
      };
    }
    sessionManager.updateUserData(senderJid, { nombre: text.trim() });
    sessionManager.updateSession(senderJid, { flowState: 'ASK_CEDULA' });
    return {
      text: `Mucho gusto, *${text.trim()}*.\n\n🆔 Ahora, por favor ingrese su *Número de Cédula de Ciudadanía* (solo los números, sin puntos ni espacios):`
    };
  }

  // 7. FASE: CAPTURA Y VALIDACIÓN DE CÉDULA
  if (state === 'ASK_CEDULA') {
    const val = validateCedula(text);
    if (!val.valid) {
      return { text: `⚠️ ${val.error}` };
    }
    sessionManager.updateUserData(senderJid, { cedula: val.cedula });
    sessionManager.updateSession(senderJid, { flowState: 'UBICACION_MUNICIPIO' });
    return {
      text: (
        "📍 *UBICACIÓN TERRITORIAL EN ANTIOQUIA:*\n" +
        "¿En cuál *Municipio de Antioquia* vive usted o sucedieron los hechos?\n" +
        "_(Ej: Andes, Apartadó, Caucasia, Rionegro, Santa Fe de Antioquia, Yarumal, Segovia, Medellín, etc.)_"
      )
    };
  }

  // 8. FASE: IDENTIFICACIÓN DE MUNICIPIO & APERTURA DEL RELATO DE HECHOS
  if (state === 'UBICACION_MUNICIPIO') {
    const munInfo = findMunicipioInfo(text);
    sessionManager.updateUserData(senderJid, {
      municipio: munInfo.municipio,
      subregion: munInfo.subregion,
      emailJuzgado: munInfo.email_juzgado,
      emailPersoneria: munInfo.email_personeria
    });
    sessionManager.updateSession(senderJid, { flowState: 'RELATO_LIBRE_HECHOS' });

    return {
      text: (
        `📌 *Ubicación Registrada:* ${munInfo.municipio} (Subregión: *${munInfo.subregion}*)\n` +
        `🏛️ *Despacho de Reparto:* ${munInfo.juzgado}\n\n` +
        "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
        "  📖  *CONSTRUCCIÓN DE LA TEORÍA DEL CASO*\n" +
        "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
        "Ahora cuéntenos detalladamente qué situación está viviendo:\n" +
        "• ¿Con qué entidad tiene el problema (EPS Savia Salud, EPM, Alcaldía, Banco)?\n" +
        "• ¿Qué le están negando o qué daño le causaron?\n" +
        "• ¿Hace cuánto tiempo ocurrió y qué le han respondido?\n\n" +
        "👉 _Escriba su relato aquí con calma o envíe una nota de voz / foto de sus documentos:_"
      )
    };
  }

  // 9. FASE: CURADURÍA DE LA TEORÍA DEL CASO & DIAGNÓSTICO DE FALTANTES
  if (state === 'RELATO_LIBRE_HECHOS' || state === 'REQUERIMIENTO_PROBATORIO_O_COMPLEMENTO') {
    if (text.length < 5 && !mediaPayload) {
      return { text: "Por favor bríndenos un poco más de contexto o detalle sobre su caso para poder estructurarlo adecuadamente:" };
    }

    const { entidad, categoria } = extractEntitiesAndFacts(text);
    const tieneSoporte = !!mediaPayload || session.userData.tienePruebas;
    
    sessionManager.updateUserData(senderJid, {
      descripcionHechos: text || session.userData.descripcionHechos || "Vulneración de derechos fundamentales.",
      entidadAccionada: entidad,
      categoriaAccion: categoria,
      tienePruebas: tieneSoporte
    });

    sessionManager.updateSession(senderJid, { flowState: 'EXPLORACION_MECANISMOS' });

    // DIAGNÓSTICO DE TEORÍA DEL CASO Y FALTANTES
    return getCaseTheoryDiagnostic(session.userData, isClaro);
  }

  // 10. FASE: EXPLORACIÓN CO-PARTICIPATIVA DE ESTRATEGIAS Y MECANISMOS LEGALES
  if (state === 'EXPLORACION_MECANISMOS') {
    const cleanChoice = lower.replace(/\D/g, '');

    if (cleanChoice === '1' || lower.includes('tutela') || lower.includes('oficio') || lower.includes('directa')) {
      // Estrategia 1: Tutela Directa con Solicitud de Pruebas de Oficio
      sessionManager.updateUserData(senderJid, {
        viaProcesal: 'TUTELA',
        estrategiaElegida: 'ACCION_DIRECTA_CON_PRUEBAS_OFICIO'
      });
      sessionManager.updateSession(senderJid, { flowState: 'CONFIRMACION_FINAL_EXPEDIENTE' });

      return {
        text: (
          "⚖️ *ESTRATEGIA SELECCIONADA: Acción de Tutela Inmediata con Pruebas de Oficio*\n\n" +
          "Dado que existe urgencia o dificultad para obtener las pruebas directamente de la entidad, " +
          "incorporaremos en la tutela el *Capítulo Especial de Solicitud de Pruebas de Oficio (Arts. 19 y 21 Dec. 2591/91)* " +
          "y la *Inversión de la Carga de la Prueba*, solicitando al Juez que obligue a la entidad a aportar los documentos.\n\n" +
          getFinalReviewText(session.userData)
        )
      };

    } else if (cleanChoice === '2' || lower.includes('peticion') || lower.includes('previo') || lower.includes('historia')) {
      // Estrategia 2: Mecanismo Previo (Derecho de Petición) para recaudar pruebas
      sessionManager.updateUserData(senderJid, {
        viaProcesal: 'PETICION',
        categoriaAccion: 'PETICION_GENERAL',
        estrategiaElegida: 'MECANISMO_PREVIO_PETICION'
      });
      sessionManager.updateSession(senderJid, { flowState: 'CONFIRMACION_FINAL_EXPEDIENTE' });

      return {
        text: (
          "📄 *ESTRATEGIA SELECCIONADA: Derecho de Petición Previo para Conseguir Pruebas*\n\n" +
          "Excelente decisión estratégica. Redactaremos un *Derecho de Petición bajo la Ley 1755 de 2015* " +
          "para exigir a la entidad la entrega inmediata de copias de su historia clínica, autorizaciones pendientes y justificación formal. " +
          "Si no responden en los términos de ley (10 a 15 días), quedará configurada la violación directa para radicar tutela por desacato.\n\n" +
          getFinalReviewText(session.userData)
        )
      };

    } else if (cleanChoice === '3' || lower.includes('complementar') || lower.includes('adjuntar') || lower.includes('foto')) {
      // Estrategia 3: Aportar más información o fotos
      sessionManager.updateSession(senderJid, { flowState: 'REQUERIMIENTO_PROBATORIO_O_COMPLEMENTO' });

      return {
        text: (
          "📝 *Complementación de Información:*\n\n" +
          "Por favor escriba los detalles adicionales que desea agregar o envíe las fotografías de sus documentos en este chat.\n\n" +
          "👉 _Escriba o envíe la foto ahora:_"
        )
      };

    } else {
      return {
        text: (
          "Por favor elija una de las 3 opciones de estrategia:\n" +
          "1️⃣ *1* para Tutela Directa (pidiendo al juez pruebas de oficio).\n" +
          "2️⃣ *2* para Derecho de Petición Previo (para obligar a la entidad a entregar copias).\n" +
          "3️⃣ *3* para Complementar más hechos o adjuntar fotos."
        )
      };
    }
  }

  // 11. FASE: CONFIRMACIÓN FINAL Y COMPILACIÓN DEL EXPEDIENTE FORMAL
  if (state === 'CONFIRMACION_FINAL_EXPEDIENTE') {
    if (['1', 'si', 'sí', 'confirmar', 'generar', 'listo', 'correcto', 'proceder', 'adelante'].some(k => lower.includes(k))) {
      try {
        const u = session.userData;
        const pdfResult = await generateLegalPDF(u);
        sessionManager.updateUserData(senderJid, { generatedPdfPath: pdfResult.filePath });
        sessionManager.updateSession(senderJid, { flowState: 'COMPLETED' });

        return {
          text: (
            "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
            "  ⚖️  *¡EXPEDIENTE JURÍDICO FORMALIZADO!*\n" +
            "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
            `📄 Adjuntamos su minuta judicial completa (*${pdfResult.fileName}*), estructurada con la teoría del caso curada y la solicitud de pruebas de oficio.\n\n` +
            `📍 *CANALES DE RADICACIÓN OFICIAL EN ${u.municipio.toUpperCase()} (ANTIOQUIA):*\n\n` +
            `1️⃣ *Radicación por Correo Electrónico:*\n` +
            `• Remita el archivo PDF adjunto a los siguientes despachos oficiales:\n` +
            `📧 *Despacho Judicial de Reparto:* \`${u.emailJuzgado}\`\n` +
            `📧 *Personería Municipal de ${u.municipio}:* \`${u.emailPersoneria}\`\n\n` +
            `2️⃣ *Radicación Presencial:*\n` +
            `• Imprima el documento, fírmelo en la última página y preséntelo en la Personería Municipal o Juzgado de ${u.municipio}.\n\n` +
            `⏱️ *Plazos Legales:* ${u.viaProcesal === 'TUTELA' ? 'Medida cautelar en *48 horas* y sentencia en *10 días hábiles*.' : 'Respuesta obligatoria en *10 a 15 días hábiles*.'}\n\n` +
            `_Ecosistema LegalTech Comunitario — Agenda Antioquia 2040 / Cátedra G8_\n` +
            `Si desea realizar otra consulta en el futuro, escriba *!hola*.`
          ),
          pdfPath: pdfResult.filePath,
          pdfFileName: pdfResult.fileName
        };
      } catch (err) {
        console.error('Error generando PDF:', err);
        return { text: "Ocurrió un error compilando el expediente. Responda *1* para reintentar la compilación." };
      }
    } else if (lower.includes('2') || lower.includes('cambiar') || lower.includes('corregir')) {
      sessionManager.updateSession(senderJid, { flowState: 'EXPLORACION_MECANISMOS' });
      return { text: "Entendido. Volvamos a la selección de estrategia legal. Responda *1* (Tutela Directa con pruebas de oficio), *2* (Derecho de Petición previo) o *3* (Complementar hechos):" };
    } else {
      return { text: "Por favor responda *1* para confirmar y generar el documento formal, o *2* para revisar las opciones." };
    }
  }

  return { text: "Escriba *!hola* para iniciar una asesoría jurídica en JusticIA." };
}

/**
 * Generador del Diagnóstico de Teoría del Caso y Exploración de Mecanismos
 */
function getCaseTheoryDiagnostic(u, isClaro) {
  const tienePruebas = u.tienePruebas;
  
  return {
    text: (
      "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
      "  🔍  *ANÁLISIS DE LA TEORÍA DEL CASO*\n" +
      "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
      `Hemos analizado minuciosamente su situación:\n\n` +
      `👤 *Accionante:* ${u.nombre} (C.C. ${u.cedula}) en *${u.municipio}*.\n` +
      `🏢 *Entidad Responsable:* ${u.entidadAccionada}.\n` +
      `📝 *Hechos Clave:* "${u.descripcionHechos}".\n` +
      `📊 *Estado Probatorio:* ${tienePruebas ? '✅ Cuenta con soportes documentales' : '⚠️ *Faltan soportes documentales directos (fórmula o negativa por escrito)*'}.\n\n` +
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
      "⚖️ *EXPLORACIÓN DE MECANISMOS LEGALES DISPONIBLES:*\n" +
      "Para garantizar el éxito de su caso sin que sea rechazado por el juez, tenemos 3 caminos:\n\n" +
      "1️⃣ *Acción de Tutela Directa (Con Solicitud de Pruebas de Oficio)*\n" +
      "   👉 _Recomendado si hay urgencia médica._ Procedemos con la tutela y le solicitamos formalmente al Juez que obligue a la entidad a aportar la historia clínica e invierta la carga de la prueba (Arts. 19/21 Dec. 2591/91).\n\n" +
      "2️⃣ *Mecanismo Legal Previo (Derecho de Petición de Copias y Entrega)*\n" +
      "   👉 Radicamos primero una petición formal exigiendo los documentos y el servicio en 10-15 días, para blindar la prueba antes de acudir a la tutela.\n\n" +
      "3️⃣ *Complementar Hechos o Enviar Fotos Ahora*\n" +
      "   👉 Si tiene fotos de fórmulas, órdenes o desea ampliar su relato.\n\n" +
      "👉 *¿Qué camino prefiere tomar? Responda 1, 2 o 3:*"
    )
  };
}

function getFinalReviewText(u) {
  return (
    "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n" +
    "  📋  *REVISIÓN FINAL DEL EXPEDIENTE*\n" +
    "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n" +
    `• *Titular:* ${u.nombre} (C.C. ${u.cedula})\n` +
    `• *Municipio:* ${u.municipio} (${u.subregion})\n` +
    `• *Entidad:* ${u.entidadAccionada}\n` +
    `• *Vía Procesal:* ${u.viaProcesal === 'TUTELA' ? 'Acción de Tutela con Medida Cautelar y Pruebas de Oficio' : 'Derecho de Petición de Información y Copias'}\n` +
    `• *Capítulo Probatorio:* ${u.estrategiaElegida === 'ACCION_DIRECTA_CON_PRUEBAS_OFICIO' ? 'Solicitud Judicial de Decreto de Pruebas de Oficio (Art. 19 Dec. 2591)' : 'Reclamación Directa'}\n\n` +
    "👉 *¿Confirma la generación del documento formal para radicación?*\n\n" +
    "1️⃣ Responda *1* o *Sí* para compilar y descargar su *PDF oficial*.\n" +
    "2️⃣ Responda *2* para modificar la estrategia."
  );
}

module.exports = {
  processMessage,
  isActivationKeyword,
  isExitOrCancelIntent,
  isHesitationOrConfusion
};
