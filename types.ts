
export enum ExerciseType {
  MULTIPLE_CHOICE = "Selección Única",
  DEVELOPMENT = "Desarrollo",
  TRUE_FALSE = "Verdadero o Falso"
}

export enum Difficulty {
  BAS = "Básica",
  MED = "Media",
  AVZ = "Avanzada"
}

export interface ParsedExercise {
  studentContent: string;
  answerKey: string;
  skill: string;
  hasMetadata: boolean;
}

export interface Exercise {
  id: string;
  filename: string;
  content: string; // Plain text content for searching/parsing
  htmlContent?: string; // HTML content with Base64 images for generation/Game Mode
  fileContent?: ArrayBuffer; // Raw binary content for docx-preview
  originalFile?: File; 
  fileType?: 'pdf' | 'docx';
  parsedContent?: ParsedExercise; 
  subject: string; 
  grade: string; 
  oa: string; 
  indicator: string; 
  type: ExerciseType;
  difficulty: Difficulty;
  tags: string[];
}

export interface GlobalSettings {
  schoolName: string;
  logoBase64: string | null;
  includeSpecTable: boolean;
}

export interface FilterState {
  subject: string;
  grade: string;
  oa: string;
  indicator: string;
  type: string;
  keyword: string;
}
