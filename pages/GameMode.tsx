
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercises } from '../context/ExerciseContext';
import { ArrowLeft, Clock, Eye, ChevronRight, Trophy, AlertCircle, Play, Settings2 } from 'lucide-react';
import { Exercise } from '../types';

const GameMode: React.FC = () => {
  const navigate = useNavigate();
  const { getSelectedExercises } = useExercises();
  const exercises = getSelectedExercises();
  
  // Game Config State
  const [isSetup, setIsSetup] = useState(true);
  const [configTime, setConfigTime] = useState(30);

  // Game Play State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFinished, setIsFinished] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const currentExercise = exercises[currentIndex];

  // Clean HTML content to hide answers in DOCX view
  const cleanHtml = useMemo(() => {
    if (!currentExercise?.htmlContent) return null;
    // Regex to remove paragraphs containing "Respuesta:" or "Habilidad:"
    let cleaned = currentExercise.htmlContent;
    cleaned = cleaned.replace(/<p[^>]*>.*?(Respuesta|Clave|Soluci[óo]n)\s*:.*?<\/p>/gi, '');
    cleaned = cleaned.replace(/<p[^>]*>.*?(Habilidad|Destreza)\s*:.*?<\/p>/gi, '');
    return cleaned;
  }, [currentExercise]);

  // Handle PDF Blob URL Creation
  useEffect(() => {
    if (currentExercise?.fileType === 'pdf') {
      let blob: Blob | null = null;
      
      if (currentExercise.originalFile) {
        blob = currentExercise.originalFile;
      } else if (currentExercise.fileContent) {
        blob = new Blob([currentExercise.fileContent], { type: 'application/pdf' });
      }

      if (blob) {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
      }
    }
    setPdfUrl(null);
  }, [currentExercise]);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0 && !isAnswerVisible) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswerVisible && isActive) {
      setIsAnswerVisible(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isAnswerVisible]);

  const startGame = () => {
    setTimeLeft(configTime);
    setIsSetup(false);
    setIsActive(true);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerVisible(false);
      setTimeLeft(configTime); // Reset to configured time
    } else {
      setIsFinished(true);
      setIsActive(false);
    }
  };

  const handleReveal = () => {
    setIsAnswerVisible(true);
  };

  // --- RENDER: No Exercises ---
  if (exercises.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-100">
        <AlertCircle size={64} className="text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 mb-2">No hay ejercicios seleccionados</h2>
        <p className="text-slate-500 mb-6">Selecciona ejercicios en el generador para comenzar el juego.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Ir al Generador</button>
      </div>
    );
  }

  // --- RENDER: Setup Screen ---
  if (isSetup) {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            <div className="z-10 bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30">
                        <Settings2 size={32} className="text-white" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Configurar Juego</h1>
                <p className="text-indigo-200 mb-8 text-sm">Estás a punto de jugar con {exercises.length} ejercicios.</p>

                <div className="space-y-6">
                    <div className="text-left">
                        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2">Tiempo por Pregunta (segundos)</label>
                        <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-xl border border-white/10">
                            <button 
                                onClick={() => setConfigTime(Math.max(5, configTime - 5))}
                                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                            >-</button>
                            <div className="flex-1 text-center text-xl font-mono font-bold">{configTime}s</div>
                            <button 
                                onClick={() => setConfigTime(configTime + 5)}
                                className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                            >+</button>
                        </div>
                    </div>

                    <button 
                        onClick={startGame}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        <Play size={24} fill="currentColor" />
                        Comenzar Juego
                    </button>
                    
                    <button onClick={() => navigate('/')} className="text-sm text-slate-400 hover:text-white underline">
                        Cancelar y volver
                    </button>
                </div>
            </div>
        </div>
    )
  }

  // --- RENDER: Finished Screen ---
  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 relative">
        <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce drop-shadow-lg" />
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">¡Juego Terminado!</h1>
        <p className="text-xl text-slate-300 mb-8">Has completado el repaso de {exercises.length} ejercicios.</p>
        <div className="flex gap-4">
            <button 
            onClick={() => { setIsFinished(false); setIsSetup(true); setCurrentIndex(0); setIsActive(false); }}
            className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors"
            >
            Jugar de Nuevo
            </button>
            <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
            >
            Volver al Generador
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: Active Game ---
  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="font-bold text-lg tracking-tight">Ejercicio {currentIndex + 1} <span className="text-slate-500 font-normal">/ {exercises.length}</span></h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`px-2 py-0.5 rounded-full border ${
                currentExercise.difficulty === 'Básica' ? 'border-green-900/50 bg-green-900/20 text-green-400' : 
                currentExercise.difficulty === 'Media' ? 'border-orange-900/50 bg-orange-900/20 text-orange-400' :
                'border-red-900/50 bg-red-900/20 text-red-400'
              }`}>
                {currentExercise.difficulty}
              </span>
              <span className="opacity-70">{currentExercise.oa}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800 py-1.5 px-4 rounded-full border border-slate-700">
          <Clock size={18} className={timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-indigo-400'} />
          <span className={`text-xl font-mono font-bold ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Question Content */}
        <div className="w-full max-w-5xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden h-[65vh] flex flex-col relative border-4 border-slate-800">
          {currentExercise.fileType === 'pdf' && pdfUrl ? (
            <object data={pdfUrl} type="application/pdf" className="w-full h-full">
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Tu navegador no puede mostrar este PDF.</p>
              </div>
            </object>
          ) : currentExercise.fileType === 'docx' && cleanHtml ? (
             <div 
                className="prose prose-lg max-w-none font-serif p-8 overflow-y-auto h-full leading-relaxed"
                dangerouslySetInnerHTML={{ __html: cleanHtml }} 
             />
          ) : (
             <div className="whitespace-pre-wrap font-serif text-xl leading-relaxed p-8 overflow-y-auto h-full">
               {currentExercise.parsedContent?.studentContent || currentExercise.content}
             </div>
          )}
          
          {/* Watermark / Type indicator */}
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-slate-100 text-slate-400 text-xs rounded-full font-bold uppercase tracking-widest opacity-50 pointer-events-none">
            {currentExercise.type}
          </div>
        </div>

        {/* Answer Overlay */}
        {isAnswerVisible && (
          <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-950/60 backdrop-blur-md animate-in fade-in zoom-in duration-300 p-4">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-1 rounded-3xl shadow-2xl max-w-lg w-full">
                <div className="bg-slate-900 rounded-[20px] p-8 text-center border border-white/10">
                    <h3 className="text-indigo-400 uppercase text-xs font-bold mb-4 tracking-[0.2em]">Respuesta Correcta</h3>
                    
                    <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
                        <div className="relative text-7xl font-black text-white tracking-tighter drop-shadow-lg">
                            {currentExercise.parsedContent?.answerKey || "?"}
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 mb-8">
                        <span className="text-slate-400 text-sm font-medium">Habilidad:</span>
                        <span className="text-indigo-300 font-bold">{currentExercise.parsedContent?.skill || "N/A"}</span>
                    </div>
                    
                    <div>
                        <button 
                            onClick={handleNext}
                            className="w-full py-3.5 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-lg"
                        >
                            Siguiente <ChevronRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-slate-800 flex justify-center bg-slate-900 z-20">
        {!isAnswerVisible && (
          <button 
            onClick={handleReveal}
            className="px-10 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-full font-semibold flex items-center gap-2 transition-all hover:scale-105 shadow-lg"
          >
            <Eye size={20} className="text-indigo-400" /> Mostrar Respuesta
          </button>
        )}
      </div>
    </div>
  );
};

export default GameMode;
