import { GoogleGenAI } from "@google/genai";

// Initialize the client
// In a real app, API_KEY should be in process.env.API_KEY
// We assume the environment handles this injection securely
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'DEMO_KEY' });

export const generateAIResponse = async (prompt: string, context: string = ""): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key no configurada. Por favor configura process.env.API_KEY.";
  }

  try {
    const fullPrompt = `
      Actúa como un experto pedagogo y asistente docente.
      Contexto actual de la aplicación: ${context}
      
      Usuario pregunta: ${prompt}
      
      Responde de manera concisa, útil y formativa.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, hubo un error al conectar con el asistente inteligente.";
  }
};

export const suggestExercise = async (topic: string, grade: string): Promise<string> => {
  if (!process.env.API_KEY) return "Simulación: ¿Cuánto es 2 + 2? (Configura tu API Key para IA real)";

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Genera un ejercicio de selección múltiple para la asignatura de ${topic}, nivel ${grade}. Incluye el enunciado y 4 alternativas.`,
    });
    return response.text || "";
  } catch (e) {
    return "Error generando ejercicio.";
  }
}