const assert = require('assert');
const { parseVoiceFeedback } = require('../src/voice-intent-parser');
const { injectRemorseParagraph } = require('../src/remorse-tone-injector');

console.log('🧪 Ejecutando voice_intent_and_remorse.test.js...');

const ptt1 = "Ilustre no, ya revisé la vuelta y no, hay que organizarlo. Dejar eso siquiera en tres hojitas, más entendible, más digerible, está muy tosco el coso.";
const intent1 = parseVoiceFeedback(ptt1);
assert(intent1.wantsShorten, 'Debe detectar solicitud de acortar a 3 hojas');

const ptt2 = "Epa, que en esa solicitud se vea como un poquito de arrepentimiento por ahí por los laditos, más humano, y quitar las palabras de tratamiento clínico.";
const intent2 = parseVoiceFeedback(ptt2);
assert(intent2.wantsRemorseOrHumanTouch, 'Debe detectar toque humano y arrepentimiento');
assert(intent2.wantsDeclinicalize, 'Debe detectar remoción de término clínico');

const remorse = injectRemorseParagraph('el profesor Felipe Lopera', 'la coordinación');
assert(remorse.includes('me equivoqué'), 'Debe incluir autocrítica sincera');
assert(remorse.includes('Felipe Lopera'), 'Debe referenciar al profesor asesor');

console.log('✅ voice_intent_and_remorse.test.js pasó exitosamente.');
