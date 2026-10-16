const http = require('http');
const fs = require('fs');
const path = require('path');
const configManager = require('./config-manager');
const { processMessage } = require('./harness-engine');
const {
  LEGAL_ROUTES_CATALOG,
  runFormalLegalSubsunction,
  resolveMunicipality
} = require('./legal-subsunction-engine');
const {
  loadCasesLedger,
  registerNewCaseFromSubsunction,
  updateCaseStatus,
  computeAgentAnalytics
} = require('./analytics-manager');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const AUTH_FOLDER = path.join(__dirname, '..', 'whatsapp_auth_info');
const ANTIOQUIA_DIR_FILE = path.join(__dirname, '..', 'data', 'antioquia_directory.json');
const G8_UNI_FILE = path.join(__dirname, '..', 'data', 'antioquia_universities_directory.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
};

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function getAgentHealthSnapshot() {
  const authFiles = fs.existsSync(AUTH_FOLDER) ? fs.readdirSync(AUTH_FOLDER) : [];
  const sessionCount = authFiles.filter(f => f.startsWith('session-')).length;
  const preKeyCount = authFiles.filter(f => f.startsWith('pre-key-')).length;
  const hasAuth = authFiles.length > 2;

  return {
    status: 'ONLINE',
    version: '2.5.0',
    projectName: configManager.get('projectName') || 'JusticIA WhatsApp - Antioquia 2040 & Cátedra G8',
    phoneNumber: configManager.get('phoneNumber') || '573117272822',
    pairingMethod: configManager.get('pairingMethod') || 'qr',
    autoReplyMode: configManager.get('autoReplyMode') || 'all',
    whitelistNumbers: configManager.get('whitelistNumbers') || [],
    autoRepairCorruptedSessions: Boolean(configManager.get('autoRepairCorruptedSessions')),
    signalProtocol: {
      linked: hasAuth,
      authFilesCount: authFiles.length,
      activeSessions: sessionCount,
      preKeysCount: preKeyCount,
      healthLabel: hasAuth ? 'SINCRONIZADO (Signal Pre-Keys OK)' : 'LISTO PARA VINCULAR (QR / Código 8 Dígitos)'
    }
  };
}

function createApiServer() {
  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    try {
      // 1. Estado de Salud y Configuración del Agente Autónomo
      if (pathname === '/api/status' && req.method === 'GET') {
        return sendJson(res, 200, getAgentHealthSnapshot());
      }

      // 2. Tablero Analítico y Telemetría de Litigio
      if (pathname === '/api/analytics' && req.method === 'GET') {
        return sendJson(res, 200, computeAgentAnalytics());
      }

      // 3. Libro Mayor de Expedientes (GET & POST)
      if (pathname === '/api/cases' && req.method === 'GET') {
        return sendJson(res, 200, { cases: loadCasesLedger(), routesCatalog: LEGAL_ROUTES_CATALOG });
      }

      if (pathname === '/api/cases/status' && (req.method === 'POST' || req.method === 'PUT')) {
        const body = await parseJsonBody(req);
        const updated = updateCaseStatus(body.caseId, body.status);
        if (!updated) return sendJson(res, 404, { error: 'Expediente no encontrado' });
        return sendJson(res, 200, { updated, analytics: computeAgentAnalytics() });
      }

      // 4. Motor de Subsunción Jurídica en Vivo S(K) = <H, E, T, V>
      if (pathname === '/api/subsume' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const result = runFormalLegalSubsunction(body.text || '', {
          municipalityHint: body.municipality || '',
          attachmentsCount: Number(body.attachmentsCount || 0)
        });
        let registeredCase = null;
        if (body.registerCase) {
          registeredCase = registerNewCaseFromSubsunction(result, {
            name: body.citizenName || 'Ciudadano(a) Antioqueño(a)',
            doc: body.citizenDoc || '1.020.***',
            status: 'BORRADOR_LISTO'
          });
        }
        return sendJson(res, 200, {
          subsunction: result,
          registeredCase,
          analytics: computeAgentAnalytics()
        });
      }

      // 5. Simulador Conversacional WhatsApp conectado al Harness Real
      if (pathname === '/api/simulate-chat' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const sessionId = body.sessionId || 'web-citizen@s.whatsapp.net';
        const messageText = body.message || '!hola';
        const response = await processMessage(sessionId, messageText, body.mediaPayload || null);
        return sendJson(res, 200, {
          sessionId,
          reply: response ? response.text : 'Escriba *!hola* para activar el asistente jurídico JusticIA.',
          pdfFileName: response?.pdfFileName || null
        });
      }

      // 6. Directorio Completo (125 Municipios + 8 Universidades G8)
      if (pathname === '/api/directory' && req.method === 'GET') {
        const antioquiaData = JSON.parse(fs.readFileSync(ANTIOQUIA_DIR_FILE, 'utf8'));
        const uniData = JSON.parse(fs.readFileSync(G8_UNI_FILE, 'utf8'));
        const query = parsedUrl.searchParams.get('q') || '';
        const resolved = query ? resolveMunicipality(query) : null;
        return sendJson(res, 200, {
          meta: antioquiaData.meta || { totalMunicipios: 125, totalUniversidadesG8: 8 },
          municipios: antioquiaData.municipios || antioquiaData,
          universidades: uniData.universidades || uniData,
          resolvedQuery: resolved
        });
      }

      // 7. Gestión de Configuración y Auto-Reparación Signal desde la Web
      if (pathname === '/api/config' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        if (body.pairingMethod && ['qr', 'code'].includes(body.pairingMethod)) {
          configManager.set('pairingMethod', body.pairingMethod);
        }
        if (body.autoReplyMode && ['all', 'whitelist'].includes(body.autoReplyMode)) {
          configManager.set('autoReplyMode', body.autoReplyMode);
        }
        if (body.phoneNumber) {
          const clean = String(body.phoneNumber).replace(/\D/g, '');
          if (clean.length >= 10) configManager.set('phoneNumber', clean);
        }
        if (typeof body.autoRepairCorruptedSessions === 'boolean') {
          configManager.set('autoRepairCorruptedSessions', body.autoRepairCorruptedSessions);
        }
        return sendJson(res, 200, { ok: true, status: getAgentHealthSnapshot() });
      }

      if (pathname === '/api/session/repair' && req.method === 'POST') {
        if (fs.existsSync(AUTH_FOLDER)) {
          const files = fs.readdirSync(AUTH_FOLDER);
          for (const f of files) {
            if (f.startsWith('session-') || f.startsWith('pre-key-') || f.startsWith('sender-key-')) {
              fs.rmSync(path.join(AUTH_FOLDER, f), { force: true });
            }
          }
        }
        return sendJson(res, 200, {
          ok: true,
          message: 'Claves Signal corruptas purgadas exitosamente. El agente está listo para re-sincronizar sin perder identidad.',
          status: getAgentHealthSnapshot()
        });
      }

      // 8. Descarga de PDFs generados en generated_docs
      if (pathname.startsWith('/generated_docs/') && req.method === 'GET') {
        const safeName = path.basename(pathname);
        const pdfPath = path.join(__dirname, '..', 'generated_docs', safeName);
        if (fs.existsSync(pdfPath)) {
          res.writeHead(200, { 'Content-Type': 'application/pdf' });
          return fs.createReadStream(pdfPath).pipe(res);
        }
        return sendJson(res, 404, { error: 'PDF no encontrado' });
      }

      // 9. Servidor de Archivos Estáticos de public/
      let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
      if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        return fs.createReadStream(filePath).pipe(res);
      }

      // Fallback SPA a index.html
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        return fs.createReadStream(indexFile).pipe(res);
      }

      res.writeHead(404);
      res.end('Not Found');
    } catch (err) {
      sendJson(res, 500, { error: err.message });
    }
  });
}

function startWebPortal(port = process.env.PORT || 3080) {
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🌐  JUSTICIA WHATSAPP — SITIO WEB & CENTRO DE CONTROL AUTÓNOMO     ┃
┃  🏛️  Estética SuperAmia | Agenda Antioquia 2040 | Cátedra G8        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  👉 Portal Interactivo en vivo: http://localhost:${port}
  👉 Motor Jurídico API:         http://localhost:${port}/api/subsume
  👉 Telemetría & Casos:         http://localhost:${port}/api/analytics
  👉 Directorio 125 Mpios:       http://localhost:${port}/api/directory
───────────────────────────────────────────────────────────────────────
`);
  });
  return server;
}

if (require.main === module) {
  startWebPortal();
}

module.exports = { createApiServer, startWebPortal };
