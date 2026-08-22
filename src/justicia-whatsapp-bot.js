const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  isJidBroadcast,
  isJidGroup,
  isJidNewsletter
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const configManager = require('./config-manager');
const { runOnboardingWizard } = require('./onboarding-wizard');
const { processMessage } = require('./harness-engine');

// SILENCIAR ADVERTENCIAS NO CRÍTICAS DE LIBSIGNAL (Bad MAC de companion devices)
const originalConsoleError = console.error;
console.error = function(...args) {
  const msg = args.map(a => (typeof a === 'string' ? a : (a?.message || ''))).join(' ');
  if (msg.includes('Failed to decrypt message') || msg.includes('Bad MAC') || msg.includes('MessageCounterError') || msg.includes('Closing session: SessionEntry')) {
    // Ignorar logs de desincronización de dispositivos secundarios de WhatsApp
    return;
  }
  originalConsoleError.apply(console, args);
};

const AUTH_FOLDER = path.join(__dirname, '..', 'whatsapp_auth_info');
const TEMP_MEDIA_FOLDER = path.join(__dirname, '..', 'temp_media');

if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });
if (!fs.existsSync(TEMP_MEDIA_FOLDER)) fs.mkdirSync(TEMP_MEDIA_FOLDER, { recursive: true });

// Almacén de mensajes en memoria para resolver reintentos Signal
const messageStore = new Map();

// BUFFER DE MENSAJES Y DEBOUNCING PER-USUARIO (Agrupamiento de ráfagas)
const userMessageBuffers = new Map();
const userBufferTimers = new Map();
const DEBOUNCE_WINDOW_MS = 2800; // Ventana de 2.8 segundos para esperar ráfagas de mensajes

function cleanSenderNumber(jid) {
  return (jid || '').replace('@s.whatsapp.net', '').replace('@lid', '').replace(/@.*$/, '');
}

/**
 * Desempaqueta mensajes anidados (Ephemeral, ViewOnce, DocumentWithCaption)
 */
function getUnpackedMessage(message) {
  if (!message) return null;
  if (message.ephemeralMessage?.message) return getUnpackedMessage(message.ephemeralMessage.message);
  if (message.viewOnceMessage?.message) return getUnpackedMessage(message.viewOnceMessage.message);
  if (message.viewOnceMessageV2?.message) return getUnpackedMessage(message.viewOnceMessageV2.message);
  if (message.documentWithCaptionMessage?.message) return getUnpackedMessage(message.documentWithCaptionMessage.message);
  if (message.editedMessage?.message?.protocolMessage?.editedMessage) return getUnpackedMessage(message.editedMessage.message.protocolMessage.editedMessage);
  return message;
}

/**
 * Extractor Recursivo Seguro de Texto
 */
function extractMessageText(rawMsg) {
  const message = getUnpackedMessage(rawMsg);
  if (!message) return '';
  if (typeof message === 'string') return message;

  return message.conversation ||
         message.extendedTextMessage?.text ||
         message.imageMessage?.caption ||
         message.videoMessage?.caption ||
         message.documentMessage?.caption ||
         message.buttonsResponseMessage?.selectedButtonId ||
         message.listResponseMessage?.singleSelectReply?.selectedRowId ||
         message.templateButtonReplyMessage?.selectedId ||
         '';
}

/**
 * Auto-Curación Dinámica de Pre-Claves Signal Corruptas
 */
function autoHealCorruptedSession(senderJid) {
  try {
    const cleanId = senderJid.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sessionFiles = fs.readdirSync(AUTH_FOLDER).filter(f => f.includes(cleanId) || f.startsWith(`session-${senderJid}`));
    for (const f of sessionFiles) {
      fs.unlinkSync(path.join(AUTH_FOLDER, f));
      console.log(`🧹 [Auto-Healer] Pre-clave desfasada purgada para ${cleanSenderNumber(senderJid)}: ${f}`);
    }
  } catch (e) {
    // Ignorar si no existe
  }
}

let reconnectAttempts = 0;
let isConnecting = false;

async function startJusticIAWhatsAppBot(onFatalErrorCallback = null) {
  if (isConnecting) return;
  isConnecting = true;

  console.log('\n========================================================================');
  console.log('⚖️ INICIANDO MOTOR JUSTICIA WHATSAPP (HARNESS CONSTITUCIONAL V2.0)');
  console.log('🏛️ Proyecto: Agenda Antioquia 2040 | Cátedra G8 (EAFIT, UPB, UdeA, Unilas.)');
  console.log('========================================================================\n');

  try {
    const pinoLogger = pino({ level: 'silent' });
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    // Cache Signal Keystore para estabilizar pre-claves atómicas
    const socketKeys = makeCacheableSignalKeyStore(state.keys, pinoLogger);

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: socketKeys
      },
      logger: pinoLogger,
      printQRInTerminal: false,
      syncFullHistory: false,          // DESACTIVA descarga de historial viejo
      markOnlineOnConnect: false,      // Reduce fricción de presencia
      fireInitQueries: false,
      emitOwnEvents: false,
      generateHighQualityLinkPreview: false,
      shouldIgnoreJid: (jid) => isJidBroadcast(jid) || isJidNewsletter(jid) || isJidGroup(jid),
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 30000,
      getMessage: async (key) => {
        if (messageStore.has(key.id)) {
          return messageStore.get(key.id);
        }
        return { conversation: '' };
      }
    });

    sock.ev.on('creds.update', saveCreds);

    // MODO PAIRING CODE (CÓDIGO DE 8 DÍGITOS)
    if (!sock.authState.creds.registered && configManager.get('pairingMethod') === 'code') {
      const rawPhone = configManager.get('phoneNumber') || '573117272822';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      console.log(`⏳ Solicitando Código de Emparejamiento para +${cleanPhone}...`);
      setTimeout(async () => {
        try {
          const code = await sock.requestPairingCode(cleanPhone);
          console.log('\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
          console.log(`┃  🔑 CÓDIGO DE VINCULACIÓN: [ ${code} ]            ┃`);
          console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
          console.log('👉 En su WhatsApp:');
          console.log('   Dispositivos Vinculados > Vincular un dispositivo > Vincular con número de teléfono.');
          console.log('   Ingrese este código en su celular para sincronizar.\n');
        } catch (err) {
          console.warn('⚠️ Error solicitando Pairing Code:', err.message);
        }
      }, 3500);
    }

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      // MODO CÓDIGO QR EN TERMINAL
      if (qr && configManager.get('pairingMethod') === 'qr') {
        console.log('\n📲 ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP PARA VINCULAR EL NÚMERO:\n');
        qrcode.generate(qr, { small: true });
        console.log('\n💡 Abre WhatsApp > Dispositivos vinculados > Vincular un dispositivo.\n');
      }

      if (connection === 'close') {
        isConnecting = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = (statusCode !== DisconnectReason.loggedOut);
        
        reconnectAttempts++;
        const backoffMs = Math.min(5000 * Math.pow(1.5, reconnectAttempts - 1), 60000);

        console.log(`⚠️ Conexión cerrada (${lastDisconnect?.error?.message || 'Desconexión'}). Reintentando en ${(backoffMs / 1000).toFixed(1)}s (Intento #${reconnectAttempts})...`);

        if (shouldReconnect) {
          setTimeout(() => {
            startJusticIAWhatsAppBot(onFatalErrorCallback);
          }, backoffMs);
        } else {
          console.log('\n❌ Sesión desvinculada en WhatsApp.');
          if (onFatalErrorCallback) {
            onFatalErrorCallback();
          } else {
            console.log('Por favor ejecute el asistente de Onboarding para re-vincular.');
          }
        }
      } else if (connection === 'open') {
        isConnecting = false;
        reconnectAttempts = 0;
        const userJid = sock.user ? sock.user.id.replace(/:.*@/, '@') : 'Línea WhatsApp Vinculada';
        console.log(`\n========================================================================`);
        console.log(`✅ ¡CONEXIÓN EXITOSA CON EL PROTOCOLO DE WHATSAPP!`);
        console.log(`📱 Línea Activa: [${userJid}]`);
        console.log(`🔑 Disparador de Activación: "!hola", "Hola" o saludos`);
        console.log(`🌐 Modos de Lenguaje: Lenguaje Claro Campesino | Técnico Jurídico`);
        console.log(`⚖️ Jurisdicción: 125 Municipios de Antioquia Mapeados`);
        console.log(`💬 Escuchando mensajes entrantes en tiempo real...\n========================================================================\n`);
      }
    });

    // Intercepción y procesamiento con Debouncing de ráfagas
    sock.ev.on('messages.upsert', async (m) => {
      try {
        if (m.type !== 'notify') return;

        for (const msg of m.messages) {
          const senderJid = msg.key.remoteJid;
          if (!senderJid) continue;

          // Ignorar difusiones masivas, grupos y canales
          if (isJidBroadcast(senderJid) || isJidGroup(senderJid) || isJidNewsletter(senderJid)) continue;

          // Guardar mensaje para reintentos de descifrado
          if (msg.key.id && msg.message) {
            messageStore.set(msg.key.id, msg.message);
          }

          const senderNum = cleanSenderNumber(senderJid);

          // Verificar autorización en Whitelist si está activa
          if (!configManager.isNumberAuthorized(senderNum)) {
            continue;
          }

          const unpacked = getUnpackedMessage(msg.message);
          if (!unpacked) continue;

          const textPart = extractMessageText(msg.message);

          // Detección segura de medios multimodales
          const isImage = !!unpacked.imageMessage;
          const isAudio = !!unpacked.audioMessage;
          const isDocument = !!unpacked.documentMessage;
          const hasMedia = isImage || isAudio || isDocument;

          let mediaPayload = null;
          if (hasMedia) {
            try {
              const targetMsg = { key: msg.key, message: unpacked };
              const buffer = await downloadMediaMessage(targetMsg, 'buffer', {});
              const ext = isAudio ? 'ogg' : (isImage ? 'jpg' : 'pdf');
              const filePath = path.join(TEMP_MEDIA_FOLDER, `${Date.now()}_${senderNum}.${ext}`);
              fs.writeFileSync(filePath, buffer);
              mediaPayload = { 
                type: isAudio ? 'audio' : (isImage ? 'image' : 'document'),
                filePath 
              };
            } catch (e) {
              // Continuar como texto si falla descarga
            }
          }

          // GESTIÓN DEL BUFFER DE RÁFAGA (DEBOUNCING CONVERSACIONAL)
          if (!userMessageBuffers.has(senderJid)) {
            userMessageBuffers.set(senderJid, { textParts: [], mediaPayload: null, lastMsgObj: msg });
          }

          const currentBuffer = userMessageBuffers.get(senderJid);
          if (textPart.trim()) currentBuffer.textParts.push(textPart.trim());
          if (mediaPayload) currentBuffer.mediaPayload = mediaPayload;
          currentBuffer.lastMsgObj = msg;

          // Cancelar temporizador previo y programar el procesamiento conjunto
          if (userBufferTimers.has(senderJid)) {
            clearTimeout(userBufferTimers.get(senderJid));
          }

          userBufferTimers.set(senderJid, setTimeout(async () => {
            userBufferTimers.delete(senderJid);
            const finalBuffer = userMessageBuffers.get(senderJid);
            userMessageBuffers.delete(senderJid);

            if (!finalBuffer) return;

            const consolidatedText = finalBuffer.textParts.join(' ');
            const finalMedia = finalBuffer.mediaPayload;

            if (!consolidatedText && !finalMedia) return;

            // Procesamiento en el Motor Agéntico JusticIA
            let responseObj = null;
            try {
              responseObj = await processMessage(senderJid, consolidatedText, finalMedia);
            } catch (procErr) {
              console.error(`❌ Error procesando mensaje de [${senderNum}]:`, procErr.message);
              autoHealCorruptedSession(senderJid);
              return;
            }

            if (!responseObj) {
              return;
            }

            console.log(`📩 Mensaje procesado de [${senderNum}]: "${consolidatedText || (finalMedia ? '[Archivo Multimedia]' : '')}"`);

            // 1. Mostrar estado "escribiendo..."
            try {
              await sock.sendPresenceUpdate('composing', senderJid);
            } catch (e) {}

            // 2. Delay humano de redacción (2.2 segundos)
            await new Promise(resolve => setTimeout(resolve, 2200));

            // 3. Despachar Minuta PDF o Mensaje de Texto
            if (responseObj.pdfPath && fs.existsSync(responseObj.pdfPath)) {
              await sock.sendMessage(senderJid, {
                document: fs.readFileSync(responseObj.pdfPath),
                mimetype: 'application/pdf',
                fileName: responseObj.pdfFileName || 'Minuta_Constitucional_Radicable.pdf',
                caption: responseObj.text
              }, { quoted: finalBuffer.lastMsgObj });
              console.log(`📄 Minuta PDF formal despachada a [${senderNum}]`);
            } else {
              await sock.sendMessage(senderJid, {
                text: responseObj.text
              }, { quoted: finalBuffer.lastMsgObj });
              console.log(`🤖 Respuesta enviada a [${senderNum}]`);
            }

            // 4. Restablecer presencia
            try {
              await sock.sendPresenceUpdate('paused', senderJid);
            } catch (e) {}

          }, DEBOUNCE_WINDOW_MS));
        }
      } catch (err) {
        console.error('[JusticIA Bot] Error en messages.upsert:', err.message || err);
      }
    });

  } catch (initErr) {
    isConnecting = false;
    console.error('❌ Error inicializando bot WhatsApp:', initErr.message);
    if (onFatalErrorCallback) {
      onFatalErrorCallback();
    } else {
      setTimeout(() => startJusticIAWhatsAppBot(), 10000);
    }
  }
}

function startSimulator() {
  const { spawn } = require('child_process');
  const sim = spawn('node', [path.join(__dirname, 'simulator-cli.js')], { stdio: 'inherit' });
  sim.on('close', () => process.exit(0));
}

// INICIAR AUTOMÁTICAMENTE EL ONBOARDING SI ES PRIMERA EJECUCIÓN O EN EJECUCIÓN MANUAL
if (require.main === module) {
  const isFirstRun = !fs.existsSync(AUTH_FOLDER) || fs.readdirSync(AUTH_FOLDER).length < 2;
  const forceDirectStart = process.argv.includes('--start') || process.argv.includes('-s');

  if (isFirstRun || !forceDirectStart) {
    runOnboardingWizard(
      () => startJusticIAWhatsAppBot(() => runOnboardingWizard(startJusticIAWhatsAppBot, startSimulator)),
      () => startSimulator()
    );
  } else {
    startJusticIAWhatsAppBot(() => runOnboardingWizard(startJusticIAWhatsAppBot, startSimulator));
  }
}

module.exports = { startJusticIAWhatsAppBot };
