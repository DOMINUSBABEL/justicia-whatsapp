const fs = require('fs');
const path = require('path');

const SESSIONS_FILE = path.join(__dirname, '..', 'user_sessions.json');
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 Horas TTL

let sessions = {};

function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      sessions = JSON.parse(data);
    }
  } catch (err) {
    console.error('⚠️ Error cargando sesiones:', err.message);
    sessions = {};
  }
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Error guardando sesiones:', err.message);
  }
}

loadSessions();

function getInitialState(senderJid) {
  return {
    jid: senderJid,
    flowState: 'IDLE',
    habeasDataConsent: false,
    languageMode: 'CLARO', // 'CLARO' (Lenguaje Campesino/Sencillo) o 'TECNICO' (Rigor Jurídico)
    createdAt: Date.now(),
    lastInteraction: Date.now(),
    userData: {
      nombre: '',
      cedula: '',
      municipio: 'Medellín',
      subregion: 'Valle de Aburrá',
      categoriaAccion: 'TUTELA_SALUD', // TUTELA_SALUD, TUTELA_AGUA, PETICION_GENERAL, HABEAS_DATA_DATACREDITO, RECURSO_ADMINISTRATIVO, NULIDAD_CPACA, ACCION_POPULAR, G8_COMPLEJO, CANCELACION_ACADEMICA_SALUD
      entidadAccionada: 'Savia Salud EPS',
      motivoConsulta: '',
      descripcionHechos: '',
      actoAdministrativoNumero: '',
      fechaNotificacionActo: '',
      agotamientoViaGubernativa: true,
      pretensionEconomica: '',
      tienePruebas: false,
      pruebasAportadas: [],
      viaProcesal: 'TUTELA',
      medidaCautelar: true,
      emailJuzgado: 'tutelasrepartomedellin@cendoj.ramajudicial.gov.co',
      emailPersoneria: 'info@personeriamedellin.gov.co',
      generatedPdfPath: null,
      draftReviewStatus: 'IDLE',
      asignaturas: [],
      asesorDocente: '',
      omiteDireccionFisica: true,
      revisionDirectives: []
    }
  };
}

function getSession(senderJid) {
  const now = Date.now();
  if (!sessions[senderJid]) {
    sessions[senderJid] = getInitialState(senderJid);
    saveSessions();
  } else {
    if (now - sessions[senderJid].lastInteraction > SESSION_TTL_MS) {
      sessions[senderJid] = getInitialState(senderJid);
      saveSessions();
    }
  }
  return sessions[senderJid];
}

function updateSession(senderJid, updates) {
  const session = getSession(senderJid);
  Object.assign(session, updates, { lastInteraction: Date.now() });
  saveSessions();
  return session;
}

function updateUserData(senderJid, userUpdates) {
  const session = getSession(senderJid);
  session.userData = { ...session.userData, ...userUpdates };
  session.lastInteraction = Date.now();
  saveSessions();
  return session;
}

function resetSession(senderJid) {
  sessions[senderJid] = getInitialState(senderJid);
  saveSessions();
  return sessions[senderJid];
}

module.exports = {
  getSession,
  updateSession,
  updateUserData,
  resetSession
};
