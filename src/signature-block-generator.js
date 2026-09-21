/**
 * Generador de Bloque de Firma Institucional sin Dirección Domiciliaria
 */

function generateSignatureBlock(userData) {
  return (
    `Con mi sincero agradecimiento y respeto,\n\n\n` +
    `___________________________________________________\n` +
    `*${userData.nombre.toUpperCase()}*\n` +
    `C.C. No. ${userData.cedula}\n` +
    `Estudiante de ${userData.programa || 'Ciencia Política'} (${userData.nivel || 'Nivel 7-8'})\n` +
    `Facultad de Derecho y Ciencias Políticas\n` +
    `Universidad de Antioquia (UdeA)\n` +
    `Celular: ${userData.telefono || userData.celular}\n` +
    `Correo: ${userData.correoInstitucional || userData.correo}\n`
  );
}

module.exports = {
  generateSignatureBlock
};
