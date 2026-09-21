/**
 * Motor de Presupuesto de Páginas (Regla de Oro de las 3 Páginas)
 * Asegura que los memoriales y peticiones sean concisos, directos y legibles.
 */

const SECTION_BUDGETS = {
  header: { maxWords: 50, targetWords: 35 },
  subjectAndParties: { maxWords: 80, targetWords: 60 },
  intro: { maxWords: 100, targetWords: 80 },
  courseList: { maxWords: 80, targetWords: 50 },
  factualNarrative: { maxWords: 320, targetWords: 260 },
  commitmentAndTreatment: { maxWords: 140, targetWords: 110 },
  legalGrounds: { maxWords: 180, targetWords: 150 },
  petitions: { maxWords: 150, targetWords: 120 },
  annexes: { maxWords: 60, targetWords: 45 },
  notifications: { maxWords: 40, targetWords: 25 },
  signature: { maxWords: 40, targetWords: 25 }
};

const MAX_TOTAL_DOCUMENT_WORDS = 1150;
const MIN_TOTAL_DOCUMENT_WORDS = 700;

function calculateWordCount(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validateDocumentBudget(docSections) {
  let totalWords = 0;
  const sectionReport = {};

  for (const [key, text] of Object.entries(docSections)) {
    const count = calculateWordCount(text);
    totalWords += count;
    const budget = SECTION_BUDGETS[key] || { maxWords: 200, targetWords: 150 };
    sectionReport[key] = {
      words: count,
      budget: budget.maxWords,
      exceeded: count > budget.maxWords
    };
  }

  return {
    totalWords,
    estimatedPages: Number((totalWords / 380).toFixed(1)),
    fitsIn3Pages: totalWords <= MAX_TOTAL_DOCUMENT_WORDS,
    sectionReport
  };
}

module.exports = {
  SECTION_BUDGETS,
  MAX_TOTAL_DOCUMENT_WORDS,
  MIN_TOTAL_DOCUMENT_WORDS,
  calculateWordCount,
  validateDocumentBudget
};
