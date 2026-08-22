const { processMessage } = require('./harness-engine');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const TEST_JID = '573117272822@s.whatsapp.net';

console.log('\n========================================================================');
console.log('⚖️ SIMULADOR DE CONSOLA — HARNESS JUSTICIA WHATSAPP V2.0');
console.log('🏛️ Agenda Antioquia 2040 | Cátedra G8 (EAFIT, UPB, UdeA, Unilasallista)');
console.log('========================================================================');
console.log('💡 Escriba "!hola", "hola" o cualquier saludo para iniciar la asistencia.\n');

function promptUser() {
  rl.question('👤 CIUDADANO: ', async (ans) => {
    const trimmed = ans.trim();
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'salir') {
      rl.close();
      process.exit(0);
    }

    const res = await processMessage(TEST_JID, trimmed);
    if (!res) {
      console.log('🤫 [Bot en reposo: Mensaje ignorado. Escriba "!hola" o "Hola" para activar]\n');
      promptUser();
      return;
    }

    console.log('⏳ (Procesando con delay y razonamiento agéntico...)');
    setTimeout(() => {
      console.log('\n🤖 JUSTICIA BOT:');
      console.log(res.text);
      if (res.pdfPath) {
        console.log(`\n📄 [MINUTA PDF GENERADA]: ${res.pdfPath}`);
      }
      console.log('\n' + '─'.repeat(70) + '\n');
      promptUser();
    }, 1000);
  });
}

promptUser();
