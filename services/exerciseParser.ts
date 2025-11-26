export interface ParsedExercise {
  studentContent: string; // The content shown in the test (Questions + Alternatives)
  answerKey: string;      // Extracted answer (e.g., "C")
  skill: string;          // Extracted skill (e.g., "Representar")
  hasMetadata: boolean;   // True if we successfully parsed the metadata
}

export const parseExerciseContent = (rawContent: string): ParsedExercise => {
  // Regex to find "Respuesta: X" and "Habilidad: Y" at the end of the string (case insensitive)
  // Handles variations like "Respuesta:", "Clave:", "Solución:"
  const answerRegex = /(?:Respuesta|Clave|Soluci[óo]n)\s*:\s*([A-Z0-9\s,]+)(?:\n|$)/i;
  const skillRegex = /(?:Habilidad|Destreza)\s*:\s*(.+)(?:\n|$)/i;

  let studentContent = rawContent;
  let answerKey = "No definida";
  let skill = "No definida";
  let hasMetadata = false;

  const answerMatch = rawContent.match(answerRegex);
  const skillMatch = rawContent.match(skillRegex);

  if (answerMatch) {
    answerKey = answerMatch[1].trim();
    hasMetadata = true;
    // Remove the line from student content
    studentContent = studentContent.replace(answerMatch[0], "");
  }

  if (skillMatch) {
    skill = skillMatch[1].trim();
    hasMetadata = true;
    // Remove the line from student content
    studentContent = studentContent.replace(skillMatch[0], "");
  }

  // Clean up trailing newlines
  studentContent = studentContent.trim();

  return {
    studentContent,
    answerKey,
    skill,
    hasMetadata
  };
};