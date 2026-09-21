/**
 * Constructor de Hechos Académicos Circunstanciados
 * Estructura la cronología fáctica con reporte de asesor, coordinación y contingencia de salud.
 */

function buildChronologicalFacts(params) {
  const {
    nombre = 'El estudiante',
    programa = 'Ciencia Política',
    nivel = '7-8',
    semestre = '2026-1',
    materias = [],
    asesor = 'el profesor asesor',
    coordinador = 'la Coordinación de Pregrado',
    fechaAviso = '16 de septiembre de 2026',
    factoresDetonantes = 'dificultades en el plano interpersonal y afectivo, aunadas a presiones de índole económica'
  } = params;

  return [
    `1. Matrícula y trayectoria formativa: Me encuentro debidamente matriculado en el programa de ${programa}, habiendo avanzado satisfactoriamente hasta los niveles ${nivel} de mi carrera.`,
    `2. Contingencia de salud emocional sobrevenida: Durante el transcurso del semestre ${semestre}, experimenté una dificultad severa en mi salud mental que afectó de manera crítica mi concentración, ánimo y funcionalidad cotidiana. Dicha crisis no surgió en el vacío ni por simple desinterés, sino que se originó a partir de una compleja situación personal detonada por ${factoresDetonantes}, factores que en ese momento sobrepasaron mis recursos anímicos.`,
    `3. Inasistencia involuntaria: A causa de dicho bloqueo emocional involuntario, me vi imposibilitado para asistir físicamente a las clases y a las sesiones de asesoría académica programadas.`,
    `4. Comunicación con asesoría y coordinación: En la asignatura Seminario de Investigación, el asesor (${asesor}) reportó la inasistencia a ${coordinador}. Se entabló comunicación preliminar (${fechaAviso}), pero la situación de bloqueo emocional impidió la activación oportuna del acompañamiento institucional en dicho momento.`,
    `5. Afectación en asignaturas matriculadas: La misma dificultad impactó las asignaturas cursadas (${materias.map(m => m.nombre || m).join(', ')}), conllevando a una reprobación derivada estrictamente de la inasistencia obligada por motivos de salud.`,
    `6. Inminente riesgo de pérdida de cupo: Al asentarse calificaciones reprobatorias no atribuibles a desidia voluntaria, mi promedio resulta distorsionado, situándome en inminente riesgo de exclusión por rendimiento insuficiente.`
  ];
}

module.exports = {
  buildChronologicalFacts
};
