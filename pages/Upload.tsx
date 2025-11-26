
import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, X, Save, Layers } from 'lucide-react';
import { useExercises } from '../context/ExerciseContext';
import { Exercise, ExerciseType, Difficulty } from '../types';
import { parseExerciseContent } from '../services/exerciseParser';
import mammoth from 'mammoth';
import { SUBJECTS as ALL_SUBJECTS, GRADES as ALL_GRADES } from '../constants';

const UploadPage: React.FC = () => {
  const { addExercise } = useExercises();
  
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');
  const [isDragging, setIsDragging] = useState(false);

  // Metadata for the batch
  const [batchData, setBatchData] = useState({
    subject: ALL_SUBJECTS[0],
    grade: ALL_GRADES[0],
    oa: 'OA 01',
    indicator: 'Resolución de Problemas',
    difficulty: Difficulty.MED,
    type: ExerciseType.MULTIPLE_CHOICE
  });

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter((file: File) => 
        file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.pdf')
      );
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      } else {
        alert("Solo se permiten archivos .docx y .pdf");
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  const processBatch = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      for (const file of files) {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        let contentText = "";
        let htmlContent = "";

        if (file.name.endsWith('.docx')) {
            // Extract Raw Text for parsing/searching
            const textResult = await mammoth.extractRawText({ arrayBuffer });
            contentText = textResult.value;

            // Extract HTML for generation (images)
            const options = {
                convertImage: mammoth.images.imgElement(function(image) {
                    return image.read("base64").then(function(imageBuffer) {
                        return {
                            src: "data:" + image.contentType + ";base64," + imageBuffer
                        };
                    });
                })
            };
            const htmlResult = await mammoth.convertToHtml({ arrayBuffer }, options);
            htmlContent = htmlResult.value;
        } else {
            contentText = `Documento PDF: ${file.name}`;
        }

        const parsedData = parseExerciseContent(contentText);

        const newExercise: Exercise = {
          id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          content: contentText,
          htmlContent: htmlContent,
          fileContent: arrayBuffer, // Store raw buffer for docx-preview
          originalFile: file,
          fileType: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
          parsedContent: parsedData,
          subject: batchData.subject,
          grade: batchData.grade,
          oa: batchData.oa,
          indicator: batchData.indicator,
          type: batchData.type,
          difficulty: batchData.difficulty,
          tags: ["lote"],
        };

        addExercise(newExercise);
      }

      setUploadStatus('success');
      setFiles([]);
      setTimeout(() => setUploadStatus('idle'), 3000);

    } catch (error) {
      console.error("Error processing batch:", error);
      alert("Hubo un error al procesar los archivos.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 max-w-6xl mx-auto overflow-hidden">
      <div className="flex-shrink-0 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Layers className="text-indigo-600" />
          Carga Masiva de Ejercicios
        </h1>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Panel: Metadata Configuration */}
        <div className="md:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-y-auto">
           <div className="mb-4 pb-4 border-b border-slate-100 flex-shrink-0">
             <h2 className="font-semibold text-slate-700">1. Configuración del Lote</h2>
             <p className="text-xs text-slate-400 mt-1">Los archivos se guardarán con estos datos.</p>
           </div>

           <div className="space-y-4 flex-1">
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignatura</label>
                  <select 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={batchData.subject}
                      onChange={(e) => setBatchData({...batchData, subject: e.target.value})}
                  >
                      {ALL_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Curso</label>
                  <select 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                      value={batchData.grade}
                      onChange={(e) => setBatchData({...batchData, grade: e.target.value})}
                  >
                      {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OA (Objetivo)</label>
                  <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={batchData.oa}
                      onChange={(e) => setBatchData({...batchData, oa: e.target.value})}
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Indicador / Tema</label>
                  <input 
                      type="text" 
                      className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={batchData.indicator}
                      onChange={(e) => setBatchData({...batchData, indicator: e.target.value})}
                  />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dificultad</label>
                    <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                        value={batchData.difficulty}
                        onChange={(e) => setBatchData({...batchData, difficulty: e.target.value as Difficulty})}
                    >
                        <option value={Difficulty.BAS}>Básica</option>
                        <option value={Difficulty.MED}>Media</option>
                        <option value={Difficulty.AVZ}>Avanzada</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                    <select 
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white text-sm"
                        value={batchData.type}
                        onChange={(e) => setBatchData({...batchData, type: e.target.value as ExerciseType})}
                    >
                        <option value={ExerciseType.MULTIPLE_CHOICE}>Sel. Única</option>
                        <option value={ExerciseType.DEVELOPMENT}>Desarrollo</option>
                    </select>
                </div>
              </div>
           </div>
        </div>

        {/* Right Panel: File Dropzone */}
        <div className="md:col-span-8 flex flex-col gap-4 min-h-0">
            
            {/* Drop Area */}
            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-shrink-0 bg-white p-6 rounded-xl border-2 border-dashed transition-colors text-center
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                `}
            >
                <div className="flex flex-col items-center justify-center pointer-events-none">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${isDragging ? 'bg-indigo-200 text-indigo-700' : 'bg-indigo-50 text-indigo-600'}`}>
                        <UploadIcon size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700">
                        {isDragging ? "Suelta los archivos aquí" : "Arrastra tus ejercicios aquí"}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1 mb-4">Soporta archivos .docx y .pdf</p>
                    
                    <label className="pointer-events-auto px-6 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg cursor-pointer hover:bg-slate-100 transition-colors shadow-sm text-sm">
                        Seleccionar Archivos
                        <input type="file" multiple accept=".docx,.pdf" className="hidden" onChange={handleFilesSelected} />
                    </label>
                </div>
            </div>

            {/* File List - Scrollable area */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center flex-shrink-0">
                    <h3 className="font-semibold text-slate-700 text-sm">Archivos en Cola ({files.length})</h3>
                    {files.length > 0 && (
                        <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700">
                            Limpiar todo
                        </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {files.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
                            No has seleccionado archivos aún.
                        </div>
                    )}
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-1.5 bg-white rounded border border-slate-200 text-indigo-600">
                                    <FileText size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 p-1">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Action - Fixed at bottom */}
                <div className="p-4 border-t border-slate-200 flex-shrink-0">
                    <button 
                        onClick={processBatch}
                        disabled={files.length === 0 || isProcessing}
                        className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg
                            ${uploadStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                            ${(files.length === 0 || isProcessing) ? 'opacity-50 cursor-not-allowed shadow-none' : ''}
                        `}
                    >
                        {isProcessing ? (
                            <>Procesando...</>
                        ) : uploadStatus === 'success' ? (
                            <><CheckCircle size={20} /> ¡Guardados con Éxito!</>
                        ) : (
                            <><Save size={20} /> Guardar {files.length > 0 ? `${files.length} Ejercicios` : ''}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
