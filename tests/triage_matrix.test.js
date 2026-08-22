const assert = require('assert');
const { processMessage } = require('../src/harness-engine');

async function testTriage() {
  const jid = 'test_triage@s.whatsapp.net';
  let r = await processMessage(jid, '!hola');
  assert(r && r.text.includes('Habeas Data'), 'Debe iniciar con Habeas Data');
  console.log('✔ Test Triage Matrix: Passed');
}
testTriage();
