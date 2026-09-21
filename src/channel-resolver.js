/**
 * Resolutor Dinámico de Canales de Contacto
 * Permite omitir la dirección física domiciliaria cuando el trámite es de naturaleza universitaria.
 */

function resolveNotificationChannels(contactData, omitPhysicalAddress = true) {
  const channels = [];
  if (contactData.telefono || contactData.celular) {
    channels.push(`• Celular / WhatsApp: ${contactData.celular || contactData.telefono}`);
  }
  if (contactData.correoInstitucional || contactData.correo) {
    channels.push(`• Correo electrónico institucional: ${contactData.correoInstitucional || contactData.correo}`);
  }
  if (!omitPhysicalAddress && contactData.direccionFisica) {
    channels.push(`• Dirección de correspondencia: ${contactData.direccionFisica}`);
  }
  return channels.join('\n');
}

module.exports = {
  resolveNotificationChannels
};
