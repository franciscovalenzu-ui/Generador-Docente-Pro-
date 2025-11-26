
import { Exercise, ExerciseType, Difficulty } from './types';

// ===========================================================================
// BASE DE DATOS MANUAL (CON EJERCICIOS DE EJEMPLO)
// ===========================================================================

export const MANUAL_DATABASE: Exercise[] = [
  // MATEMÁTICAS
  {
    id: 'mat-001',
    subject: 'Matemáticas', grade: '1° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: 'Si tienes 3 manzanas y te regalan 2 más, ¿cuántas tienes?\nA) 4\nB) 5\nC) 6\nD) 2\n\nRespuesta: B\nHabilidad: Resolver problemas',
    htmlContent: '<p>Si tienes 3 manzanas y te regalan 2 más, ¿cuántas tienes?</p><ul><li>A) 4</li><li>B) 5</li><li>C) 6</li><li>D) 2</li></ul>',
    parsedContent: { studentContent: 'Si tienes 3 manzanas y te regalan 2 más, ¿cuántas tienes?\nA) 4\nB) 5\nC) 6\nD) 2', answerKey: 'Respuesta: B', skill: 'Habilidad: Resolver problemas', hasMetadata: true },
    filename: 'mat-001.txt', oa: 'OA-06', indicator: 'Contar', tags: ['suma']
  },
  {
    id: 'mat-002',
    subject: 'Matemáticas', grade: '7° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: 'Un termómetro marca 7 grados Celsius bajo cero. ¿Qué número entero representa esta temperatura?\nA) 7\nB) 0\nC) -7\nD) No se puede representar.\n\nRespuesta: C\nHabilidad: Representar',
    htmlContent: '<p>Un termómetro marca 7 grados Celsius bajo cero. ¿Qué número entero representa esta temperatura?</p><ul><li>A) 7</li><li>B) 0</li><li>C) -7</li><li>D) No se puede representar.</li></ul>',
    parsedContent: { studentContent: 'Un termómetro marca 7 grados Celsius bajo cero. ¿Qué número entero representa esta temperatura?\nA) 7\nB) 0\nC) -7\nD) No se puede representar.', answerKey: 'Respuesta: C', skill: 'Habilidad: Representar', hasMetadata: true },
    filename: 'mat-002.txt', oa: 'OA-08', indicator: 'Comprender números enteros', tags: ['números enteros']
  },

  // LENGUAJE
  {
    id: 'len-001',
    subject: 'Lenguaje', grade: '2° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: '¿Cuál de estas palabras es un sustantivo?\nA) Correr\nB) Bonito\nC) Casa\nD) Rápidamente\n\nRespuesta: C\nHabilidad: Identificar',
    htmlContent: '<p>¿Cuál de estas palabras es un sustantivo?</p><ul><li>A) Correr</li><li>B) Bonito</li><li>C) Casa</li><li>D) Rápidamente</li></ul>',
    parsedContent: { studentContent: '¿Cuál de estas palabras es un sustantivo?\nA) Correr\nB) Bonito\nC) Casa\nD) Rápidamente', answerKey: 'Respuesta: C', skill: 'Habilidad: Identificar', hasMetadata: true },
    filename: 'len-001.txt', oa: 'OA-14', indicator: 'Reconocer tipos de palabras', tags: ['gramática']
  },
  {
    id: 'len-002',
    subject: 'Lenguaje', grade: 'I Medio', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.MED,
    content: '¿Qué figura literaria se utiliza en la frase: "El tiempo es oro"?\nA) Metáfora\nB) Símil\nC) Hipérbole\nD) Personificación\n\nRespuesta: A\nHabilidad: Analizar',
    htmlContent: '<p>¿Qué figura literaria se utiliza en la frase: "El tiempo es oro"?</p><ul><li>A) Metáfora</li><li>B) Símil</li><li>C) Hipérbole</li><li>D) Personificación</li></ul>',
    parsedContent: { studentContent: '¿Qué figura literaria se utiliza en la frase: "El tiempo es oro"?\nA) Metáfora\nB) Símil\nC) Hipérbole\nD) Personificación', answerKey: 'Respuesta: A', skill: 'Habilidad: Analizar', hasMetadata: true },
    filename: 'len-002.txt', oa: 'OA-08', indicator: 'Interpretar lenguaje figurado', tags: ['figuras literarias']
  },

  // HISTORIA
  {
    id: 'hist-001',
    subject: 'Historia', grade: '4° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: '¿Cuál de estas civilizaciones es conocida por construir las pirámides?\nA) Romana\nB) Griega\nC) Egipcia\nD) Inca\n\nRespuesta: C\nHabilidad: Reconocer',
    htmlContent: '<p>¿Cuál de estas civilizaciones es conocida por construir las pirámides?</p><ul><li>A) Romana</li><li>B) Griega</li><li>C) Egipcia</li><li>D) Inca</li></ul>',
    parsedContent: { studentContent: '¿Cuál de estas civilizaciones es conocida por construir las pirámides?\nA) Romana\nB) Griega\nC) Egipcia\nD) Inca', answerKey: 'Respuesta: C', skill: 'Habilidad: Reconocer', hasMetadata: true },
    filename: 'hist-001.txt', oa: 'OA-03', indicator: 'Identificar civilizaciones antiguas', tags: ['antigüedad']
  },
  {
    id: 'hist-002',
    subject: 'Historia', grade: 'II Medio', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.MED,
    content: '¿Qué evento marca el fin de la Edad Antigua y el inicio de la Edad Media?\nA) El descubrimiento de América\nB) La caída del Imperio Romano de Occidente\nC) La Revolución Francesa\nD) La invención de la imprenta\n\nRespuesta: B\nHabilidad: Contextualizar',
    htmlContent: '<p>¿Qué evento marca el fin de la Edad Antigua y el inicio de la Edad Media?</p><ul><li>A) El descubrimiento de América</li><li>B) La caída del Imperio Romano de Occidente</li><li>C) La Revolución Francesa</li><li>D) La invención de la imprenta</li></ul>',
    parsedContent: { studentContent: '¿Qué evento marca el fin de la Edad Antigua y el inicio de la Edad Media?\nA) El descubrimiento de América\nB) La caída del Imperio Romano de Occidente\nC) La Revolución Francesa\nD) La invención de la imprenta', answerKey: 'Respuesta: B', skill: 'Habilidad: Contextualizar', hasMetadata: true },
    filename: 'hist-002.txt', oa: 'OA-01', indicator: 'Periodificar la historia', tags: ['edad media']
  },
  
  // CIENCIAS NATURALES
  {
    id: 'cien-001',
    subject: 'Ciencias Naturales', grade: '3° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: '¿Cuál es el planeta más cercano al Sol?\nA) Venus\nB) Tierra\nC) Mercurio\nD) Marte\n\nRespuesta: C\nHabilidad: Identificar',
    htmlContent: '<p>¿Cuál es el planeta más cercano al Sol?</p><ul><li>A) Venus</li><li>B) Tierra</li><li>C) Mercurio</li><li>D) Marte</li></ul>',
    parsedContent: { studentContent: '¿Cuál es el planeta más cercano al Sol?\nA) Venus\nB) Tierra\nC) Mercurio\nD) Marte', answerKey: 'Respuesta: C', skill: 'Habilidad: Identificar', hasMetadata: true },
    filename: 'cien-001.txt', oa: 'OA-06', indicator: 'Describir el sistema solar', tags: ['planetas']
  },

  // QUÍMICA
  {
    id: 'qui-001',
    subject: 'Química', grade: 'I Medio', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.MED,
    content: '¿Cuál es el símbolo químico del agua?\nA) O2\nB) CO2\nC) H2O\nD) NaCl\n\nRespuesta: C\nHabilidad: Reconocer fórmulas',
    htmlContent: '<p>¿Cuál es el símbolo químico del agua?</p><ul><li>A) O2</li><li>B) CO2</li><li>C) H2O</li><li>D) NaCl</li></ul>',
    parsedContent: { studentContent: '¿Cuál es el símbolo químico del agua?\nA) O2\nB) CO2\nC) H2O\nD) NaCl', answerKey: 'Respuesta: C', skill: 'Habilidad: Reconocer fórmulas', hasMetadata: true },
    filename: 'qui-001.txt', oa: 'OA-14', indicator: 'Reconocer compuestos comunes', tags: ['moléculas']
  },

  // FÍSICA
  {
    id: 'fis-001',
    subject: 'Física', grade: 'II Medio', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.MED,
    content: '¿Qué ley de Newton afirma que "a toda acción le corresponde una reacción de igual magnitud y sentido opuesto"?\nA) Primera Ley\nB) Segunda Ley\nC) Tercera Ley\nD) Ley de Gravitación Universal\n\nRespuesta: C\nHabilidad: Aplicar principios',
    htmlContent: '<p>¿Qué ley de Newton afirma que "a toda acción le corresponde una reacción de igual magnitud y sentido opuesto"?</p><ul><li>A) Primera Ley</li><li>B) Segunda Ley</li><li>C) Tercera Ley</li><li>D) Ley de Gravitación Universal</li></ul>',
    parsedContent: { studentContent: '¿Qué ley de Newton afirma que "a toda acción le corresponde una reacción de igual magnitud y sentido opuesto"?\nA) Primera Ley\nB) Segunda Ley\nC) Tercera Ley\nD) Ley de Gravitación Universal', answerKey: 'Respuesta: C', skill: 'Habilidad: Aplicar principios', hasMetadata: true },
    filename: 'fis-001.txt', oa: 'OA-09', indicator: 'Comprender las leyes de Newton', tags: ['leyes de newton']
  },

  // BIOLOGÍA
  {
    id: 'bio-001',
    subject: 'Biología', grade: '8° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.MED,
    content: '¿Qué organelo es conocido como la "central energética" de la célula?\nA) Núcleo\nB) Mitocondria\nC) Ribosoma\nD) Membrana plasmática\n\nRespuesta: B\nHabilidad: Describir',
    htmlContent: '<p>¿Qué organelo es conocido como la "central energética" de la célula?</p><ul><li>A) Núcleo</li><li>B) Mitocondria</li><li>C) Ribosoma</li><li>D) Membrana plasmática</li></ul>',
    parsedContent: { studentContent: '¿Qué organelo es conocido como la "central energética" de la célula?\nA) Núcleo\nB) Mitocondria\nC) Ribosoma\nD) Membrana plasmática', answerKey: 'Respuesta: B', skill: 'Habilidad: Describir', hasMetadata: true },
    filename: 'bio-001.txt', oa: 'OA-01', indicator: 'Explicar la función de organelos', tags: ['célula']
  },

  // INGLÉS
  {
    id: 'ing-001',
    subject: 'Inglés', grade: '6° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: 'Which word is a verb?\nA) House\nB) Happy\nC) Eat\nD) Quickly\n\nRespuesta: C\nHabilidad: Identify',
    htmlContent: '<p>Which word is a verb?</p><ul><li>A) House</li><li>B) Happy</li><li>C) Eat</li><li>D) Quickly</li></ul>',
    parsedContent: { studentContent: 'Which word is a verb?\nA) House\nB) Happy\nC) Eat\nD) Quickly', answerKey: 'Respuesta: C', skill: 'Habilidad: Identify', hasMetadata: true },
    filename: 'ing-001.txt', oa: 'OA-05', indicator: 'Recognize parts of speech', tags: ['grammar']
  },

  // TECNOLOGÍA
  {
    id: 'tec-001',
    subject: 'Tecnología', grade: 'I Medio', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: '¿Qué es un algoritmo?\nA) Un dispositivo físico\nB) Un lenguaje de programación\nC) Un conjunto de instrucciones para resolver un problema\nD) Un tipo de software\n\nRespuesta: C\nHabilidad: Definir',
    htmlContent: '<p>¿Qué es un algoritmo?</p><ul><li>A) Un dispositivo físico</li><li>B) Un lenguaje de programación</li><li>C) Un conjunto de instrucciones para resolver un problema</li><li>D) Un tipo de software</li></ul>',
    parsedContent: { studentContent: '¿Qué es un algoritmo?\nA) Un dispositivo físico\nB) Un lenguaje de programación\nC) Un conjunto de instrucciones para resolver un problema\nD) Un tipo de software', answerKey: 'Respuesta: C', skill: 'Habilidad: Definir', hasMetadata: true },
    filename: 'tec-001.txt', oa: 'OA-01', indicator: 'Comprender conceptos tecnológicos básicos', tags: ['algoritmos']
  },

  // ARTES
  {
    id: 'art-001',
    subject: 'Artes', grade: '5° Básico', type: ExerciseType.MULTIPLE_CHOICE, difficulty: Difficulty.BAS,
    content: '¿Cuál de los siguientes es un color primario?\nA) Verde\nB) Naranja\nC) Azul\nD) Morado\n\nRespuesta: C\nHabilidad: Clasificar',
    htmlContent: '<p>¿Cuál de los siguientes es un color primario?</p><ul><li>A) Verde</li><li>B) Naranja</li><li>C) Azul</li><li>D) Morado</li></ul>',
    parsedContent: { studentContent: '¿Cuál de los siguientes es un color primario?\nA) Verde\nB) Naranja\nC) Azul\nD) Morado', answerKey: 'Respuesta: C', skill: 'Habilidad: Clasificar', hasMetadata: true },
    filename: 'art-001.txt', oa: 'OA-01', indicator: 'Distinguir colores primarios y secundarios', tags: ['colores']
  }
];

// ===========================================================================
// ESTRUCTURA DE CARPETAS PREDEFINIDA
// ===========================================================================

export const SUBJECTS = [
  "Matemáticas",
  "Lenguaje",
  "Historia",
  "Ciencias Naturales",
  "Química",
  "Física",
  "Biología",
  "Inglés",
  "Tecnología",
  "Artes"
];

export const GRADES = [
  "1° Básico",
  "2° Básico",
  "3° Básico",
  "4° Básico",
  "5° Básico",
  "6° Básico",
  "7° Básico",
  "8° Básico",
  "I Medio",
  "II Medio",
  "III Medio",
  "IV Medio"
];

export const MOCK_DATABASE = MANUAL_DATABASE;
