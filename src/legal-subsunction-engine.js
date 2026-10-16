const fs = require('fs');
const path = require('path');
const { filterAiSlop } = require('./anti-ai-slop-filter');
const { sanitizeLexicon } = require('./non-pathologizing-lexicon');
const {
  detectSuspensiveClauses,
  enforceAffirmativeStudentStatus
} = require('./unconditioned-petition-validator');
const { buildStandingProtectionPetitions } = require('./academic-standing-guard');
const { injectRemorseParagraph } = require('./remorse-tone-injector');
const { validateDocumentBudget } = require('./page-budget-engine');
const { curateEvidenceBundle } = require('./evidence-bundle-curator');
const { parseVoiceFeedback } = require('./voice-intent-parser');

const dirPath = path.join(__dirname, '..', 'data', 'antioquia_directory.json');
const uniPath = path.join(__dirname, '..', 'data', 'antioquia_universities_directory.json');

let antioquiaDir = {};
let universitiesDir = {};

try {
  const rawDir = JSON.parse(fs.readFileSync(dirPath, 'utf8'));
  antioquiaDir = rawDir.municipios || rawDir || {};
} catch {
  antioquiaDir = {};
}

try {
  const rawUni = JSON.parse(fs.readFileSync(uniPath, 'utf8'));
  universitiesDir = rawUni.universidades || rawUni || {};
} catch {
  universitiesDir = {};
}

/**
 * Matriz dogmática de las 9 rutas jurídicas constitucionales, administrativas y académicas.
 */
const LEGAL_ROUTES_CATALOG = {
  TUTELA_SALUD: {
    id: 'TUTELA_SALUD',
    title: 'Acción de Tutela por Derecho Fundamental a la Salud y Vida Digna',
    mechanism: 'ACCION_DE_TUTELA',
    normativeBasis: [
      'Artículos 11, 48, 49 y 86 de la Constitución Política de Colombia',
      'Ley Estatutaria 1751 de 2015 (Arts. 2, 6, 8 - Principio de Integralidad y Continuidad)',
      'Decreto 2591 de 1991 (Art. 7 - Medidas Provisionales Urgentes)'
    ],
    jurisprudence: [
      'Sentencia T-760 de 2008 (Reglas estructurales del derecho fundamental autónomo a la salud)',
      'Sentencia SU-508 de 2020 (Suministro inmediato de medicamentos, insumos y diagnóstico efectivo)',
      'Sentencia T-238 de 2024 (Prohibición de barreras administrativas y continuidad terapéutica)'
    ],
    slaDays: 10,
    provisionalHours: 48,
    subsidiarityRule: 'Directa ante riesgo inminente a la salud o vida digna (Excepción de perjuicio irremediable Art. 86 C.P.).',
    requiredEvidence: ['Historia clínica o fórmula médica vigente', 'Copia de documento de identidad', 'Orden de autorización o negativa de EPS (opcional si hay urgencia)']
  },
  TUTELA_AGUA: {
    id: 'TUTELA_AGUA',
    title: 'Acción de Tutela por Mínimo Vital de Agua Potable y Saneamiento Básico',
    mechanism: 'ACCION_DE_TUTELA',
    normativeBasis: [
      'Artículos 1, 11, 49, 79 y 366 de la Constitución Política de Colombia',
      'Observación General No. 15 del Comité DESC de la ONU (Bloque de Constitucionalidad Art. 93 C.P.)',
      'Ley 142 de 1994 (Régimen de Servicios Públicos Domiciliarios)'
    ],
    jurisprudence: [
      'Sentencia T-740 de 2011 (Garantía de mínimo vital de 50 litros diarios por persona)',
      'Sentencia T-118 de 2018 (Prohibición de suspensión absoluta en hogares con sujetos de especial protección)',
      'Sentencia T-223 de 2018 (Acceso al agua para consumo humano como derecho fundamental subjetivo)'
    ],
    slaDays: 10,
    provisionalHours: 48,
    subsidiarityRule: 'Procedencia directa cuando la suspensión o falta de suministro afecta el consumo humano básico.',
    requiredEvidence: ['Factura o recibo del servicio de acueducto / constancia veredal', 'Prueba de habitación de menores, adultos mayores o personas enfermas']
  },
  TUTELA_SILENCIO: {
    id: 'TUTELA_SILENCIO',
    title: 'Acción de Tutela por Vulneración al Derecho Fundamental de Petición (Silencio Administrativo)',
    mechanism: 'ACCION_DE_TUTELA',
    normativeBasis: [
      'Artículos 23 y 86 de la Constitución Política de Colombia',
      'Ley Estatutaria 1755 de 2015 (Art. 14 - Términos perentorios de 10 y 15 días hábiles)',
      'Artículo 83 del CPACA (Ley 1437 de 2011)'
    ],
    jurisprudence: [
      'Sentencia T-206 de 2018 (Núcleo esencial: respuesta pronta, de fondo, clara, precisa, congruente y notificada)',
      'Sentencia T-077 de 2018 (Improcedencia de otros medios judiciales ante vulneración del Art. 23 C.P.)'
    ],
    slaDays: 10,
    provisionalHours: null,
    subsidiarityRule: 'Único mecanismo judicial idóneo para conjurar la omisión de respuesta tras vencer los 15 días hábiles.',
    requiredEvidence: ['Copia del derecho de petición radicado', 'Constancia o número de radicado con fecha superior a 15 días hábiles']
  },
  CANCELACION_ACADEMICA_SALUD: {
    id: 'CANCELACION_ACADEMICA_SALUD',
    title: 'Petición Especial / Tutela por Cancelación Extemporánea de Semestre por Fuerza Mayor en Salud Mental',
    mechanism: 'PETICION_O_TUTELA_ACADEMICA',
    normativeBasis: [
      'Artículos 13, 26, 49, 67 y 69 de la Constitución Política (Límites a la Autonomía Universitaria)',
      'Ley 1616 de 2013 (Ley Nacional de Salud Mental - Enfoque preferente y ajustes razonables)',
      'Ley Estatutaria 1751 de 2015 y Ley 1755 de 2015'
    ],
    jurisprudence: [
      'Sentencia T-441 de 2012 (Exoneración de cargas administrativas desproporcionadas ante crisis médica)',
      'Sentencia T-574 de 2017 (Deber de flexibilización reglamentaria por fuerza mayor en salud mental)',
      'Sentencia T-310 de 2021 (Inaplicación de plazos ordinarios y exención de cobros punitivos por causa médica)',
      'Sentencia T-173 de 2023 y Sentencia T-238 de 2024 (Ajustes razonables y prohibición de barreras burocráticas en IES)'
    ],
    slaDays: 15,
    provisionalHours: 48,
    subsidiarityRule: 'Petición preferente ante Consejo de Facultad/Académico; Tutela inmediata si media expulsión o bloqueo de matrícula.',
    requiredEvidence: ['Certificado o constancia de acompañamiento psicológico/médico', 'Comunicación de coordinación o historial académico', 'Documento de identidad']
  },
  HABEAS_DATA_DATACREDITO: {
    id: 'HABEAS_DATA_DATACREDITO',
    title: 'Reclamación Previa y Habeas Data Financiero (Caducidad, Falta de Comunicación Previa y Retiro de Reporte)',
    mechanism: 'RECLAMO_HABEAS_DATA',
    normativeBasis: [
      'Artículo 15 de la Constitución Política (Derecho al Buen Nombre y Habeas Data)',
      'Ley Estatutaria 1266 de 2008 (Art. 12 - Deber de comunicación previa de 20 días calendario)',
      'Ley 2157 de 2021 (Ley de Borrón y Cuenta Nueva - Caducidad de 8 años e inmediatez de actualización)'
    ],
    jurisprudence: [
      'Sentencia C-1011 de 2008 (Constitucionalidad del principio de veracidad y temporalidad del dato financiero)',
      'Sentencia T-883 de 2013 (Retiro inmediato del reporte negativo por omisión de notificación previa de 20 días)',
      'Sentencia C-687 de 2014 (Principio de favorabilidad y caducidad del dato negativo)'
    ],
    slaDays: 15,
    provisionalHours: null,
    subsidiarityRule: 'Requisito de procedibilidad: solicitud previa ante la fuente o operador (Art. 16 Ley 1266/08); silencio a los 15 días habilita Tutela.',
    requiredEvidence: ['Pantallazo o historial de crédito (Datacrédito / TransUnion)', 'Paz y salvo o declaración de falta de notificación previa']
  },
  NULIDAD_CPACA: {
    id: 'NULIDAD_CPACA',
    title: 'Revocatoria Directa / Vía Gubernativa previa a Nulidad y Restablecimiento del Derecho (CPACA)',
    mechanism: 'VIA_GUBERNATIVA_CPACA',
    normativeBasis: [
      'Artículo 29 y 209 de la Constitución Política (Debido Proceso Administrativo)',
      'Artículos 93, 137 y 138 de la Ley 1437 de 2011 (CPACA)',
      'Artículo 161 del CPACA (Requisitos previos para demandar)'
    ],
    jurisprudence: [
      'Sentencia SU-061 de 2018 (Excepciones al principio de subsidiariedad frente al medio de control de nulidad)',
      'Sentencia C-259 de 2015 (Alcance de la revocatoria directa por oposición manifiesta a la Constitución)'
    ],
    slaDays: 15,
    provisionalHours: null,
    subsidiarityRule: 'Control de caducidad de 4 meses (120 días) desde la notificación del acto administrativo particular.',
    requiredEvidence: ['Copia del acto administrativo o resolución cuestionada', 'Constancia de fecha de notificación o comunicación']
  },
  PROTECCION_CAMPESINADO_TIERRAS: {
    id: 'PROTECCION_CAMPESINADO_TIERRAS',
    title: 'Acción Constitucional y Petición Agraria de Protección al Campesinado y Territorio',
    mechanism: 'ACCION_CONSTITUCIONAL_CAMPESINA',
    normativeBasis: [
      'Artículo 64 de la Constitución Política (Modificado por el Acto Legislativo 01 de 2023 - Campesinado como sujeto de especial protección)',
      'Artículos 65 y 66 de la Constitución Política (Seguridad alimentaria y crédito agropecuario)',
      'Decreto Ley 902 de 2017 (Formalización y acceso progresivo a la propiedad rural)'
    ],
    jurisprudence: [
      'Sentencia C-077 de 2017 (Especial protección constitucional al trabajador agrario y territorialidad campesina)',
      'Sentencia T-461 de 2016 (Debido proceso agrario y prohibición de desalojos arbitrarios sin alternativa habitacional)'
    ],
    slaDays: 10,
    provisionalHours: 48,
    subsidiarityRule: 'Reconocimiento reforzado de flexibilización probatoria y procedencia de tutela en zonas rurales dispersas.',
    requiredEvidence: ['Declaración de posesión, sana tenencia o vínculo veredal', 'Documento de identidad del núcleo familiar campesino']
  },
  ESTABILIDAD_LABORAL_MINIMO_VITAL: {
    id: 'ESTABILIDAD_LABORAL_MINIMO_VITAL',
    title: 'Acción de Tutela por Estabilidad Laboral Reforzada y Mínimo Vital (Fuero de Salud, Maternidad o Prepensionado)',
    mechanism: 'ACCION_DE_TUTELA',
    normativeBasis: [
      'Artículos 13, 25, 43, 47 y 53 de la Constitución Política de Colombia',
      'Artículo 26 de la Ley 361 de 1997 (Prohibición de despido sin autorización del Ministerio del Trabajo)',
      'Artículos 239 y 240 del Código Sustantivo del Trabajo'
    ],
    jurisprudence: [
      'Sentencia SU-049 de 2017 (Estabilidad ocupacional reforzada aplicable a contratos laborales y de prestación de servicios)',
      'Sentencia SU-075 de 2018 (Protección a la maternidad y lactancia)',
      'Sentencia T-386 de 2020 (Ineficacia del despido de trabajador en debilidad manifiesta por salud)'
    ],
    slaDays: 10,
    provisionalHours: 48,
    subsidiarityRule: 'Procede como mecanismo definitivo o transitorio ante afectación al mínimo vital y debilidad manifiesta.',
    requiredEvidence: ['Carta de terminación o prueba de vínculo laboral/contractual', 'Historia clínica, dictamen o prueba de embarazo/prepensión']
  },
  PETICION_GENERAL: {
    id: 'PETICION_GENERAL',
    title: 'Derecho Constitucional Fundamental de Petición en Interés Particular o de Información',
    mechanism: 'DERECHO_DE_PETICION',
    normativeBasis: [
      'Artículo 23 de la Constitución Política de Colombia',
      'Ley Estatutaria 1755 de 2015 (Artículos 13 al 33 del CPACA)',
      'Ley 1712 de 2014 (Ley de Transparencia y del Derecho de Acceso a la Información Pública)'
    ],
    jurisprudence: [
      'Sentencia C-951 de 2014 (Control previo de constitucionalidad de la Ley Estatutaria de Derecho de Petición)',
      'Sentencia T-230 de 2020 (Prohibición de exigir requisitos no previstos en la ley para radicar peticiones)'
    ],
    slaDays: 15,
    provisionalHours: null,
    subsidiarityRule: 'Procedimiento administrativo directo sin necesidad de abogado ni cobro de aranceles.',
    requiredEvidence: ['Relación cronológica de hechos', 'Copia simple de cédula de ciudadanía']
  }
};

function normalizeUpper(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

/**
 * Resuelve el municipio antioqueño desde texto libre o nombre directo (125 municipios).
 */
function resolveMunicipality(rawText = '') {
  const clean = normalizeUpper(rawText);
  const defaultEntry = antioquiaDir['medellin'] || antioquiaDir['MEDELLIN'] || null;
  if (!clean) return { key: 'MEDELLIN', data: defaultEntry, matched: false };

  const lowerKey = clean.toLowerCase().replace(/\s+/g, '_');
  if (antioquiaDir[lowerKey]) {
    return { key: lowerKey.toUpperCase(), data: antioquiaDir[lowerKey], matched: true };
  }
  if (antioquiaDir[clean]) {
    return { key: clean.toUpperCase(), data: antioquiaDir[clean], matched: true };
  }

  const keys = Object.keys(antioquiaDir);
  const sortedKeys = [...keys].sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const keyUpperSpaced = key.toUpperCase().replace(/_/g, ' ');
    const officialNorm = normalizeUpper(antioquiaDir[key]?.nombre_oficial || antioquiaDir[key]?.municipio || '');
    if (clean.includes(keyUpperSpaced) || (officialNorm && clean.includes(officialNorm))) {
      return { key: key.toUpperCase(), data: antioquiaDir[key], matched: true };
    }
  }

  const aliases = {
    'SANTAFE': 'santa_fe_de_antioquia',
    'SANTA FE': 'santa_fe_de_antioquia',
    'EL CARMEN': 'el_carmen_de_viboral',
    'CARMEN DE VIBORAL': 'el_carmen_de_viboral',
    'SAN VICENTE': 'san_vicente_ferrer',
    'DON MATIAS': 'donmatias',
    'SANTA ROSA': 'santa_rosa_de_osos',
    'PUERTO BERRIO': 'puerto_berrio'
  };

  for (const [alias, targetKey] of Object.entries(aliases)) {
    const found = antioquiaDir[targetKey] || antioquiaDir[targetKey.toUpperCase()];
    if (clean.includes(alias) && found) {
      return { key: targetKey.toUpperCase(), data: found, matched: true };
    }
  }

  return { key: 'MEDELLIN', data: defaultEntry, matched: false };
}

/**
 * Resuelve la universidad del G8 / Antioquia involucrada en un caso académico.
 */
function resolveUniversity(rawText = '') {
  const clean = normalizeUpper(rawText);
  const aliases = [
    { pattern: /UNILASALLISTA|LASALLISTA|CORPORACION UNIVERSITARIA LASALLISTA/i, key: 'UNILASALLISTA' },
    { pattern: /UNIVERSIDAD DE ANTIOQUIA|\bUDEA\b|U DE A/i, key: 'UDEA' },
    { pattern: /\bEAFIT\b/i, key: 'EAFIT' },
    { pattern: /BOLIVARIANA|\bUPB\b/i, key: 'UPB' },
    { pattern: /UNIVERSIDAD NACIONAL|UNAL/i, key: 'UNAL_MED' },
    { pattern: /UNIVERSIDAD DE MEDELLIN|\bUDEM\b/i, key: 'UDEM' },
    { pattern: /UNIVERSIDAD CES|\bCES\b/i, key: 'CES' },
    { pattern: /ESCUELA DE INGENIERIA|\bEIA\b/i, key: 'EIA' }
  ];

  for (const item of aliases) {
    if (item.pattern.test(clean) && universitiesDir[item.key]) {
      return { key: item.key, data: universitiesDir[item.key], matched: true };
    }
  }
  return { key: 'UDEA', data: universitiesDir['UDEA'] || null, matched: false };
}

/**
 * Calcula el Índice de Vulnerabilidad y Sujeto de Especial Protección Constitucional V(K).
 */
function evaluateVulnerabilityVector(rawText = '') {
  const t = String(rawText).toLowerCase();
  const factors = [];
  let score = 15;

  if (/(adulto mayor|tercera edad|abuel[oa]|7\d años|8\d años|9\d años|ancian[oa])/i.test(t)) {
    factors.push({ code: 'ADULTO_MAYOR', label: 'Adulto Mayor (Art. 46 C.P. - Sentencia T-252/17)', weight: 30 });
    score += 30;
  }
  if (/(niñ[oa]|menor de edad|beb[eé]|infante|adolescente|hijo pequeño)/i.test(t)) {
    factors.push({ code: 'MENOR_INTERES_SUPERIOR', label: 'Niño, Niña o Adolescente - Interés Superior (Art. 44 C.P.)', weight: 35 });
    score += 35;
  }
  if (/(embaraz|gestante|materna|lactante|parto)/i.test(t)) {
    factors.push({ code: 'MUJER_GESTANTE', label: 'Mujer Gestante o Lactante (Art. 43 C.P. - SU-075/18)', weight: 30 });
    score += 30;
  }
  if (/(campesin[oa]|vereda|parcela|finca|corregimiento|cultivo|jornalero|rural)/i.test(t)) {
    factors.push({ code: 'SUJETO_CAMPESINO', label: 'Población Campesina Rural (Art. 64 C.P. - Acto Legislativo 01 de 2023)', weight: 25 });
    score += 25;
  }
  if (/(ansiedad|depresi[oó]n|psiquiatr|psicol[oó]g|salud mental|crisis emocional|insomnio|p[aá]nico)/i.test(t)) {
    factors.push({ code: 'SALUD_MENTAL_PREFERENTE', label: 'Afectación en Salud Mental (Ley 1616 de 2013 - T-574/17)', weight: 25 });
    score += 25;
  }
  if (/(c[aá]ncer|oncol[oó]g|di[aá]lisis|renal|vih|discapacidad|invalidez|uci|urgencia vital|cirug[ií]a|insulina)/i.test(t)) {
    factors.push({ code: 'ENFERMEDAD_CATASTROFICA_O_DISCAPACIDAD', label: 'Condición Crítica de Salud / Discapacidad (Art. 47 C.P. - Ley 1751/15)', weight: 35 });
    score += 35;
  }
  if (/(v[ií]ctima|desplazad[oa]|conflicto armado|ruv|sisb[eé]n|madre cabeza de familia)/i.test(t)) {
    factors.push({ code: 'VULNERABILIDAD_SOCIOECONOMICA', label: 'Vulnerabilidad Socioeconómica / Víctima del Conflicto (Art. 13 C.P.)', weight: 25 });
    score += 25;
  }

  const normalizedScore = Math.min(100, score);
  return {
    score: normalizedScore,
    isSpecialProtectionSubject: factors.length > 0,
    urgencyLevel: normalizedScore >= 65 ? 'CRITICA_INMEDIATA' : normalizedScore >= 40 ? 'ALTA_PREFERENTE' : 'ORDINARIA_GARANTISTA',
    requiresProvisionalMeasure: normalizedScore >= 60 || /(urgente|peligro|vida|corte de agua|sin medicamentos|expulsi[oó]n)/i.test(t),
    factors
  };
}

/**
 * Calcula la Suficiencia Probatoria Psi(E) y el vector de términos/caducidad T(K).
 */
function evaluateProbativeAndTimeliness(rawText = '', categoryId = 'PETICION_GENERAL', attachmentsCount = 0) {
  const t = String(rawText).toLowerCase();
  let psiScore = 45;
  const detectedProofs = ['Declaración bajo gravedad de juramento (Presunción Constitucional de Buena Fe - Art. 83 C.P.)'];
  const missingProofs = [];

  if (/(historia cl[ií]nica|epicrisis|f[oó]rmula|orden m[eé]dica|certificado m[eé]dico|incapacidad|psicolog|psiquiatr)/i.test(t)) {
    psiScore += 25;
    detectedProofs.push('Soporte médico / psicológico / fórmula vigente');
  } else if (['TUTELA_SALUD', 'CANCELACION_ACADEMICA_SALUD'].includes(categoryId)) {
    missingProofs.push('Copia o foto de historia médica, fórmula o constancia de acompañamiento psicológico');
  }

  if (/(radicado|fecha|hace \d+ d[ií]as|meses|notificaron|resoluci[oó]n|factura|contrato|pantallazo)/i.test(t)) {
    psiScore += 20;
    detectedProofs.push('Referencia temporal / radicado / acto o soporte documental');
  } else {
    missingProofs.push('Fecha aproximada de los hechos o número de radicado previo (si existe)');
  }

  if (/\b\d{6,11}\b/.test(t) || /(c[eé]dula|cc\b|ti\b|identificad[oa])/i.test(t)) {
    psiScore += 10;
    detectedProofs.push('Identificación ciudadana verificable');
  }

  if (attachmentsCount > 0) {
    psiScore += Math.min(20, attachmentsCount * 10);
    detectedProofs.push(`${attachmentsCount} anexo(s) probatorio(s) adjuntado(s)`);
  }

  psiScore = Math.min(100, psiScore);

  const daysMatch = t.match(/hace\s+(\d+)\s*(d[ií]as|meses)/i);
  let elapsedDays = null;
  if (daysMatch) {
    const qty = parseInt(daysMatch[1], 10);
    elapsedDays = daysMatch[2].startsWith('mes') ? qty * 30 : qty;
  }

  let timelinessStatus = 'VIGENTE_HABILITADO';
  let timelinessNote = 'Acción dentro del término constitucional de inmediatez y oportunidad legal.';

  if (categoryId === 'TUTELA_SILENCIO') {
    if (elapsedDays !== null && elapsedDays < 15) {
      timelinessStatus = 'PREMATURO_EN_TERMINO';
      timelinessNote = `Han transcurrido ~${elapsedDays} días. La entidad aún cuenta con término legal (15 días hábiles según Ley 1755/15) salvo riesgo inminente.`;
    } else {
      timelinessStatus = 'SILENCIO_CONFIGURADO';
      timelinessNote = 'Vencimiento del término perentorio del Art. 14 de la Ley 1755 de 2015: procede Tutela inmediata por vulneración al Art. 23 C.P.';
    }
  } else if (categoryId === 'NULIDAD_CPACA' && elapsedDays !== null && elapsedDays > 120) {
    timelinessStatus = 'ALERTA_CADUCIDAD_CPACA';
    timelinessNote = `Se detectan ~${elapsedDays} días (> 4 meses del Art. 138 CPACA). Se recomienda Solicitud de Revocatoria Directa (Art. 93 CPACA) o Tutela excepcional si hay perjuicio irremediable.`;
  }

  return {
    psiScore,
    sufficiencyLevel: psiScore >= 75 ? 'SOLIDA_RADICABLE' : psiScore >= 55 ? 'SUFICIENTE_POR_BUENA_FE' : 'REQUIERE_COMPLEMENTO_MINIMO',
    detectedProofs,
    missingProofs,
    elapsedDays,
    timelinessStatus,
    timelinessNote
  };
}

/**
 * Construye pretensiones claras, precisas e incondicionadas para cada ruta.
 */
function buildUnconditionedPetitionsForRoute(routeId, targetEntity, vulnerability) {
  const petitions = [];

  if (vulnerability?.requiresProvisionalMeasure && routeId.startsWith('TUTELA_')) {
    petitions.push(
      `MEDIDA PROVISIONAL DE URGENCIA (Art. 7 Decreto 2591 de 1991): Ordenar de manera inmediata y dentro de las cuarenta y ocho (48) horas siguientes a la admisión, la cesación de la vulneración por parte de ${targetEntity} para evitar un perjuicio irremediable.`
    );
  }

  switch (routeId) {
    case 'TUTELA_SALUD':
      petitions.push(
        `PRIMERO: TUTELAR mis derechos fundamentales a la salud, a la vida en condiciones dignas y a la seguridad social, vulnerados por ${targetEntity}.`,
        `SEGUNDO: ORDENAR a ${targetEntity} que, en el término improrrogable de cuarenta y ocho (48) horas, autorice y entregue efectivamente los medicamentos, procedimientos o valoraciones médicas ordenadas por el profesional tratante.`,
        `TERCERO: ORDENAR el TRATAMIENTO INTEGRAL (Art. 8 Ley 1751 de 2015 y Sentencia SU-508 de 2020) derivado del diagnóstico actual, exonerándome de trámites administrativos fragmentados.`
      );
      break;
    case 'TUTELA_AGUA':
      petitions.push(
        `PRIMERO: TUTELAR el derecho fundamental al agua potable para consumo humano, a la vida digna y a la salubridad pública.`,
        `SEGUNDO: ORDENAR a ${targetEntity} la reconexión o suministro diario mínimo vital de al menos cincuenta (50) litros de agua potable por persona (Sentencia T-740 de 2011) en el inmueble habitado por el accionante.`,
        `TERCERO: ORDENAR la suscripción de un acuerdo de pago proporcional a la capacidad socioeconómica real sin suspender el flujo vital.`
      );
      break;
    case 'CANCELACION_ACADEMICA_SALUD': {
      const standing = buildStandingProtectionPetitions(
        [{ codigo: 'MAT-01', nombre: 'Asignaturas del período académico activo' }],
        '2026-1'
      );
      petitions.push(
        `PRIMERO: ${standing.primera}`,
        `SEGUNDO: ${standing.segunda}`,
        `TERCERO: ${standing.tercera}`
      );
      break;
    }
    case 'HABEAS_DATA_DATACREDITO':
      petitions.push(
        `PRIMERO: TUTELAR y GARANTIZAR mi derecho fundamental al Habeas Data, buen nombre y autodeterminación informática (Art. 15 C.P., Ley 1266 de 2008 y Ley 2157 de 2021).`,
        `SEGUNDO: ORDENAR a ${targetEntity} la eliminación y actualización inmediata del reporte negativo ante Datacrédito Experian y TransUnion por omisión de la notificación previa de veinte (20) días calendario (Art. 12 Ley 1266/08) o configuración de caducidad.`,
        `TERCERO: EXPEDIR constancia escrita de paz y salvo o actualización favorable dentro de los quince (15) días hábiles siguientes.`
      );
      break;
    case 'ESTABILIDAD_LABORAL_MINIMO_VITAL':
      petitions.push(
        `PRIMERO: TUTELAR mis derechos fundamentales a la estabilidad laboral reforzada, al mínimo vital, a la seguridad social y a la dignidad humana (Sentencia SU-049 de 2017 y Art. 26 Ley 361 de 1997).`,
        `SEGUNDO: DECLARAR la ineficacia de la desvinculación realizada sin autorización previa del Inspector del Trabajo y ORDENAR el reintegro inmediato a un cargo de igual o superior jerarquía compatible con las recomendaciones médicas.`,
        `TERCERO: ORDENAR el pago de salarios, prestaciones y aportes a seguridad social dejados de percibir desde la desvinculación hasta el reintegro efectivo.`
      );
      break;
    case 'PROTECCION_CAMPESINADO_TIERRAS':
      petitions.push(
        `PRIMERO: AMPARAR mis derechos fundamentales como sujeto de especial protección constitucional campesina (Art. 64 C.P. modificado por el Acto Legislativo 01 de 2023), al debido proceso agrario y a la permanencia en el territorio.`,
        `SEGUNDO: ORDENAR a ${targetEntity} abstenerse de ejecutar medidas de desalojo o perturbación sin agotar las garantías de caracterización rural, defensa técnica y reubicación digna.`,
        `TERCERO: PRIORIZAR la inscripción y trámite del expediente agrario con enfoque diferencial territorial.`
      );
      break;
    case 'TUTELA_SILENCIO':
      petitions.push(
        `PRIMERO: TUTELAR mi derecho fundamental de petición consagrado en el artículo 23 de la Constitución Política y regulado por la Ley Estatutaria 1755 de 2015.`,
        `SEGUNDO: ORDENAR a ${targetEntity} que, dentro de las cuarenta y ocho (48) horas siguientes a la notificación del fallo, emita y notifique una respuesta clara, precisa, de fondo y congruente con lo solicitado.`
      );
      break;
    default:
      petitions.push(
        `PRIMERO: Dar trámite oportuno y emitir respuesta de fondo, clara, precisa y congruente dentro del término legal perentorio de quince (15) días hábiles (Art. 23 C.P. y Art. 14 Ley 1755 de 2015).`,
        `SEGUNDO: Adoptar las medidas correctivas y administrativas necesarias para garantizar la efectividad material de los derechos invocados (Art. 2 C.P.).`,
        `TERCERO: Notificar la decisión al canal electrónico o número de WhatsApp suministrado en el acápite de notificaciones (Art. 56 CPACA).`
      );
      break;
  }

  return petitions;
}

/**
 * Motor Principal de Subsunción Jurídica Formal:
 * S(K) = < H, E, T, V >
 */
function runFormalLegalSubsunction(rawInput = '', options = {}) {
  const voiceAnalysis = parseVoiceFeedback(rawInput);
  const sanitizedLexicon = sanitizeLexicon(rawInput);
  const cleanFactsText = filterAiSlop(sanitizedLexicon);
  const t = String(rawInput).toLowerCase();

  let routeId = 'PETICION_GENERAL';
  let targetEntity = 'Entidad Pública / Particular en Función Pública';

  if (/(semestre|universidad|facultad|matr[ií]cula|cancelaci[oó]n|cancelar el semestre|notas|cr[eé]ditos acad[eé]micos|consejo acad[eé]mico|udea|eafit|upb|unilasallista|unal)/i.test(t)) {
    routeId = 'CANCELACION_ACADEMICA_SALUD';
    const uni = resolveUniversity(rawInput);
    targetEntity = uni.data ? `Consejo de Facultad / Académico - ${uni.data.nombre_oficial}` : 'Consejo de Facultad / Rectoría Universitaria';
  } else if (/(eps|salud|medicamento|insulina|cirug[ií]a|citas? m[eé]dicas?|tratamiento|urgencias|hospital|cl[ií]nica|sura|savia|nueva eps|sanitas|compensar|coosalud)/i.test(t)) {
    routeId = 'TUTELA_SALUD';
    if (/savia/i.test(t)) targetEntity = 'Savia Salud EPS';
    else if (/sura/i.test(t)) targetEntity = 'EPS Sura';
    else if (/nueva eps/i.test(t)) targetEntity = 'Nueva EPS';
    else if (/sanitas/i.test(t)) targetEntity = 'EPS Sanitas';
    else if (/coosalud/i.test(t)) targetEntity = 'Coosalud EPS';
    else targetEntity = 'Entidad Promotora de Salud (EPS) / IPS Tratante';
  } else if (/(agua|acueducto|alcantarillado|cortaron el agua|sin suministro de agua|epm|servicios p[uú]blicos|m[ií]nimo vital de agua)/i.test(t)) {
    routeId = 'TUTELA_AGUA';
    targetEntity = /epm|empresas p[uú]blicas/i.test(t) ? 'Empresas Públicas de Medellín (EPM) / Acueducto' : 'Empresa Prestadora de Servicios Públicos / Acueducto Municipal';
  } else if (/(datacr[eé]dito|cifin|transunion|reporte negativo|centrales de riesgo|borr[oó]n y cuenta nueva|habeas data)/i.test(t)) {
    routeId = 'HABEAS_DATA_DATACREDITO';
    targetEntity = 'Fuente de Información Financiera y Operadores (Datacrédito Experian / TransUnion)';
  } else if (/(despidieron|despido|embarazada en el trabajo|incapacidad laboral|no me pagan el sueldo|liquidaci[oó]n|estabilidad laboral|contrato de trabajo)/i.test(t)) {
    routeId = 'ESTABILIDAD_LABORAL_MINIMO_VITAL';
    targetEntity = 'Empleador / Contratante y Ministerio del Trabajo';
  } else if (/(campesin[oa]|tierras|predio rural|vereda|desalojo rural|agencia nacional de tierras|\bant\b|unidad de restituci[oó]n)/i.test(t)) {
    routeId = 'PROTECCION_CAMPESINADO_TIERRAS';
    targetEntity = 'Agencia Nacional de Tierras (ANT) / Alcaldía e Inspección Municipal';
  } else if (/(no me responden|no han contestado|silencio administrativo|radicado hace|vencieron los 15 d[ií]as|no dieron respuesta)/i.test(t)) {
    routeId = 'TUTELA_SILENCIO';
    targetEntity = 'Autoridad Pública o Entidad Omisiva';
  } else if (/(resoluci[oó]n|acto administrativo|multa|sanci[oó]n|nulidad|revocatoria directa|comparendo)/i.test(t)) {
    routeId = 'NULIDAD_CPACA';
    targetEntity = 'Autoridad Administrativa Expedidora del Acto';
  }

  const routeCatalog = LEGAL_ROUTES_CATALOG[routeId] || LEGAL_ROUTES_CATALOG.PETICION_GENERAL;
  const territory = resolveMunicipality(options.municipalityHint || rawInput);
  const university = routeId === 'CANCELACION_ACADEMICA_SALUD' ? resolveUniversity(rawInput) : null;
  const vulnerability = evaluateVulnerabilityVector(rawInput);
  const probative = evaluateProbativeAndTimeliness(rawInput, routeId, options.attachmentsCount || 0);

  let curatedNarrative = enforceAffirmativeStudentStatus(cleanFactsText);
  if (routeId === 'CANCELACION_ACADEMICA_SALUD' && voiceAnalysis.wantsRemorseOrHumanTouch) {
    curatedNarrative += '\n\n' + injectRemorseParagraph();
  }

  const petitionsDraft = buildUnconditionedPetitionsForRoute(routeId, targetEntity, vulnerability);
  const suspensiveDetected = detectSuspensiveClauses(petitionsDraft.join(' '));
  const pageBudget = validateDocumentBudget({
    factualNarrative: curatedNarrative,
    legalGrounds: routeCatalog.normativeBasis.join(' ') + ' ' + routeCatalog.jurisprudence.join(' '),
    petitions: petitionsDraft.join(' ')
  });
  const evidenceBundle = curateEvidenceBundle(options.evidenceParams || {});

  const munData = territory.data || {};
  const routingDestination = {
    entity: targetEntity,
    municipality: munData.nombre_oficial || munData.municipio || 'Medellín',
    subregion: munData.subregion || 'Valle de Aburrá',
    juzgadoName: munData.juzgado_reparto?.nombre || munData.juzgado || 'Juzgado Constitucional de Reparto',
    juzgadoEmail: munData.juzgado_reparto?.email || munData.email_juzgado || 'recepcionmemoriales@cendoj.ramajudicial.gov.co',
    personeriaName: munData.personeria?.nombre || munData.personeria || 'Personería Municipal',
    personeriaEmail: munData.personeria?.email || munData.email_personeria || 'info@personeriamedellin.gov.co',
    personeriaPhone: munData.personeria?.telefono || '(604) 3849999',
    comisariaEmail: munData.comisaria_familia?.email || null
  };

  if (university?.data) {
    routingDestination.universityName = university.data.nombre_oficial;
    routingDestination.universityEmail = university.data.consejo_facultad?.email || university.data.consultorio_juridico?.email;
    routingDestination.consultorioJuridico = university.data.consultorio_juridico;
  }

  return {
    timestamp: new Date().toISOString(),
    formula: 'S(K) = < H, E, T, V >',
    route: routeCatalog,
    targetEntity,
    territory: {
      key: territory.key,
      matchedFromInput: territory.matched,
      ...routingDestination
    },
    vulnerability,
    probative,
    curatedFacts: curatedNarrative,
    unconditionedPetitions: petitionsDraft,
    audits: {
      voiceIntent: voiceAnalysis,
      suspensiveClausesFound: suspensiveDetected.length,
      pageBudget,
      evidenceBundle
    },
    economicTelemetry: {
      estimatedTokens: Math.max(850, Math.round(String(rawInput).length * 3.2)),
      marginalCostUSD: 0.0057,
      marginalCostCOP: 24,
      traditionalLawyerCostCOP: 650000
    }
  };
}

module.exports = {
  LEGAL_ROUTES_CATALOG,
  resolveMunicipality,
  resolveUniversity,
  evaluateVulnerabilityVector,
  evaluateProbativeAndTimeliness,
  buildUnconditionedPetitionsForRoute,
  runFormalLegalSubsunction
};
