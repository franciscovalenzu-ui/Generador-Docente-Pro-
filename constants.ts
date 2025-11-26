
import { Exercise } from './types';

// ============================================================================
// BASE DE DATOS MANUAL (INICIALMENTE VACÍA)
// ============================================================================

export const MANUAL_DATABASE: Exercise[] = [];

// ============================================================================
// ESTRUCTURA DE CARPETAS PREDEFINIDA
// ============================================================================
// Estos valores alimentan los filtros del Generador y la Carga,
// permitiendo clasificar archivos incluso si la base de datos está vacía.

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
