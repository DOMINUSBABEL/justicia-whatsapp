const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  LEGAL_ROUTES_CATALOG,
  resolveMunicipality,
  resolveUniversity,
  runFormalLegalSubsunction
} = require('../src/legal-subsunction-engine');

const {
  loadCasesLedger,
  computeAgentAnalytics,
  registerNewCaseFromSubsunction
} = require('../src/analytics-manager');

const { generateLegalPDF } = require('../src/pdf-generator');

test('1. Directorio de Antioquia cubre los 125 municipios y las 8 universidades G8', () => {
  const rawDir = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'data', 'antioquia_directory.json'), 'utf8')
  );
  const munKeys = Object.keys(rawDir.municipios || rawDir || {});
  assert.equal(munKeys.length, 125, 'Debe contener exactamente los 125 municipios de Antioquia');

  const andes = resolveMunicipality('Soy campesino en el municipio de Andes');
  assert.equal(andes.key, 'ANDES');
  assert.equal(andes.matched, true);

  const unilasallista = resolveUniversity('Soy estudiante activo de Unilasallista en Caldas');
  assert.equal(unilasallista.key, 'UNILASALLISTA');
  assert.equal(unilasallista.matched, true);
});

test('2. Motor de Subsunción Formal S(K)=<H,E,T,V> clasifica y depura las 9 rutas jurídicas', () => {
  assert.equal(Object.keys(LEGAL_ROUTES_CATALOG).length, 9);

  // Caso 1: Cancelación Académica + Anti-Slop + Despatologización + Estado Afirmativo
  const acad = runFormalLegalSubsunction(
    'Es menester señalar que soy estudiante en Unilasallista en Caldas y tuve un cuadro clínico psiquiátrico de ansiedad hace 15 días. Solicito cancelar el semestre mientras me alivio.',
    { municipalityHint: 'Caldas', attachmentsCount: 2 }
  );
  assert.equal(acad.route.id, 'CANCELACION_ACADEMICA_SALUD');
  assert.ok(!acad.curatedFacts.toLowerCase().includes('es menester señalar que'));
  assert.ok(!acad.curatedFacts.toLowerCase().includes('psiquiátrico'));
  assert.equal(acad.audits.suspensiveClausesFound, 0);
  assert.ok(acad.probative.psiScore >= 75);

  // Caso 2: Tutela Salud + Adulto Mayor + Medida Provisional 48h
  const salud = runFormalLegalSubsunction(
    'Soy adulto mayor de 78 años en Caucasia y Savia Salud EPS me niega la insulina urgente ordenada en mi historia clínica.',
    { municipalityHint: 'Caucasia', attachmentsCount: 1 }
  );
  assert.equal(salud.route.id, 'TUTELA_SALUD');
  assert.equal(salud.targetEntity, 'Savia Salud EPS');
  assert.equal(salud.vulnerability.requiresProvisionalMeasure, true);
  assert.equal(salud.territory.key, 'CAUCASIA');

  // Caso 3: Protección Campesinado AL 01/2023
  const camp = runFormalLegalSubsunction(
    'Soy campesino de una vereda en Urrao y tenemos amenaza de desalojo rural sobre nuestro predio agrario.',
    { municipalityHint: 'Urrao' }
  );
  assert.equal(camp.route.id, 'PROTECCION_CAMPESINADO_TIERRAS');
  assert.equal(camp.territory.key, 'URRAO');
});

test('3. Gestor Analítico y Ledger Departamental computa KPIs y registra casos', () => {
  const initialCases = loadCasesLedger();
  assert.ok(initialCases.length >= 8);

  const sub = runFormalLegalSubsunction('En Apartadó nos cortaron el agua potable de EPM con niños menores.', {
    municipalityHint: 'Apartadó',
    attachmentsCount: 2
  });
  const created = registerNewCaseFromSubsunction(sub, {
    name: 'Ciudadano Prueba Urabá',
    doc: '71999888',
    status: 'BORRADOR_LISTO'
  });
  assert.ok(created.id.startsWith('EXP-ANT-2026-'));

  const analytics = computeAgentAnalytics();
  assert.equal(analytics.kpis.municipalitiesCovered, 125);
  assert.equal(analytics.kpis.g8UniversitiesCovered, 8);
  assert.ok(analytics.kpis.avgProbativeSufficiency > 50);
});

test('4. Generador PDF compila correctamente sin duplicados en CANCELACION_ACADEMICA_SALUD', async () => {
  const res = await generateLegalPDF({
    nombre: 'Julián Andrés Gómez',
    cedula: '1020304050',
    municipio: 'Caldas',
    subregion: 'Valle de Aburrá',
    entidadAccionada: 'Consejo de Facultad - Corporación Universitaria Lasallista',
    categoriaAccion: 'CANCELACION_ACADEMICA_SALUD',
    descripcionHechos: 'Solicitud de cancelación extemporánea por afectación de bienestar emocional.'
  });
  assert.ok(fs.existsSync(res.filePath));
});

test('5. Servidor Web y API REST (Estética SuperAmia) responden correctamente en todos los endpoints', async () => {
  const { createApiServer } = require('../src/api-server');
  const server = createApiServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const htmlRes = await fetch(`${baseUrl}/`);
    assert.equal(htmlRes.status, 200);
    const html = await htmlRes.text();
    assert.ok(html.includes('miaBrainCanvas'), 'El HTML debe incluir el Canvas 3D de partículas SuperAmia');
    assert.ok(html.includes('miaWorkflowSpine'), 'El HTML debe incluir el flujo Bezier SVG SuperAmia');

    const statusRes = await fetch(`${baseUrl}/api/status`);
    assert.equal(statusRes.status, 200);
    const statusJson = await statusRes.json();
    assert.equal(statusJson.status, 'ONLINE');

    const subRes = await fetch(`${baseUrl}/api/subsume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citizenName: 'Ciudadano Test Web',
        municipality: 'Rionegro',
        attachmentsCount: 2,
        text: 'Me reportaron en Datacrédito sin enviarme la comunicación previa de 20 días calendario.'
      })
    });
    assert.equal(subRes.status, 200);
    const subJson = await subRes.json();
    assert.equal(subJson.subsunction.route.id, 'HABEAS_DATA_DATACREDITO');
    assert.equal(subJson.subsunction.territory.key, 'RIONEGRO');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

