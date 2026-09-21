/**
 * Guardián de Permanencia y Promedio de Crédito
 * Asegura que las notas reprobatorias por inasistencia médica no vicien el historial ni expulsen al alumno.
 */

function buildStandingProtectionPetitions(courseList = [], semester = '2026-1') {
  const courseDescriptions = courseList.map(c => `   • ${c.codigo} - ${c.nombre}`).join('\n');

  return {
    primera: `Autorizar la cancelación extemporánea de las asignaturas matriculadas en el semestre académico ${semester}:\n${courseDescriptions}\nlo anterior por mediar fuerza mayor sobrevenida en razón de afecciones transitorias de salud debidamente justificadas.`,
    segunda: `Disponer el retiro o anulación de las notas reprobatorias derivadas de la inasistencia involuntaria en dichas materias en el sistema institucional de calificaciones, de tal manera que NO sean computadas en el promedio de crédito ni generen causal de pérdida de cupo por rendimiento insuficiente en el semestre ${semester}.`,
    tercera: `Salvaguardar mi permanencia y cupo universitario como estudiante regular, garantizando mi derecho a continuar normalmente mis estudios en los niveles avanzados para culminar el plan de estudios y optar al título profesional.`
  };
}

module.exports = {
  buildStandingProtectionPetitions
};
