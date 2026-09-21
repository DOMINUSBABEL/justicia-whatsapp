/**
 * Inyector de Tono de Arrepentimiento Sincero y Vulnerabilidad Humana
 * Modula la narrativa fáctica reconociendo errores procedimentales sin vulnerar el fondo de derecho.
 */

function injectRemorseParagraph(advisorName = 'el profesor asesor', coordinatorName = 'la coordinación') {
  return (
    `Hoy quiero expresar ante este Consejo una autocrítica sincera y con total transparencia: reconozco que me equivoqué. ` +
    `En su momento, mi asesor (${advisorName}) reportó mis inasistencias a ${coordinatorName}, y se intentó orientarme para ` +
    `activar la ruta de apoyo institucional. Sin embargo, en medio del agobio, la pena y el bloqueo en que me encontraba, ` +
    `me encerré en mí mismo, pensé erróneamente que podría manejar el asunto por mi propia cuenta y no di el paso de acudir ` +
    `al acompañamiento que me ofrecieron. Lamento no haber reaccionado con la madurez necesaria en ese instante; ` +
    `el aislamiento terminó agravando la situación y conllevó a que reprobara las materias por inasistencia acumulada.`
  );
}

function injectHumaneCommitmentParagraph(programName = 'Ciencia Política', level = '7-8') {
  return (
    `Actualmente me encuentro adelantando un proceso de acompañamiento y tratamiento psicológico que me ha brindado herramientas ` +
    `para recuperar mi bienestar y estabilizar mi ritmo de vida. Mi vocación y entusiasmo por la carrera de ${programName} siguen firmes. ` +
    `No busco una ventaja académica indebida, sino una oportunidad comprensiva y justa para superar este tropiezo, proteger mi calidad ` +
    `de estudiante regular y continuar cursando con dedicación las materias que me restan en los niveles ${level} hasta graduarme con orgullo.`
  );
}

module.exports = {
  injectRemorseParagraph,
  injectHumaneCommitmentParagraph
};
