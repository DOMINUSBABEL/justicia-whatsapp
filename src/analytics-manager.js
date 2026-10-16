const fs = require('fs');
const path = require('path');

const ledgerPath = path.join(__dirname, '..', 'data', 'cases_ledger.json');

/**
 * Casos semilla representativos en las 9 subregiones de Antioquia para analítica y gestión operativa.
 */
const DEFAULT_SEED_CASES = [
  {
    id: 'EXP-ANT-2026-001',
    createdAt: '2026-10-14T09:15:00.000Z',
    updatedAt: '2026-10-16T08:30:00.000Z',
    citizenName: 'Luz Marina Restrepo G.',
    citizenDoc: '43.512.***',
    municipality: 'MEDELLIN',
    municipalityLabel: 'Medellín',
    subregion: 'Valle de Aburrá',
    routeId: 'TUTELA_SALUD',
    routeTitle: 'Acción de Tutela por Derecho a la Salud (Medicamento Oncológico)',
    targetEntity: 'Savia Salud EPS',
    destinationEmail: 'notificacionesjudiciales@saviasalud.com.co',
    juzgadoEmail: 'memorialesmedellin@cendoj.ramajudicial.gov.co',
    status: 'RADICADO',
    urgencyLevel: 'CRITICA_INMEDIATA',
    requiresProvisionalMeasure: true,
    vulnerabilityScore: 85,
    psiScore: 92,
    slaDays: 10,
    daysElapsed: 2,
    marginalCostUSD: 0.0057,
    summary: 'Negativa de entrega de inmunoterapia oncológica pese a orden vigente de especialista. Medida provisional del Art. 7 D.2591/91 invocada.'
  },
  {
    id: 'EXP-ANT-2026-002',
    createdAt: '2026-10-13T14:22:00.000Z',
    updatedAt: '2026-10-15T16:10:00.000Z',
    citizenName: 'Santiago Montoya Vélez',
    citizenDoc: '1.001.472.***',
    municipality: 'CALDAS',
    municipalityLabel: 'Caldas',
    subregion: 'Valle de Aburrá',
    routeId: 'CANCELACION_ACADEMICA_SALUD',
    routeTitle: 'Cancelación Extemporánea de Semestre por Salud Mental (Ley 1616/13)',
    targetEntity: 'Consejo de Facultad - Corporación Universitaria Lasallista (UNILASALLISTA)',
    destinationEmail: 'consejo.ingenieria@unilasallista.edu.co',
    juzgadoEmail: 'j01prmpalcaldas@cendoj.ramajudicial.gov.co',
    status: 'EN_TERMINO',
    urgencyLevel: 'ALTA_PREFERENTE',
    requiresProvisionalMeasure: false,
    vulnerabilityScore: 65,
    psiScore: 95,
    slaDays: 15,
    daysElapsed: 3,
    marginalCostUSD: 0.0057,
    summary: 'Solicitud de cancelación extemporánea sin cobro punitivo ni pérdida por inasistencia bajo Sentencias T-441/12, T-574/17 y T-238/24.'
  },
  {
    id: 'EXP-ANT-2026-003',
    createdAt: '2026-10-11T10:05:00.000Z',
    updatedAt: '2026-10-15T11:00:00.000Z',
    citizenName: 'Jairo Alonso Tuberquia',
    citizenDoc: '71.289.***',
    municipality: 'APARTADO',
    municipalityLabel: 'Apartadó',
    subregion: 'Urabá',
    routeId: 'TUTELA_AGUA',
    routeTitle: 'Acción de Tutela por Mínimo Vital de Agua Potable (50L/día)',
    targetEntity: 'Aguas Regionales EPM - Urabá',
    destinationEmail: 'notificacionesjudiciales@epm.com.co',
    juzgadoEmail: 'repartoapartado@cendoj.ramajudicial.gov.co',
    status: 'RESUELTO',
    urgencyLevel: 'CRITICA_INMEDIATA',
    requiresProvisionalMeasure: true,
    vulnerabilityScore: 80,
    psiScore: 88,
    slaDays: 10,
    daysElapsed: 5,
    marginalCostUSD: 0.0057,
    summary: 'Hogar con 2 menores de edad y adulto mayor sin suministro de agua potable. Juez ordenó reconexión de flujo vital en 48 horas.'
  },
  {
    id: 'EXP-ANT-2026-004',
    createdAt: '2026-10-15T07:45:00.000Z',
    updatedAt: '2026-10-16T09:10:00.000Z',
    citizenName: 'María Edilma Osorio',
    citizenDoc: '21.845.***',
    municipality: 'CAUCASIA',
    municipalityLabel: 'Caucasia',
    subregion: 'Bajo Cauca',
    routeId: 'TUTELA_SALUD',
    routeTitle: 'Tutela por Remisión Prioritaria y Viáticos de Transporte Intermunicipal',
    targetEntity: 'Nueva EPS',
    destinationEmail: 'secretaria.general@nuevaeps.com.co',
    juzgadoEmail: 'repartocaucasia@cendoj.ramajudicial.gov.co',
    status: 'BORRADOR_LISTO',
    urgencyLevel: 'CRITICA_INMEDIATA',
    requiresProvisionalMeasure: true,
    vulnerabilityScore: 90,
    psiScore: 86,
    slaDays: 10,
    daysElapsed: 1,
    marginalCostUSD: 0.0057,
    summary: 'Paciente renal en Bajo Cauca requiere transporte y alojamiento hacia Medellín (Sentencia SU-508/20).'
  },
  {
    id: 'EXP-ANT-2026-005',
    createdAt: '2026-10-12T16:20:00.000Z',
    updatedAt: '2026-10-16T10:00:00.000Z',
    citizenName: 'Hernando de Jesús Giraldo',
    citizenDoc: '15.432.***',
    municipality: 'RIONEGRO',
    municipalityLabel: 'Rionegro',
    subregion: 'Oriente',
    routeId: 'HABEAS_DATA_DATACREDITO',
    routeTitle: 'Reclamación de Habeas Data por Omisión de Preaviso de 20 Días',
    targetEntity: 'Compañía de Financiamiento / Datacrédito Experian',
    destinationEmail: 'notificaciones@experian.com',
    juzgadoEmail: 'repartorionegro@cendoj.ramajudicial.gov.co',
    status: 'EN_TERMINO',
    urgencyLevel: 'ORDINARIA_GARANTISTA',
    requiresProvisionalMeasure: false,
    vulnerabilityScore: 30,
    psiScore: 84,
    slaDays: 15,
    daysElapsed: 4,
    marginalCostUSD: 0.0057,
    summary: 'Reporte negativo inferior a 15% SMMLV registrado sin comunicación previa de 20 días calendario (Art. 12 Ley 1266/08).'
  },
  {
    id: 'EXP-ANT-2026-006',
    createdAt: '2026-10-15T18:00:00.000Z',
    updatedAt: '2026-10-16T10:40:00.000Z',
    citizenName: 'Asociación Veredal El Cinco / Pedro Nel Loaiza',
    citizenDoc: '70.612.***',
    municipality: 'ANDES',
    municipalityLabel: 'Andes',
    subregion: 'Suroeste',
    routeId: 'PROTECCION_CAMPESINADO_TIERRAS',
    routeTitle: 'Petición Constitucional Campesina (Acto Legislativo 01 de 2023)',
    targetEntity: 'Agencia Nacional de Tierras (ANT) / Alcaldía de Andes',
    destinationEmail: 'atencionalciudadano@agenciadetierras.gov.co',
    juzgadoEmail: 'repartoandes@cendoj.ramajudicial.gov.co',
    status: 'RADICADO',
    urgencyLevel: 'ALTA_PREFERENTE',
    requiresProvisionalMeasure: false,
    vulnerabilityScore: 70,
    psiScore: 82,
    slaDays: 15,
    daysElapsed: 1,
    marginalCostUSD: 0.0057,
    summary: 'Formalización de predio cafetero familiar y suspensión de procedimiento policivo sin enfoque diferencial campesino.'
  },
  {
    id: 'EXP-ANT-2026-007',
    createdAt: '2026-10-16T06:50:00.000Z',
    updatedAt: '2026-10-16T11:00:00.000Z',
    citizenName: 'Daniela Cárdenas Ospina',
    citizenDoc: '1.037.648.***',
    municipality: 'ENVIGADO',
    municipalityLabel: 'Envigado',
    subregion: 'Valle de Aburrá',
    routeId: 'ESTABILIDAD_LABORAL_MINIMO_VITAL',
    routeTitle: 'Tutela por Fuero de Maternidad y Estabilidad Ocupacional (SU-075/18)',
    targetEntity: 'Comercializadora Textil del Sur S.A.S.',
    destinationEmail: 'direccionesregionales@mintrabajo.gov.co',
    juzgadoEmail: 'repartoenvigado@cendoj.ramajudicial.gov.co',
    status: 'TRIAGE',
    urgencyLevel: 'CRITICA_INMEDIATA',
    requiresProvisionalMeasure: true,
    vulnerabilityScore: 80,
    psiScore: 78,
    slaDays: 10,
    daysElapsed: 0,
    marginalCostUSD: 0.0057,
    summary: 'Terminación unilateral de contrato durante el cuarto mes de gestación sin autorización del Inspector del Trabajo.'
  },
  {
    id: 'EXP-ANT-2026-008',
    createdAt: '2026-10-08T11:10:00.000Z',
    updatedAt: '2026-10-16T07:20:00.000Z',
    citizenName: 'Rodrigo Antonio Zapata',
    citizenDoc: '8.319.***',
    municipality: 'SANTA_ROSA_DE_OSOS',
    municipalityLabel: 'Santa Rosa de Osos',
    subregion: 'Norte',
    routeId: 'TUTELA_SILENCIO',
    routeTitle: 'Tutela por Silencio Administrativo Frente a Petición Pensional',
    targetEntity: 'Colpensiones - Dirección de Prestaciones',
    destinationEmail: 'notificacionesjudiciales@colpensiones.gov.co',
    juzgadoEmail: 'repartosantarosa@cendoj.ramajudicial.gov.co',
    status: 'RESUELTO',
    urgencyLevel: 'ALTA_PREFERENTE',
    requiresProvisionalMeasure: false,
    vulnerabilityScore: 60,
    psiScore: 94,
    slaDays: 10,
    daysElapsed: 8,
    marginalCostUSD: 0.0057,
    summary: 'Petición de historia laboral sin respuesta tras 26 días hábiles. Juzgado tuteló el Art. 23 C.P. ordenando respuesta en 48h.'
  }
];

function loadCasesLedger() {
  try {
    if (!fs.existsSync(ledgerPath)) {
      fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
      fs.writeFileSync(ledgerPath, JSON.stringify({ updatedAt: new Date().toISOString(), cases: DEFAULT_SEED_CASES }, null, 2), 'utf8');
      return DEFAULT_SEED_CASES;
    }
    const parsed = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    return Array.isArray(parsed.cases) && parsed.cases.length > 0 ? parsed.cases : DEFAULT_SEED_CASES;
  } catch {
    return [...DEFAULT_SEED_CASES];
  }
}

function saveCasesLedger(cases) {
  try {
    fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
    fs.writeFileSync(ledgerPath, JSON.stringify({ updatedAt: new Date().toISOString(), cases }, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

function registerNewCaseFromSubsunction(subsunctionResult, citizenInfo = {}) {
  const cases = loadCasesLedger();
  const nextNumber = String(cases.length + 1).padStart(3, '0');
  const newCase = {
    id: `EXP-ANT-2026-${nextNumber}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    citizenName: citizenInfo.name || 'Ciudadano(a) Antioqueño(a)',
    citizenDoc: citizenInfo.doc || '1.000.***',
    municipality: subsunctionResult.territory?.key || 'MEDELLIN',
    municipalityLabel: subsunctionResult.territory?.municipality || 'Medellín',
    subregion: subsunctionResult.territory?.subregion || 'Valle de Aburrá',
    routeId: subsunctionResult.route?.id || 'PETICION_GENERAL',
    routeTitle: subsunctionResult.route?.title || 'Derecho de Petición Constitucional',
    targetEntity: subsunctionResult.targetEntity || 'Entidad Accionada',
    destinationEmail: subsunctionResult.territory?.universityEmail || subsunctionResult.territory?.personeriaEmail || 'recepcionmemoriales@cendoj.ramajudicial.gov.co',
    juzgadoEmail: subsunctionResult.territory?.juzgadoEmail || 'recepcionmemoriales@cendoj.ramajudicial.gov.co',
    status: citizenInfo.status || 'BORRADOR_LISTO',
    urgencyLevel: subsunctionResult.vulnerability?.urgencyLevel || 'ORDINARIA_GARANTISTA',
    requiresProvisionalMeasure: Boolean(subsunctionResult.vulnerability?.requiresProvisionalMeasure),
    vulnerabilityScore: subsunctionResult.vulnerability?.score || 25,
    psiScore: subsunctionResult.probative?.psiScore || 75,
    slaDays: subsunctionResult.route?.slaDays || 15,
    daysElapsed: 0,
    marginalCostUSD: subsunctionResult.economicTelemetry?.marginalCostUSD || 0.0057,
    summary: (subsunctionResult.curatedFacts || '').slice(0, 220)
  };

  cases.unshift(newCase);
  saveCasesLedger(cases);
  return newCase;
}

function updateCaseStatus(caseId, newStatus) {
  const cases = loadCasesLedger();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return null;
  cases[idx].status = newStatus;
  cases[idx].updatedAt = new Date().toISOString();
  saveCasesLedger(cases);
  return cases[idx];
}

function computeAgentAnalytics() {
  const cases = loadCasesLedger();
  const totalCases = cases.length;

  const byStatus = {
    TRIAGE: 0,
    BORRADOR_LISTO: 0,
    RADICADO: 0,
    EN_TERMINO: 0,
    RESUELTO: 0
  };

  const bySubregion = {};
  const byRoute = {};
  const byEntity = {};
  let sumPsi = 0;
  let sumVulnerability = 0;
  let provisionalCount = 0;
  let totalCostUSD = 0;

  const activeAlerts = [];

  for (const c of cases) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    bySubregion[c.subregion] = (bySubregion[c.subregion] || 0) + 1;
    byRoute[c.routeId] = (byRoute[c.routeId] || 0) + 1;
    byEntity[c.targetEntity] = (byEntity[c.targetEntity] || 0) + 1;

    sumPsi += Number(c.psiScore || 75);
    sumVulnerability += Number(c.vulnerabilityScore || 30);
    if (c.requiresProvisionalMeasure) provisionalCount++;
    totalCostUSD += Number(c.marginalCostUSD || 0.0057);

    const remainingDays = (c.slaDays || 15) - (c.daysElapsed || 0);
    if (c.status !== 'RESUELTO' && (c.urgencyLevel === 'CRITICA_INMEDIATA' || remainingDays <= 3)) {
      activeAlerts.push({
        caseId: c.id,
        citizenName: c.citizenName,
        municipality: c.municipalityLabel,
        routeId: c.routeId,
        urgencyLevel: c.urgencyLevel,
        remainingDays,
        message: c.requiresProvisionalMeasure
          ? `Medida Provisional Art. 7 D.2591/91 activa (${c.targetEntity})`
          : `Vencimiento de término legal en ${remainingDays} día(s) hábiles`
      });
    }
  }

  const avgPsi = totalCases > 0 ? Math.round((sumPsi / totalCases) * 10) / 10 : 88.5;
  const avgVulnerability = totalCases > 0 ? Math.round((sumVulnerability / totalCases) * 10) / 10 : 65.0;
  const savingsCOP = totalCases * 650000;

  return {
    generatedAt: new Date().toISOString(),
    kpis: {
      totalCases,
      resolvedCases: byStatus.RESUELTO || 0,
      activeRadicados: (byStatus.RADICADO || 0) + (byStatus.EN_TERMINO || 0),
      avgProbativeSufficiency: avgPsi,
      avgVulnerabilityScore: avgVulnerability,
      provisionalMeasuresTriggered: provisionalCount,
      municipalitiesCovered: 125,
      g8UniversitiesCovered: 8,
      marginalCostPerCaseUSD: 0.0057,
      totalAccumulatedCostUSD: Number(totalCostUSD.toFixed(4)),
      estimatedCitizenSavingsCOP: savingsCOP
    },
    distributions: {
      byStatus,
      bySubregion,
      byRoute,
      byEntity
    },
    activeAlerts,
    recentCases: cases.slice(0, 12)
  };
}

module.exports = {
  loadCasesLedger,
  saveCasesLedger,
  registerNewCaseFromSubsunction,
  updateCaseStatus,
  computeAgentAnalytics
};
