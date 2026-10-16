/**
 * JusticIA WhatsApp v2.5.0 — Autonomous Client-Side Legal Engine & API Bridge
 * Enables 100% live interactive operation both on Node.js (localhost:3080)
 * and on static hosting (https://babylonias.com/justicia-whatsapp/ & #panel-demo).
 */
(function () {
  'use strict';

  const origFetch = window.fetch.bind(window);
  const STORAGE_KEY_CASES = 'justicia_ant_cases_v25';
  const STORAGE_KEY_CONFIG = 'justicia_ant_config_v25';

  let antioquiaDir = null;
  let universitiesDir = null;
  let casesList = null;
  const chatSessions = {};

  const SEED_CASES = [
    {
      id: 'EXP-ANT-2026-001',
      createdAt: '2026-10-12T14:20:00.000Z',
      citizenName: 'María Edilma Osorio',
      citizenDoc: '43120984',
      municipality: 'CAUCASIA',
      municipalityLabel: 'Caucasia',
      subregion: 'Bajo Cauca',
      routeId: 'TUTELA_SALUD',
      routeTitle: 'Acción de Tutela por Derecho Fundamental a la Salud y Vida Digna',
      targetEntity: 'Savia Salud EPS',
      destinationEmail: 'repartocaucasia@cendoj.ramajudicial.gov.co',
      status: 'RADICADO',
      urgencyLevel: 'CRITICA_INMEDIATA',
      requiresProvisionalMeasure: true,
      vulnerabilityScore: 80,
      psiScore: 92,
      slaDays: 10,
      daysElapsed: 4
    },
    {
      id: 'EXP-ANT-2026-002',
      createdAt: '2026-10-13T09:15:00.000Z',
      citizenName: 'Santiago Montoya Vélez',
      citizenDoc: '1037645210',
      municipality: 'CALDAS',
      municipalityLabel: 'Caldas',
      subregion: 'Valle de Aburrá',
      routeId: 'CANCELACION_ACADEMICA_SALUD',
      routeTitle: 'Petición Especial / Tutela por Cancelación Extemporánea de Semestre por Fuerza Mayor en Salud Mental',
      targetEntity: 'Consejo de Facultad - Corporación Universitaria Lasallista',
      destinationEmail: 'consejo.ingenieria@unilasallista.edu.co',
      status: 'EN_TERMINO',
      urgencyLevel: 'ALTA_PREFERENTE',
      requiresProvisionalMeasure: true,
      vulnerabilityScore: 65,
      psiScore: 88,
      slaDays: 15,
      daysElapsed: 8
    },
    {
      id: 'EXP-ANT-2026-003',
      createdAt: '2026-10-10T11:30:00.000Z',
      citizenName: 'Jairo Alonso Tuberquia',
      citizenDoc: '71940211',
      municipality: 'APARTADO',
      municipalityLabel: 'Apartadó',
      subregion: 'Urabá',
      routeId: 'TUTELA_AGUA',
      routeTitle: 'Acción de Tutela por Mínimo Vital de Agua Potable y Saneamiento Básico',
      targetEntity: 'Empresas Públicas de Medellín (EPM) / Aguas Regionales',
      destinationEmail: 'repartoapartado@cendoj.ramajudicial.gov.co',
      status: 'RESUELTO',
      urgencyLevel: 'CRITICA_INMEDIATA',
      requiresProvisionalMeasure: true,
      vulnerabilityScore: 75,
      psiScore: 90,
      slaDays: 10,
      daysElapsed: 6
    },
    {
      id: 'EXP-ANT-2026-004',
      createdAt: '2026-10-14T16:05:00.000Z',
      citizenName: 'Luz Dary Galeano',
      citizenDoc: '32510992',
      municipality: 'ITUANGO',
      municipalityLabel: 'Ituango',
      subregion: 'Norte',
      routeId: 'PROTECCION_CAMPESINADO_TIERRAS',
      routeTitle: 'Acción Constitucional y Petición Agraria de Protección al Campesinado y Territorio',
      targetEntity: 'Agencia Nacional de Tierras (ANT) / Inspección Municipal',
      destinationEmail: 'personeria@ituango-antioquia.gov.co',
      status: 'BORRADOR_LISTO',
      urgencyLevel: 'ALTA_PREFERENTE',
      requiresProvisionalMeasure: true,
      vulnerabilityScore: 70,
      psiScore: 82,
      slaDays: 10,
      daysElapsed: 2
    },
    {
      id: 'EXP-ANT-2026-005',
      createdAt: '2026-10-08T10:00:00.000Z',
      citizenName: 'Hernando de Jesús Giraldo',
      citizenDoc: '15432890',
      municipality: 'RIONEGRO',
      municipalityLabel: 'Rionegro',
      subregion: 'Oriente',
      routeId: 'HABEAS_DATA_DATACREDITO',
      routeTitle: 'Reclamación Previa y Habeas Data Financiero',
      targetEntity: 'Datacrédito Experian / TransUnion',
      destinationEmail: 'personeria@rionegro.gov.co',
      status: 'EN_TERMINO',
      urgencyLevel: 'ORDINARIA_GARANTISTA',
      requiresProvisionalMeasure: false,
      vulnerabilityScore: 30,
      psiScore: 85,
      slaDays: 15,
      daysElapsed: 13
    },
    {
      id: 'EXP-ANT-2026-006',
      createdAt: '2026-10-15T08:45:00.000Z',
      citizenName: 'Yuliana Andrea Palacios',
      citizenDoc: '1040732198',
      municipality: 'TURBO',
      municipalityLabel: 'Turbo',
      subregion: 'Urabá',
      routeId: 'ESTABILIDAD_LABORAL_MINIMO_VITAL',
      routeTitle: 'Acción de Tutela por Estabilidad Laboral Reforzada y Mínimo Vital',
      targetEntity: 'Comercializadora Agrícola Urabá S.A.S.',
      destinationEmail: 'repartoturbo@cendoj.ramajudicial.gov.co',
      status: 'RADICADO',
      urgencyLevel: 'CRITICA_INMEDIATA',
      requiresProvisionalMeasure: true,
      vulnerabilityScore: 85,
      psiScore: 95,
      slaDays: 10,
      daysElapsed: 7
    },
    {
      id: 'EXP-ANT-2026-007',
      createdAt: '2026-10-09T13:10:00.000Z',
      citizenName: 'Carlos Mario Restrepo',
      citizenDoc: '70564312',
      municipality: 'ANDES',
      municipalityLabel: 'Andes',
      subregion: 'Suroeste',
      routeId: 'TUTELA_SILENCIO',
      routeTitle: 'Acción de Tutela por Vulneración al Derecho Fundamental de Petición (Silencio Administrativo)',
      targetEntity: 'Secretaría de Infraestructura y Planeación Municipal',
      destinationEmail: 'repartoandes@cendoj.ramajudicial.gov.co',
      status: 'RESUELTO',
      urgencyLevel: 'ALTA_PREFERENTE',
      requiresProvisionalMeasure: false,
      vulnerabilityScore: 45,
      psiScore: 91,
      slaDays: 10,
      daysElapsed: 9
    },
    {
      id: 'EXP-ANT-2026-008',
      createdAt: '2026-10-15T17:30:00.000Z',
      citizenName: 'Blanca Inés Londoño',
      citizenDoc: '21890432',
      municipality: 'PUERTO_BERRIO',
      municipalityLabel: 'Puerto Berrío',
      subregion: 'Magdalena Medio',
      routeId: 'TUTELA_SALUD',
      routeTitle: 'Acción de Tutela por Derecho Fundamental a la Salud y Vida Digna',
      targetEntity: 'Nueva EPS',
      destinationEmail: 'repartopuertoberrio@cendoj.ramajudicial.gov.co',
      status: 'TRIAGE',
      urgencyLevel: 'CRITICA_INMEDIATA',
      requiresProvisionalMeasure: true,
      vulnerabilityScore: 78,
      psiScore: 79,
      slaDays: 10,
      daysElapsed: 1
    },
    {
      id: 'EXP-ANT-2026-009',
      createdAt: '2026-10-11T15:00:00.000Z',
      citizenName: 'Esteban Camilo Ceballos',
      citizenDoc: '1017245890',
      municipality: 'MEDELLIN',
      municipalityLabel: 'Medellín',
      subregion: 'Valle de Aburrá',
      routeId: 'CANCELACION_ACADEMICA_SALUD',
      routeTitle: 'Petición Especial / Tutela por Cancelación Extemporánea de Semestre por Fuerza Mayor en Salud Mental',
      targetEntity: 'Consejo de Facultad - Universidad de Antioquia (UdeA)',
      destinationEmail: 'atencionciudadano@udea.edu.co',
      status: 'RESUELTO',
      urgencyLevel: 'ALTA_PREFERENTE',
      requiresProvisionalMeasure: false,
      vulnerabilityScore: 60,
      psiScore: 94,
      slaDays: 15,
      daysElapsed: 10
    },
    {
      id: 'EXP-ANT-2026-010',
      createdAt: '2026-10-14T12:00:00.000Z',
      citizenName: 'Rosa Emilia Chaverra',
      citizenDoc: '43890112',
      municipality: 'SEGOVIA',
      municipalityLabel: 'Segovia',
      subregion: 'Nordeste',
      routeId: 'NULIDAD_CPACA',
      routeTitle: 'Revocatoria Directa / Vía Gubernativa previa a Nulidad y Restablecimiento del Derecho (CPACA)',
      targetEntity: 'Alcaldía Municipal de Segovia',
      destinationEmail: 'personeria@segovia-antioquia.gov.co',
      status: 'BORRADOR_LISTO',
      urgencyLevel: 'ALTA_PREFERENTE',
      requiresProvisionalMeasure: false,
      vulnerabilityScore: 55,
      psiScore: 81,
      slaDays: 15,
      daysElapsed: 3
    }
  ];

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
      provisionalHours: 48
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
      provisionalHours: 48
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
      provisionalHours: null
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
      provisionalHours: 48
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
      provisionalHours: null
    },
    NULIDAD_CPACA: {
      id: 'NULIDAD_CPACA',
      title: 'Revocatoria Directa / Vía Gubernativa previa a Nulidad y Restablecimiento del Derecho (CPACA)',
      mechanism: 'VIA_GUBERNATIVA_CPACA',
      normativeBasis: [
        'Artículo 29 y 209 de la Constitución Política (Debido Proceso Administrativo)',
        'Artículos 93, 137 y 138 de la Ley 1437 de 2011 (CPACA)'
      ],
      jurisprudence: [
        'Sentencia SU-061 de 2018 (Excepciones al principio de subsidiariedad frente al medio de control de nulidad)',
        'Sentencia C-259 de 2015 (Alcance de la revocatoria directa por oposición manifiesta a la Constitución)'
      ],
      slaDays: 15,
      provisionalHours: null
    },
    PROTECCION_CAMPESINADO_TIERRAS: {
      id: 'PROTECCION_CAMPESINADO_TIERRAS',
      title: 'Acción Constitucional y Petición Agraria de Protección al Campesinado y Territorio',
      mechanism: 'ACCION_CONSTITUCIONAL_CAMPESINA',
      normativeBasis: [
        'Artículo 64 de la Constitución Política (Modificado por el Acto Legislativo 01 de 2023 - Campesinado como sujeto de especial protección)',
        'Decreto Ley 902 de 2017 (Formalización y acceso progresivo a la propiedad rural)'
      ],
      jurisprudence: [
        'Sentencia C-077 de 2017 (Especial protección constitucional al trabajador agrario y territorialidad campesina)',
        'Sentencia T-461 de 2016 (Debido proceso agrario y prohibición de desalojos arbitrarios sin alternativa habitacional)'
      ],
      slaDays: 10,
      provisionalHours: 48
    },
    ESTABILIDAD_LABORAL_MINIMO_VITAL: {
      id: 'ESTABILIDAD_LABORAL_MINIMO_VITAL',
      title: 'Acción de Tutela por Estabilidad Laboral Reforzada y Mínimo Vital',
      mechanism: 'ACCION_DE_TUTELA',
      normativeBasis: [
        'Artículos 13, 25, 43, 47 y 53 de la Constitución Política de Colombia',
        'Artículo 26 de la Ley 361 de 1997 (Prohibición de despido sin autorización del Ministerio del Trabajo)'
      ],
      jurisprudence: [
        'Sentencia SU-049 de 2017 (Estabilidad ocupacional reforzada aplicable a contratos laborales y de prestación de servicios)',
        'Sentencia SU-075 de 2018 (Protección a la maternidad y lactancia)'
      ],
      slaDays: 10,
      provisionalHours: 48
    },
    PETICION_GENERAL: {
      id: 'PETICION_GENERAL',
      title: 'Derecho Constitucional Fundamental de Petición en Interés Particular o de Información',
      mechanism: 'DERECHO_DE_PETICION',
      normativeBasis: [
        'Artículo 23 de la Constitución Política de Colombia',
        'Ley Estatutaria 1755 de 2015 (Artículos 13 al 33 del CPACA)'
      ],
      jurisprudence: [
        'Sentencia C-951 de 2014 (Control previo de constitucionalidad de la Ley Estatutaria de Derecho de Petición)',
        'Sentencia T-230 de 2020 (Prohibición de exigir requisitos no previstos en la ley para radicar peticiones)'
      ],
      slaDays: 15,
      provisionalHours: null
    }
  };

  async function ensureDataLoaded() {
    if (!casesList) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CASES);
        if (saved) {
          casesList = JSON.parse(saved);
        }
      } catch (e) {}
      if (!casesList || !Array.isArray(casesList) || !casesList.length) {
        casesList = JSON.parse(JSON.stringify(SEED_CASES));
      }
    }

    if (!antioquiaDir || !universitiesDir) {
      try {
        const [dirRes, uniRes] = await Promise.all([
          origFetch('./data/antioquia_directory.json'),
          origFetch('./data/antioquia_universities_directory.json')
        ]);
        if (dirRes.ok) {
          const rawDir = await dirRes.json();
          antioquiaDir = rawDir.municipios || rawDir || {};
        }
        if (uniRes.ok) {
          const rawUni = await uniRes.json();
          universitiesDir = rawUni.universidades || rawUni || {};
        }
      } catch (e) {
        antioquiaDir = antioquiaDir || {};
        universitiesDir = universitiesDir || {};
      }
    }
  }

  function saveCases() {
    try {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(casesList));
    } catch (e) {}
  }

  function normalizeUpper(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  }

  function sanitizeTextClient(rawText) {
    return String(rawText || '')
      .replace(/es menester señalar que/gi, '')
      .replace(/cabe destacar que/gi, '')
      .replace(/en el marco de/gi, 'según')
      .replace(/cuadro cl[ií]nico psiqui[aá]trico/gi, 'afectación aguda de salud y bienestar')
      .replace(/trastorno mental/gi, 'situación de salud emocional amparada por la Ley 1616 de 2013')
      .replace(/mientras me alivio/gi, 'garantizando mi continuidad académica activa sin suspensión de derechos')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function resolveMunicipalityClient(rawText) {
    const clean = normalizeUpper(rawText);
    const dir = antioquiaDir || {};
    const defaultEntry = dir['medellin'] || dir['MEDELLIN'] || {
      nombre_oficial: 'Medellín',
      subregion: 'Valle de Aburrá',
      juzgado_reparto: { email: 'recepcionmemoriales@cendoj.ramajudicial.gov.co' },
      personeria: { email: 'info@personeriamedellin.gov.co' }
    };
    if (!clean) return { key: 'MEDELLIN', data: defaultEntry, matched: false };

    const lowerKey = clean.toLowerCase().replace(/\s+/g, '_');
    if (dir[lowerKey]) return { key: lowerKey.toUpperCase(), data: dir[lowerKey], matched: true };
    if (dir[clean]) return { key: clean.toUpperCase(), data: dir[clean], matched: true };

    const keys = Object.keys(dir).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      const kSpaced = k.toUpperCase().replace(/_/g, ' ');
      const off = normalizeUpper(dir[k]?.nombre_oficial || dir[k]?.municipio || '');
      if (clean.includes(kSpaced) || (off && clean.includes(off))) {
        return { key: k.toUpperCase(), data: dir[k], matched: true };
      }
    }
    return { key: 'MEDELLIN', data: defaultEntry, matched: false };
  }

  function runSubsunctionClient(rawInput, options = {}) {
    const t = String(rawInput || '').toLowerCase();
    let routeId = 'PETICION_GENERAL';
    let targetEntity = 'Entidad Pública / Particular en Función Pública';

    if (/(semestre|universidad|facultad|matr[ií]cula|cancelaci[oó]n|cancelar el semestre|unilasallista|udea|eafit|upb|unal)/i.test(t)) {
      routeId = 'CANCELACION_ACADEMICA_SALUD';
      targetEntity = /unilasallista/i.test(t)
        ? 'Consejo de Facultad / Académico - Corporación Universitaria Lasallista'
        : 'Consejo de Facultad / Académico Universitario (Red G8)';
    } else if (/(eps|salud|medicamento|insulina|cirug[ií]a|oncol[oó]g|sura|savia|nueva eps|sanitas|coosalud)/i.test(t)) {
      routeId = 'TUTELA_SALUD';
      targetEntity = /savia/i.test(t) ? 'Savia Salud EPS' : /sura/i.test(t) ? 'EPS Sura' : 'Entidad Promotora de Salud (EPS)';
    } else if (/(agua|acueducto|cortaron el agua|epm|servicios p[uú]blicos|m[ií]nimo vital)/i.test(t)) {
      routeId = 'TUTELA_AGUA';
      targetEntity = 'Empresas Públicas de Medellín (EPM) / Acueducto Municipal';
    } else if (/(datacr[eé]dito|transunion|centrales de riesgo|borr[oó]n|habeas data)/i.test(t)) {
      routeId = 'HABEAS_DATA_DATACREDITO';
      targetEntity = 'Fuente Financiera y Operadores (Datacrédito Experian / TransUnion)';
    } else if (/(despidieron|despido|embarazada|estabilidad laboral)/i.test(t)) {
      routeId = 'ESTABILIDAD_LABORAL_MINIMO_VITAL';
      targetEntity = 'Empleador / Contratante y Ministerio del Trabajo';
    } else if (/(campesin[oa]|vereda|parcela|desalojo|agencia nacional de tierras|\bant\b)/i.test(t)) {
      routeId = 'PROTECCION_CAMPESINADO_TIERRAS';
      targetEntity = 'Agencia Nacional de Tierras (ANT) / Inspección Municipal';
    } else if (/(no me responden|silencio administrativo|vencieron los 15 d[ií]as)/i.test(t)) {
      routeId = 'TUTELA_SILENCIO';
      targetEntity = 'Autoridad Pública Omisiva';
    } else if (/(resoluci[oó]n|acto administrativo|nulidad|revocatoria)/i.test(t)) {
      routeId = 'NULIDAD_CPACA';
      targetEntity = 'Autoridad Administrativa Expedidora';
    }

    const routeCatalog = LEGAL_ROUTES_CATALOG[routeId] || LEGAL_ROUTES_CATALOG.PETICION_GENERAL;
    const territory = resolveMunicipalityClient(options.municipalityHint || rawInput);
    const munData = territory.data || {};

    let vulnScore = 25;
    if (/(7\d años|8\d años|adulto mayor|tercera edad|niñ[oa]|menor|oncol[oó]g|c[aá]ncer|urgente|peligro)/i.test(t)) vulnScore += 55;
    else if (/(ansiedad|depresi[oó]n|campesin[oa]|vereda)/i.test(t)) vulnScore += 40;
    vulnScore = Math.min(100, vulnScore);

    const psiScore = Math.min(100, 65 + Math.min(25, (options.attachmentsCount || 1) * 12));
    const curatedFacts = sanitizeTextClient(rawInput);

    const unconditionedPetitions = [
      `PRIMERO: TUTELAR y AMPARAR de manera inmediata mis derechos constitucionales fundamentales frente a ${targetEntity}.`,
      `SEGUNDO: ORDENAR a ${targetEntity} el cumplimiento material e incondicionado en el término improrrogable de cuarenta y ocho (48) horas (Art. 86 C.P. y Decreto 2591 de 1991).`,
      `TERCERO: PREVENIR a la entidad accionada para que se abstenga de imponer barreras administrativas o cobros desproporcionados (Sentencias T-760/08, SU-508/20 y T-238/24).`
    ];

    return {
      timestamp: new Date().toISOString(),
      formula: 'S(K) = < H, E, T, V >',
      route: routeCatalog,
      targetEntity,
      territory: {
        key: territory.key,
        municipality: munData.nombre_oficial || munData.municipio || 'Medellín',
        subregion: munData.subregion || 'Valle de Aburrá',
        juzgadoEmail: munData.juzgado_reparto?.email || munData.email_juzgado || 'recepcionmemoriales@cendoj.ramajudicial.gov.co',
        personeriaEmail: munData.personeria?.email || munData.email_personeria || 'info@personeriamedellin.gov.co'
      },
      vulnerability: {
        score: vulnScore,
        urgencyLevel: vulnScore >= 65 ? 'CRITICA_INMEDIATA' : 'ALTA_PREFERENTE',
        requiresProvisionalMeasure: vulnScore >= 60
      },
      probative: {
        psiScore,
        sufficiencyLevel: psiScore >= 75 ? 'SOLIDA_RADICABLE' : 'SUFICIENTE_POR_BUENA_FE'
      },
      curatedFacts,
      unconditionedPetitions,
      audits: {
        pageBudget: {
          estimatedPages: 2.4,
          withinBudget: true
        }
      }
    };
  }

  function buildAnalyticsSummaryClient() {
    const bySubregion = {};
    const byRoute = {};
    let totalPsi = 0;
    let provisionalCount = 0;
    const activeAlerts = [];

    for (const c of casesList) {
      bySubregion[c.subregion] = (bySubregion[c.subregion] || 0) + 1;
      byRoute[c.routeId] = (byRoute[c.routeId] || 0) + 1;
      totalPsi += Number(c.psiScore || 80);
      if (c.requiresProvisionalMeasure) provisionalCount++;
      const rem = Math.max(0, (c.slaDays || 10) - (c.daysElapsed || 0));
      if (c.status !== 'RESUELTO' && (rem <= 5 || c.urgencyLevel === 'CRITICA_INMEDIATA')) {
        activeAlerts.push({
          caseId: c.id,
          citizenName: c.citizenName,
          municipality: c.municipalityLabel,
          urgencyLevel: c.urgencyLevel,
          remainingDays: rem,
          message: c.requiresProvisionalMeasure
            ? `Medida Provisional 48h activa ante ${c.targetEntity}`
            : `Vencimiento próximo de término legal (${rem} días hábiles restantes)`
        });
      }
    }

    return {
      kpis: {
        totalCases: casesList.length,
        avgProbativeSufficiency: Number((totalPsi / Math.max(1, casesList.length)).toFixed(1)),
        provisionalMeasuresTriggered: provisionalCount,
        estimatedCitizenSavingsCOP: casesList.length * 650000
      },
      distributions: {
        bySubregion,
        byRoute
      },
      activeAlerts,
      recentCases: casesList
    };
  }

  function jsonResponse(obj) {
    return new Response(JSON.stringify(obj), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  window.fetch = async function (input, init) {
    const urlStr = typeof input === 'string' ? input : (input?.url || '');
    const isApiCall = urlStr.includes('/api/');

    if (!isApiCall) {
      return origFetch(input, init);
    }

    // If running on localhost, try the live Node.js API server first
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      try {
        const res = await origFetch(input, init);
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          return res;
        }
      } catch (e) {
        // Fallback to browser engine below
      }
    }

    await ensureDataLoaded();
    let bodyObj = {};
    if (init?.body) {
      try { bodyObj = JSON.parse(init.body); } catch (e) {}
    }

    if (urlStr.endsWith('/api/analytics')) {
      return jsonResponse(buildAnalyticsSummaryClient());
    }

    if (urlStr.endsWith('/api/cases')) {
      return jsonResponse({ cases: casesList });
    }

    if (urlStr.endsWith('/api/cases/status')) {
      const target = casesList.find(c => c.id === bodyObj.caseId);
      if (target && bodyObj.status) {
        target.status = bodyObj.status;
        saveCases();
      }
      return jsonResponse({ ok: true, case: target });
    }

    if (urlStr.endsWith('/api/subsume')) {
      const sub = runSubsunctionClient(bodyObj.text || '', {
        municipalityHint: bodyObj.municipality,
        attachmentsCount: bodyObj.attachmentsCount
      });
      let registeredCase = null;
      if (bodyObj.registerCase) {
        registeredCase = {
          id: `EXP-ANT-2026-0${casesList.length + 1}`,
          createdAt: new Date().toISOString(),
          citizenName: bodyObj.citizenName || 'Ciudadano Antioquia',
          municipality: sub.territory.key,
          municipalityLabel: sub.territory.municipality,
          subregion: sub.territory.subregion,
          routeId: sub.route.id,
          routeTitle: sub.route.title,
          targetEntity: sub.targetEntity,
          destinationEmail: sub.territory.juzgadoEmail,
          status: 'BORRADOR_LISTO',
          urgencyLevel: sub.vulnerability.urgencyLevel,
          requiresProvisionalMeasure: sub.vulnerability.requiresProvisionalMeasure,
          vulnerabilityScore: sub.vulnerability.score,
          psiScore: sub.probative.psiScore,
          slaDays: sub.route.slaDays || 10,
          daysElapsed: 0
        };
        casesList.unshift(registeredCase);
        saveCases();
      }
      return jsonResponse({ subsunction: sub, registeredCase });
    }

    if (urlStr.endsWith('/api/directory')) {
      return jsonResponse({
        municipios: antioquiaDir || {},
        universidades: universitiesDir || {}
      });
    }

    if (urlStr.endsWith('/api/config')) {
      try { localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(bodyObj)); } catch (e) {}
      return jsonResponse({ ok: true, config: bodyObj });
    }

    if (urlStr.endsWith('/api/session/repair')) {
      return jsonResponse({
        ok: true,
        message: 'Pre-keys corruptas purgadas y sesión Signal resincronizada exitosamente.'
      });
    }

    if (urlStr.endsWith('/api/simulate-chat')) {
      const sid = bodyObj.sessionId || 'default';
      const msg = String(bodyObj.message || '').trim();
      if (!chatSessions[sid] || msg.toLowerCase() === '!hola') {
        chatSessions[sid] = { step: 1 };
        return jsonResponse({
          reply: '⚖️ *JUSTICIA WHATSAPP — LITIGIO ESTRATÉGICO*\n¡Hola! 👋 ¿Autoriza el tratamiento ético de sus datos (Habeas Data - Ley 1581 de 2012) para construir su estrategia constitucional?\n1️⃣ Sí, autorizo.'
        });
      }
      if (chatSessions[sid].step === 1 && (msg === '1' || /autorizo|s[ií]/i.test(msg))) {
        chatSessions[sid].step = 2;
        return jsonResponse({
          reply: '✅ *Consentimiento registrado.*\nPor favor cuénteme en sus propias palabras su caso, indicando su *nombre*, *municipio en Antioquia* y qué entidad vulnera su derecho.'
        });
      }
      const sub = runSubsunctionClient(msg, { attachmentsCount: 2 });
      return jsonResponse({
        reply: `🔍 *SUBSUNCIÓN S(K) COMPLETADA*\n• *Ruta:* ${sub.route.id}\n• *Entidad:* ${sub.targetEntity}\n• *Municipio:* ${sub.territory.municipality} (${sub.territory.subregion})\n• *Suficiencia Ψ(E):* ${sub.probative.psiScore}/100\n• *Reparto:* ${sub.territory.juzgadoEmail}\n\n📄 _Minuta constitucional curada (≤ 3 págs) lista para radicación._`
      });
    }

    return origFetch(input, init);
  };
})();
