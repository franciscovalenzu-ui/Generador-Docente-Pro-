
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exercise, Difficulty } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BrainCircuit, ArrowLeft, Sparkles, AlertCircle, PlayCircle } from 'lucide-react';
import { generateAIResponse } from '../services/geminiService';
import { useExercises } from '../context/ExerciseContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AIAnalysis: React.FC = () => {
  const navigate = useNavigate();
  // MODIFICADO: Se obtiene la lista completa de ejercicios (`allExercises`) del contexto y se quita `addExercise` que no se usaba.
  const { getSelectedExercises, toggleSelection, exercises: allExercises } = useExercises();
  const selectedExercises = getSelectedExercises();
  
  const [exercises, setExercises] = useState<Exercise[]>(selectedExercises);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    setExercises(selectedExercises);
  }, [selectedExercises.length]);

  // --- Stats Calculation (sin cambios) ---
  const difficultyData = [
    { name: 'Básica', value: exercises.filter(e => e.difficulty === Difficulty.BAS).length },
    { name: 'Media', value: exercises.filter(e => e.difficulty === Difficulty.MED).length },
    { name: 'Avanzada', value: exercises.filter(e => e.difficulty === Difficulty.AVZ).length },
  ].filter(d => d.value > 0);

  const skillCounts = exercises.reduce((acc, curr) => {
    const skill = curr.parsedContent?.skill || "No definida";
    acc[skill] = (acc[skill] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const skillData = Object.entries(skillCounts).map(([name, value]) => ({ name, value }));

  // --- AI Analysis (sin cambios) ---
  useEffect(() => {
    if (exercises.length > 0 && !aiFeedback) {
      setAnalyzing(true);
      const prompt = `
        Analiza la siguiente estructura de una prueba docente:
        Cantidad de preguntas: ${exercises.length}
        Distribución Dificultad: ${JSON.stringify(difficultyData)}
        Habilidades cubiertas: ${JSON.stringify(skillData)}
        
        Dame un feedback breve (max 3 parrafos) sobre el equilibrio de la prueba. 
        ¿Está bien balanceada? ¿Falta alguna habilidad cognitiva importante (Bloom)?
        ¿Es muy difícil o muy fácil?
      `;
      
      generateAIResponse(prompt, "Análisis de Instrumento de Evaluación")
        .then(res => {
          setAiFeedback(res);
          setAnalyzing(false);
        });
    }
  }, [exercises.length]);

  // --- MODIFICADO: `loadDemoData` ahora usa los ejercicios del contexto ---
  const loadDemoData = () => {
    // Se usan los ejercicios cargados en el contexto (que son los de demo en el primer arranque).
    // Se seleccionan hasta 8 ejercicios que no estén ya seleccionados.
    const currentSelectionIds = selectedExercises.map(ex => ex.id);
    const demoExercisesToSelect = allExercises.slice(0, 8);

    demoExercisesToSelect.forEach(ex => {
      if (!currentSelectionIds.includes(ex.id)) {
        toggleSelection(ex.id);
      }
    });
  };

  if (exercises.length === 0) {
    return (
      <div className="p-8 text-center h-full flex flex-col items-center justify-center">
        <AlertCircle className="text-slate-300 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-slate-700">Modo Análisis IA</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Para usar esta función, selecciona ejercicios en el Generador y presiona "Análisis IA", o carga una demostración.
        </p>
        <div className="flex gap-4">
           <button onClick={() => navigate('/')} className="px-6 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 font-medium">
             Ir al Generador
           </button>
           <button onClick={loadDemoData} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2">
             <PlayCircle size={18} />
             Cargar Datos Demo
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-y-auto">
      {/* Header (sin cambios) */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" />
            Análisis de Instrumento
          </h1>
          <p className="text-xs text-slate-500">Evaluación de {exercises.length} ejercicios seleccionados</p>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Charts Row (sin cambios) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Difficulty Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-4 text-center">Distribución de Dificultad</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-700 mb-4 text-center">Habilidades Cognitivas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Preguntas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights (sin cambios) */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
             <Sparkles className="text-indigo-600" size={20} />
             <h3 className="font-bold text-indigo-900">Evaluación Pedagógica (IA)</h3>
          </div>
          
          {analyzing ? (
            <div className="flex items-center gap-3 text-indigo-600 animate-pulse">
              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              <span className="text-sm font-medium">Analizando taxonomía y balance...</span>
            </div>
          ) : (
            <div className="prose prose-sm text-indigo-800 max-w-none leading-relaxed whitespace-pre-line">
              {aiFeedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
