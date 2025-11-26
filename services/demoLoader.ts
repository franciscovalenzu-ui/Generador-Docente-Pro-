
import { Exercise, ExerciseType, Difficulty } from '../types';
import { parseExerciseContent } from './exerciseParser';
import mammoth from 'mammoth';

// Define la estructura de cada entrada en nuestro archivo manifest.json
interface ManifestEntry {
  path: string; // Ejemplo: "matematicas/7-basico/ej1.docx"
  subject: string;
  grade: string;
  oa: string;
  indicator: string;
  difficulty: Difficulty;
  type: ExerciseType;
}

// Esta función carga el manifiesto, luego busca y procesa cada .docx
export const loadDemoExercises = async (): Promise<Exercise[]> => {
  try {
    // 1. Cargar el archivo manifest.json desde la carpeta public
    const manifestResponse = await fetch('/banco-de-ejercicios/manifest.json');
    if (!manifestResponse.ok) {
      console.error("No se pudo cargar el manifest.json del banco de ejercicios.");
      return [];
    }
    const manifest: ManifestEntry[] = await manifestResponse.json();

    const exercises: Exercise[] = [];

    // 2. Procesar cada entrada del manifiesto
    for (const entry of manifest) {
      const docxPath = `/banco-de-ejercicios/${entry.path}`;
      
      // Cargar el archivo .docx como un ArrayBuffer
      const docxResponse = await fetch(docxPath);
      if (!docxResponse.ok) {
        console.warn(`Error al cargar el ejercicio: ${docxPath}`);
        continue; // Salta al siguiente si uno falla
      }
      const arrayBuffer = await docxResponse.arrayBuffer();

      // 3. Usar mammoth para extraer el contenido (igual que en Upload.tsx)
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      const contentText = textResult.value;

      const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, {
        convertImage: mammoth.images.imgElement(image => 
          image.read("base64").then(imageBuffer => ({
            src: `data:${image.contentType};base64,${imageBuffer}`
          }))
        )
      });
      const htmlContent = htmlResult.value;

      // 4. Parsear para obtener la respuesta y la habilidad
      const parsedData = parseExerciseContent(contentText);

      // 5. Construir el objeto Exercise final
      const newExercise: Exercise = {
        id: `demo-${entry.path.replace(/[^a-zA-Z0-9]/g, '-')}`,
        filename: entry.path.split('/').pop() || 'demo-file.docx',
        content: contentText,
        htmlContent: htmlContent,
        fileContent: arrayBuffer,
        subject: entry.subject,
        grade: entry.grade,
        oa: entry.oa,
        indicator: entry.indicator,
        type: entry.type,
        difficulty: entry.difficulty,
        tags: [entry.subject.toLowerCase()],
        parsedContent: parsedData,
      };
      exercises.push(newExercise);
    }
    
    console.log(`Se cargaron ${exercises.length} ejercicios del banco de demo.`);
    return exercises;

  } catch (error) {
    console.error("Error al cargar el banco de ejercicios de demo:", error);
    return []; // Devuelve un array vacío en caso de error
  }
};
