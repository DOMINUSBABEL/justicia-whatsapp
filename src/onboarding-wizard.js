const readline = require('readline');
const fs = require('fs');
const path = require('path');
const configManager = require('./config-manager');

const AUTH_FOLDER = path.join(__dirname, '..', 'whatsapp_auth_info');

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function showBanner() {
  const hasAuth = fs.existsSync(AUTH_FOLDER) && fs.readdirSync(AUTH_FOLDER).length > 2;
  console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚖️  JUSTICIA WHATSAPP — ONBOARDING & CONTROL CENTER                 ┃
┃  🏛️  Agenda Antioquia 2040 | Cátedra G8 (EAFIT, UPB, UdeA, Unilas.)   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  [Proyecto]:  ${configManager.get('projectName')}
  [Línea]:     +${configManager.get('phoneNumber')}
  [Método]:    ${configManager.get('pairingMethod') === 'code' ? '🔑 Código de 8 Dígitos (Pairing Code)' : '📲 Código QR (Terminal)'}
  [Modo]:      ${configManager.get('autoReplyMode').toUpperCase()} (${
    configManager.get('autoReplyMode') === 'all' 
      ? 'Responde a todos los chats' 
      : 'Solo Lista Blanca (Whitelist)'
  })
  [Estado]:    ${hasAuth ? '✅ Sesión Guardada / Vinculada' : '⚠️ Sin Vinculación / Requiere Conexión'}
───────────────────────────────────────────────────────────────────────
`);
}

function runOnboardingWizard(onStartServerCallback, onRunSimulatorCallback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function mainMenu() {
    clearScreen();
    showBanner();

    console.log(`📋 OPCIONES DE GESTIÓN Y OPERACIÓN:\n`);
    console.log(`  [1] 🚀 INICIAR MOTOR JUSTICIA WHATSAPP EN VIVO`);
    console.log(`  [2] 🛠️  AUTO-REPARAR & LIMPIAR SESIÓN CORRUPTA (Soluciona MessageCounterError / Bad MAC)`);
    console.log(`  [3] 🔑 Cambiar Método de Vinculación (Código QR vs Código de 8 Dígitos)`);
    console.log(`  [4] 📱 Configurar Número de Teléfono Oficial (+${configManager.get('phoneNumber')})`);
    console.log(`  [5] 🔒 Gestionar Modo de Acceso (Todos los chats vs Lista Blanca)`);
    console.log(`  [6] 🖥️  Ejecutar Simulador Interactivo de Consola (Offline)`);
    console.log(`  [7] 📊 Ver Diagnóstico de Estado y Salud del Protocolo`);
    console.log(`  [8] 🌐 Iniciar Sitio Web Oficial & Panel Analítico (http://localhost:3080)`);
    console.log(`  [0] ❌ Salir\n`);

    rl.question('👉 Selecciona una opción (0-8): ', (choice) => {
      const option = choice.trim();

      switch (option) {
        case '1':
          rl.close();
          console.log('\n🚀 Iniciando motor de comunicación JusticIA...\n');
          onStartServerCallback();
          break;

        case '2':
          repairSession(rl, mainMenu);
          break;

        case '3':
          togglePairingMethod(rl, mainMenu);
          break;

        case '4':
          configurePhoneNumber(rl, mainMenu);
          break;

        case '5':
          configureReplyMode(rl, mainMenu);
          break;

        case '6':
          rl.close();
          onRunSimulatorCallback();
          break;

        case '7':
          showDiagnostics(rl, mainMenu);
          break;

        case '8': {
          rl.close();
          const { startWebPortal } = require('./api-server');
          startWebPortal(3080);
          break;
        }

        case '0':
          console.log('\n👋 Saliendo de JusticIA Onboarding. ¡Hasta pronto!\n');
          rl.close();
          process.exit(0);
          break;

        default:
          console.log('\n⚠️ Opción no válida.');
          rl.question('\nPresione Enter para continuar...', () => mainMenu());
          break;
      }
    });
  }

  mainMenu();
}

/**
 * Auto-Reparación y Purga de Claves Signal Corruptas
 */
function repairSession(rl, backCallback) {
  clearScreen();
  showBanner();
  console.log(`🛠️  AUTO-REPARACIÓN & PURGA DE SESIÓN DE WHATSAPP:\n`);
  console.log(`Esta herramienta soluciona los errores de descifrado Signal:`);
  console.log(`• "MessageCounterError: Key used already or never filled"`);
  console.log(`• "Error: Bad MAC"\n`);
  console.log(`Al ejecutar esta opción:`);
  console.log(`1. Se purgan los archivos de pre-claves desincronizados en "whatsapp_auth_info/".`);
  console.log(`2. Se genera un nuevo apretón de manos criptográfico limpio con WhatsApp.\n`);

  rl.question('¿Desea limpiar y reparar la sesión ahora? (s/n): ', (ans) => {
    if (ans.trim().toLowerCase() === 's' || ans.trim().toLowerCase() === 'si') {
      try {
        if (fs.existsSync(AUTH_FOLDER)) {
          fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
        }
        console.log('\n✅ ¡SESIÓN PURGADA Y REPARADA EXITOSAMENTE!');
        console.log('Al iniciar el bot en la opción [1], se generará una vinculación 100% limpia y sincronizada.');
      } catch (err) {
        console.error('\n❌ Error durante la reparación:', err.message);
      }
    } else {
      console.log('\nOperación cancelada.');
    }
    rl.question('\nPresione Enter para volver al menú...', () => backCallback());
  });
}

function togglePairingMethod(rl, backCallback) {
  clearScreen();
  showBanner();
  const current = configManager.get('pairingMethod');
  console.log(`🔑 MÉTODO DE VINCULACIÓN ACTUAL: [${current === 'code' ? 'Código de 8 Dígitos' : 'Código QR'}]\n`);
  console.log(`  1. 📲 Código QR en Terminal (Escanear con la cámara de WhatsApp)`);
  console.log(`  2. 🔢 Código de Emparejamiento de 8 Dígitos (Ingresar código en el teléfono)\n`);

  rl.question('👉 Seleccione el método deseado (1 o 2): ', (ans) => {
    if (ans.trim() === '1') {
      configManager.set('pairingMethod', 'qr');
      console.log('\n✅ Método establecido en: CÓDIGO QR EN TERMINAL');
    } else if (ans.trim() === '2') {
      configManager.set('pairingMethod', 'code');
      console.log('\n✅ Método establecido en: CÓDIGO DE 8 DÍGITOS (PAIRING CODE)');
    } else {
      console.log('\n⚠️ Opción no válida.');
    }
    rl.question('\nPresione Enter para volver...', () => backCallback());
  });
}

function configurePhoneNumber(rl, backCallback) {
  clearScreen();
  showBanner();
  console.log(`📱 CONFIGURACIÓN DEL NÚMERO DE TELÉFONO OFICIAL:\n`);
  console.log(`  Número actual: +${configManager.get('phoneNumber')}\n`);

  rl.question('Ingrese el nuevo número (con código de país, ej: 573117272822): ', (num) => {
    const clean = num.replace(/\D/g, '');
    if (clean.length >= 10) {
      configManager.set('phoneNumber', clean);
      const whitelist = configManager.get('whitelistNumbers') || [];
      if (!whitelist.includes(clean)) {
        whitelist.push(clean);
        configManager.set('whitelistNumbers', whitelist);
      }
      console.log(`\n✅ Número actualizado a: +${clean}`);
    } else if (num.trim() === '') {
      console.log('\nSe mantuvo el número actual.');
    } else {
      console.log('\n⚠️ Número no válido (debe tener al menos 10 dígitos).');
    }
    rl.question('\nPresione Enter para volver...', () => backCallback());
  });
}

function configureReplyMode(rl, backCallback) {
  clearScreen();
  showBanner();
  console.log(`🔒 CONFIGURACIÓN DEL MODO DE ACCESO:\n`);
  console.log(`  1. 🌐 Modo Abierto (ALL): Atiende a cualquier ciudadano que escriba "!hola".`);
  console.log(`  2. 🔒 Modo Lista Blanca (Whitelist): Solo atiende a los números de prueba autorizados.\n`);

  rl.question('👉 Seleccione el modo (1 o 2): ', (ans) => {
    if (ans.trim() === '1') {
      configManager.set('autoReplyMode', 'all');
      console.log('\n✅ Modo establecido en: RESPONDER A TODOS LOS CIUDADANOS');
    } else if (ans.trim() === '2') {
      configManager.set('autoReplyMode', 'whitelist');
      console.log('\n✅ Modo establecido en: SOLO LISTA BLANCA');
    } else {
      console.log('\n⚠️ Opción no válida.');
    }
    rl.question('\nPresione Enter para volver...', () => backCallback());
  });
}

function showDiagnostics(rl, backCallback) {
  clearScreen();
  showBanner();
  console.log(`📊 DIAGNÓSTICO DEL SISTEMA Y SALUD DEL PROTOCOLO:\n`);
  
  const authFiles = fs.existsSync(AUTH_FOLDER) ? fs.readdirSync(AUTH_FOLDER) : [];
  const sessionCount = authFiles.filter(f => f.startsWith('session-')).length;
  const preKeyCount = authFiles.filter(f => f.startsWith('pre-key-')).length;

  console.log(`• Directorio de Auth:     ${AUTH_FOLDER}`);
  console.log(`• Archivos de Llaves:     ${authFiles.length} archivos`);
  console.log(`• Sesiones Activas:       ${sessionCount}`);
  console.log(`• Pre-Keys Sincronizadas: ${preKeyCount}`);
  console.log(`• Auto-Reparación Signal: ${configManager.get('autoRepairCorruptedSessions') ? 'ACTIVADA' : 'DESACTIVADA'}`);
  console.log(`\nConfiguración JSON:`);
  console.log(JSON.stringify(configManager.config, null, 2));

  rl.question('\nPresione Enter para volver al menú...', () => backCallback());
}

module.exports = { runOnboardingWizard };
