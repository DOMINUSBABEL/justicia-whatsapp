/**
 * Curador del Paquete Probatorio Tripartito
 * Estructura y valida los tres anexos indispensables en cancelaciones académicas por salud.
 */

function curateEvidenceBundle(params) {
  const {
    cedulaNumero = '1.152.709.406',
    municipioExpedicion = 'Medellín',
    nombre = 'Julián González García',
    coordinadora = 'Profesora Sandra',
    profesorAsesor = 'Profesor Felipe Lopera',
    fechaOficio = '16 de septiembre de 2026',
    materiaAsesorada = 'Seminario de Investigación'
  } = params;

  return [
    {
      orden: 1,
      tipo: "IDENTIFICACION",
      titulo: `Copia legible de la Cédula de Ciudadanía No. ${cedulaNumero} de ${municipioExpedicion}`,
      titular: nombre,
      finalidad: "Acreditar legitimación en la causa por activa y personería jurídica propia."
    },
    {
      orden: 2,
      tipo: "COMUNICACION_INSTITUCIONAL",
      titulo: `Copia de la comunicación institucional de la Coordinación de Pregrado (${coordinadora}), con fecha ${fechaOficio}`,
      descripcion: `Oficio remitido para adjuntar al Consejo de Facultad donde se da cuenta de los reportes del asesor ${profesorAsesor} y las inasistencias en el curso ${materiaAsesorada}.`,
      finalidad: "Constancia de conocimiento institucional y buena fe del estudiante."
    },
    {
      orden: 3,
      tipo: "SOPORTE_SALUD",
      titulo: "Certificación o constancia del proceso de acompañamiento y tratamiento psicológico",
      descripcion: "Expedido por los profesionales tratantes en salud mental y bienestar emocional.",
      finalidad: "Acreditar la ocurrencia de la fuerza mayor o afectación de salud sobrevenida."
    }
  ];
}

module.exports = {
  curateEvidenceBundle
};
