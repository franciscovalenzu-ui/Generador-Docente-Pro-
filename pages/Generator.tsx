
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Trash2, FileDown, CheckSquare, 
  CheckCircle2, ArrowUp, ArrowDown, GraduationCap, Eye, EyeOff, BarChart3, X, FileText, Gamepad2
} from 'lucide-react';
import { useExercises } from '../context/ExerciseContext';
import { Exercise, FilterState, Difficulty, ExerciseType } from '../types';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, Header } from 'docx';
import * as docxPreview from 'docx-preview';
import { SUBJECTS as ALL_SUBJECTS, GRADES as ALL_GRADES } from '../constants';

const Generator: React.FC = () => {
  const navigate = useNavigate();
  const { exercises, selectedIds, toggleSelection, reorderSelection, clearSelection, getSelectedExercises, settings } = useExercises();
  
  // Use predefined lists from constants to ensure filters appear even when empty
  const SUBJECTS = ALL_SUBJECTS;
  const GRADES = ALL_GRADES;

  const [filters, setFilters] = useState<FilterState>({
    subject: SUBJECTS[0],
    grade: GRADES[0],
    oa: '',
    indicator: '',
    type: '',
    keyword: ''
  });
  
  // Update filters if initial state is invalid
  useEffect(() => {
    if (!SUBJECTS.includes(filters.subject) && SUBJECTS.length > 0) {
        setFilters(prev => ({ ...prev, subject: SUBJECTS[0] }));
    }
    if (!GRADES.includes(filters.grade) && GRADES.length > 0) {
        setFilters(prev => ({ ...prev, grade: GRADES[0] }));
    }
  }, []);

  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [testTitle, setTestTitle] = useState("Prueba de Matemáticas");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTeacherView, setShowTeacherView] = useState(false); 
  const [showGenModal, setShowGenModal] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const selectedExercises = getSelectedExercises();

  useEffect(() => {
    return () => {
      if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    };
  }, [previewBlobUrl]);

  useEffect(() => {
    if (previewExercise?.fileType === 'docx' && previewExercise.fileContent && docxContainerRef.current) {
      docxContainerRef.current.innerHTML = '';
      docxPreview.renderAsync(previewExercise.fileContent, docxContainerRef.current, undefined, {
        inWrapper: false,
        ignoreWidth: false, 
        ignoreHeight: false,
        className: "docx-viewer"
      }).catch(err => console.error("Error rendering DOCX", err));
    }
  }, [previewExercise]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchSubject = !filters.subject || ex.subject === filters.subject;
      const matchGrade = !filters.grade || ex.grade === filters.grade;
      const matchOA = !filters.oa || ex.oa === filters.oa;
      const matchType = !filters.type || ex.type === filters.type;
      const matchKeyword = !filters.keyword || 
        ex.content.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        ex.filename.toLowerCase().includes(filters.keyword.toLowerCase());
      
      return matchSubject && matchGrade && matchOA && matchType && matchKeyword;
    });
  }, [filters, exercises]);

  const availableOAs = useMemo(() => {
    return [...new Set(exercises
      .filter(e => e.subject === filters.subject && e.grade === filters.grade)
      .map(e => e.oa))].sort();
  }, [filters.subject, filters.grade, exercises]);

  useEffect(() => {
    if (filters.oa && !availableOAs.includes(filters.oa)) {
      setFilters(prev => ({ ...prev, oa: '' }));
    }
  }, [availableOAs, filters.oa]);

  const handleRemoveSelected = (id: string) => {
    toggleSelection(id);
  };

  const moveExercise = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= selectedIds.length) return;
    const newOrder = [...selectedIds];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + direction];
    newOrder[index + direction] = temp;
    reorderSelection(newOrder);
  };

  const handleSelectAll = () => {
    filteredExercises.forEach(ex => {
      if (!selectedIds.includes(ex.id)) {
        toggleSelection(ex.id);
      }
    });
  };

  const handleGenerateClick = () => {
    setShowGenModal(true);
  };

  const handlePreview = (ex: Exercise) => {
    setPreviewExercise(ex);
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    
    if (ex.fileType === 'pdf') {
      let blob: Blob;
      if (ex.originalFile) {
        blob = ex.originalFile;
      } else if (ex.fileContent) {
        blob = new Blob([ex.fileContent], { type: 'application/pdf' });
      } else {
        setPreviewBlobUrl(null);
        return;
      }
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } else {
      setPreviewBlobUrl(null);
    }
  };

  const dataURLToUint8Array = (dataURL: string) => {
    const base64String = dataURL.split(',')[1];
    const binaryString = window.atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Native Download Function (No FileSaver dependency)
  const nativeDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const generateDocx = async (type: 'student' | 'teacher') => {
    setIsGenerating(true);
    
    try {
      const children = [];
      const headers = {};

      if (settings.logoBase64 || settings.schoolName) {
          const headerChildren = [];
          if (settings.logoBase64) {
              try {
                  const imageBuffer = dataURLToUint8Array(settings.logoBase64);
                  headerChildren.push(
                      new Paragraph({
                          children: [new ImageRun({ data: imageBuffer, transformation: { width: 50, height: 50 } })],
                          alignment: AlignmentType.LEFT
                      })
                  );
              } catch (e) { console.error("Error adding logo", e); }
          }

          if (settings.schoolName) {
              headerChildren.push(
                  new Paragraph({
                      text: settings.schoolName.toUpperCase(),
                      bold: true,
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 200 }
                  })
              );
          }
          // @ts-ignore
          if (headerChildren.length > 0) headers.default = new Header({ children: headerChildren });
      }

      children.push(
        new Paragraph({ text: testTitle, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: `Curso: ${filters.grade} | Asignatura: ${filters.subject}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
        new Paragraph({ text: "Nombre: ________________________________________  Fecha: ______________", spacing: { after: 400 } })
      );

      for (let idx = 0; idx < selectedExercises.length; idx++) {
          const ex = selectedExercises[idx];
          
          children.push(
              new Paragraph({
                  children: [new TextRun({ text: `Pregunta ${idx + 1}:`, bold: true, size: 24 })],
                  spacing: { before: 200, after: 100 }
              })
          );

          if (ex.htmlContent) {
              const parser = new DOMParser();
              const doc = parser.parseFromString(ex.htmlContent, 'text/html');
              const nodes = Array.from(doc.body.childNodes);

              for (const node of nodes) {
                  if (node.nodeName === 'P' || node.nodeName === '#text') {
                      const textContent = node.textContent || "";
                      if (type === 'student' && (textContent.includes("Respuesta:") || textContent.includes("Habilidad:") || textContent.includes("Solución:"))) {
                          continue; 
                      }

                      // @ts-ignore
                      const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
                      
                      if (imgs.length > 0) {
                          const runChildren = [];
                          if (textContent.trim()) runChildren.push(new TextRun(textContent));
                          
                          for (const img of Array.from(imgs)) {
                              const src = (img as HTMLImageElement).src;
                              if (src.startsWith('data:image')) {
                                  try {
                                      const imageBuffer = dataURLToUint8Array(src);
                                      runChildren.push(new ImageRun({
                                          data: imageBuffer,
                                          transformation: { width: 400, height: 300 }
                                      }));
                                  } catch (e) { console.error("Error converting image"); }
                              }
                          }
                          children.push(new Paragraph({ children: runChildren }));
                      } else {
                          children.push(new Paragraph({ text: textContent }));
                      }
                  }
              }
          } else {
              let contentText = type === 'student' ? (ex.parsedContent?.studentContent || ex.content) : ex.content;
              const lines = contentText.split('\n');
              lines.forEach(line => {
                  if (line.trim()) children.push(new Paragraph({ text: line, spacing: { after: 50 } }));
              });
          }
          
          children.push(new Paragraph({ text: "", spacing: { after: 200 } }));
      }

      if (type === 'teacher' && settings.includeSpecTable) {
          children.push(new Paragraph({ pageBreakBefore: true }));
          children.push(new Paragraph({ text: "TABLA DE ESPECIFICACIONES", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
          
          const tableRows = [
              new TableRow({
                  children: [
                      new TableCell({ children: [new Paragraph({ text: "N°", bold: true })], width: { size: 10, type: WidthType.PERCENTAGE } }),
                      new TableCell({ children: [new Paragraph({ text: "Habilidad", bold: true })], width: { size: 45, type: WidthType.PERCENTAGE } }),
                      new TableCell({ children: [new Paragraph({ text: "Respuesta", bold: true })], width: { size: 45, type: WidthType.PERCENTAGE } }),
                  ]
              })
          ];

          selectedExercises.forEach((ex, idx) => {
              tableRows.push(
                  new TableRow({
                      children: [
                          new TableCell({ children: [new Paragraph(String(idx + 1))] }),
                          new TableCell({ children: [new Paragraph(ex.parsedContent?.skill || "N/A")] }),
                          new TableCell({ children: [new Paragraph(ex.parsedContent?.answerKey || "N/A")] }),
                      ]
                  })
              );
          });

          const table = new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                  insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                  insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              }
          });
          children.push(table);
      }

      const doc = new Document({
        sections: [{ properties: {}, headers: headers, children: children }],
      });

      const blob = await Packer.toBlob(doc);
      const filename = `${testTitle.replace(/\s+/g, '_')}_${type === 'student' ? 'Estudiante' : 'Pauta'}.docx`;
      
      // Use Native Download instead of file-saver
      nativeDownload(blob, filename);

    } catch (error) {
      console.error("Generation Error:", error);
      alert("Hubo un error generando el documento.");
    } finally {
      setIsGenerating(false);
    }
  };

  const renderExercisePreview = () => {
    if (!previewExercise) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400">
          <Search size={48} className="mb-2 opacity-20" />
          <p>Selecciona un ejercicio para previsualizar</p>
        </div>
      );
    }

    if (previewExercise.fileType === 'pdf' && previewBlobUrl) {
        return (
            <div className="w-full h-full bg-slate-100 relative flex flex-col">
                {showTeacherView && (
                    <div className="bg-yellow-100 p-2 text-xs text-yellow-800 border-b border-yellow-200 flex justify-between px-4 shrink-0">
                        <span><strong>Respuesta:</strong> {previewExercise.parsedContent?.answerKey}</span>
                        <span><strong>Habilidad:</strong> {previewExercise.parsedContent?.skill}</span>
                    </div>
                )}
                <object data={previewBlobUrl} type="application/pdf" className="w-full h-full flex-1">
                    <div className="flex items-center justify-center h-full p-4 text-center">
                        <p className="text-slate-500">Tu navegador no está visualizando el PDF directamente.<br /><a href={previewBlobUrl} target="_blank" className="text-blue-600 underline">Abrir en nueva pestaña</a></p>
                    </div>
                </object>
            </div>
        );
    }

    if (previewExercise.fileType === 'docx' && previewExercise.fileContent) {
        return (
            <div className="w-full h-full overflow-hidden flex flex-col bg-slate-200">
                 {showTeacherView && (
                    <div className="shrink-0 bg-indigo-50 border-b border-indigo-100 p-2 text-xs flex justify-between px-4 text-indigo-900">
                        <span><strong>Respuesta:</strong> {previewExercise.parsedContent?.answerKey}</span>
                        <span><strong>Habilidad:</strong> {previewExercise.parsedContent?.skill}</span>
                    </div>
                 )}
                 <div className="flex-1 overflow-auto p-4 flex justify-center">
                    <div ref={docxContainerRef} className="bg-white shadow-lg min-h-[500px] w-full max-w-[800px]" />
                 </div>
            </div>
        )
    }

    return (
      <div className="p-6 font-serif text-slate-800 space-y-4 overflow-auto h-full bg-white">
         <div className="whitespace-pre-wrap">
            {showTeacherView ? previewExercise.content : (previewExercise.parsedContent?.studentContent || previewExercise.content)}
         </div>
         {showTeacherView && previewExercise.parsedContent?.hasMetadata && (
           <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-indigo-500 font-semibold">Respuesta: </span>{previewExercise.parsedContent.answerKey}</div>
                <div><span className="text-indigo-500 font-semibold">Habilidad: </span>{previewExercise.parsedContent.skill}</div>
              </div>
           </div>
         )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 relative">
      
      {/* Generation Modal */}
      {showGenModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Generar Documentos</h2>
                <p className="text-slate-500 text-sm mt-1">Selecciona el formato para descargar.</p>
              </div>
              <button onClick={() => setShowGenModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            {isGenerating ? (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"/>
                    <h3 className="text-indigo-700 font-semibold">Procesando...</h3>
                    <p className="text-sm text-slate-400 mt-2">Construyendo archivo DOCX...</p>
                </div>
            ) : (
                <div className="space-y-4">
                <button onClick={() => generateDocx('student')} className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group text-left">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-700">Prueba Estudiante</h3>
                    <p className="text-xs text-slate-400">Limpia, con imágenes y texto</p>
                    </div>
                    <FileDown size={18} className="ml-auto text-slate-300 group-hover:text-blue-600" />
                </button>

                <button onClick={() => generateDocx('teacher')} className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group text-left">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FileText size={24} />
                    </div>
                    <div>
                    <h3 className="font-semibold text-slate-700">Pauta Docente</h3>
                    <p className="text-xs text-slate-400">Incluye tabla de especificaciones</p>
                    </div>
                    <FileDown size={18} className="ml-auto text-slate-300 group-hover:text-purple-600" />
                </button>
                </div>
            )}

            {!isGenerating && (
                <button onClick={() => setShowGenModal(false)} className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                Cancelar
                </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Título Prueba/Guía</label>
          <input 
            type="text" 
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
            placeholder="Ej: Prueba Unidad 1..."
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Curso/Nivel</label>
          <select 
            value={filters.grade}
            onChange={(e) => setFilters({...filters, grade: e.target.value})}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
          >
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* Left Column */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={18} className="text-indigo-600" />
              <h3 className="font-semibold text-slate-800">Filtros de Ejercicios</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium">Asignatura</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md bg-slate-50"
                  value={filters.subject}
                  onChange={(e) => setFilters({...filters, subject: e.target.value})}
                >
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium">Objetivo (OA)</label>
                <select 
                  className="w-full mt-1 px-2 py-1.5 text-sm border rounded-md bg-slate-50"
                  value={filters.oa}
                  onChange={(e) => setFilters({...filters, oa: e.target.value})}
                >
                  <option value="">(Todos)</option>
                  {availableOAs.map(oa => <option key={oa} value={oa}>{oa}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-slate-500 font-medium">Tipo Ejercicio</label>
                <div className="flex gap-2 mt-1">
                   {['', ExerciseType.MULTIPLE_CHOICE, ExerciseType.DEVELOPMENT].map((type, idx) => (
                     <button 
                       key={idx}
                       onClick={() => setFilters({...filters, type: type})}
                       className={`px-3 py-1 text-xs rounded-full border ${filters.type === type ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                     >
                       {type === '' ? 'Todos' : type === ExerciseType.MULTIPLE_CHOICE ? 'Sel. Única' : 'Desarrollo'}
                     </button>
                   ))}
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por contenido..." 
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                value={filters.keyword}
                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
              />
            </div>
          </div>

          {/* Results List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Disponibles ({filteredExercises.length})
              </span>
              <button onClick={handleSelectAll} className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
                <CheckSquare size={14} />
                <span>Seleccionar Todos</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredExercises.length === 0 && (
                 <div className="p-4 text-center text-slate-400 text-sm">
                    No hay ejercicios para estos filtros. 
                    <br/>
                    <button onClick={() => navigate('/upload')} className="text-indigo-600 underline mt-1">Sube uno nuevo</button> 
                    {' '}o edita <code>constants.ts</code>.
                 </div>
              )}
              {filteredExercises.map(ex => {
                const isSelected = selectedIds.includes(ex.id);
                return (
                  <div 
                    key={ex.id}
                    onClick={() => handlePreview(ex)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all group flex items-center gap-3 text-sm
                      ${isSelected 
                        ? 'bg-indigo-50 border-indigo-200' 
                        : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50'}
                      ${previewExercise?.id === ex.id ? 'ring-2 ring-indigo-400 ring-offset-1' : ''}
                    `}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSelection(ex.id); }}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-transparent hover:border-indigo-400'}
                      `}
                    >
                      <CheckCircle2 size={14} />
                    </button>
                    
                    <div className="flex-1 truncate">
                      <div className="font-medium text-slate-700 truncate">{ex.filename}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className={`px-1.5 rounded-sm text-[10px] ${ex.difficulty === Difficulty.BAS ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {ex.difficulty}
                        </span>
                        <span className="truncate">{ex.oa} • {ex.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          
          {/* Preview Box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-2/5 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <div className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                 <GraduationCap size={16} className="text-slate-400"/>
                 Visor de Ejercicio
               </div>
               {previewExercise && (
                 <button 
                   onClick={() => setShowTeacherView(!showTeacherView)}
                   className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors
                     ${showTeacherView ? 'bg-purple-100 border-purple-200 text-purple-700' : 'bg-white border-slate-200 text-slate-600'}
                   `}
                 >
                   {showTeacherView ? <Eye size={12}/> : <EyeOff size={12}/>}
                   {showTeacherView ? 'Vista Docente' : 'Vista Estudiante'}
                 </button>
               )}
            </div>
            <div className="flex-1 relative bg-slate-200 overflow-hidden">
               {renderExercisePreview()}
            </div>
          </div>

          {/* Selected List (Cart) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
            <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Seleccionados ({selectedExercises.length})
                </span>
                {selectedExercises.length > 0 && (
                   <button onClick={() => navigate('/analysis')} className="flex items-center gap-1 text-[10px] px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors font-medium">
                     <BarChart3 size={12}/> Análisis IA
                   </button>
                )}
              </div>
              <button 
                onClick={() => clearSelection()} 
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={12} /> Limpiar
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
              {selectedExercises.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
                  No hay ejercicios seleccionados.
                </div>
              )}
              {selectedExercises.map((ex, index) => (
                <div key={ex.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 group hover:border-indigo-300 transition-colors">
                  
                  {/* Reordering Controls */}
                  <div className="flex flex-col gap-0.5">
                    <button 
                        onClick={() => moveExercise(index, -1)}
                        disabled={index === 0}
                        className="text-slate-300 hover:text-indigo-600 disabled:opacity-20"
                    >
                        <ArrowUp size={12} />
                    </button>
                    <button 
                        onClick={() => moveExercise(index, 1)}
                        disabled={index === selectedExercises.length - 1}
                        className="text-slate-300 hover:text-indigo-600 disabled:opacity-20"
                    >
                        <ArrowDown size={12} />
                    </button>
                  </div>

                  <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 truncate">{ex.filename}</div>
                    <div className="text-[10px] text-slate-400">{ex.oa} • {ex.type}</div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSelected(ex.id)}
                    className="text-slate-300 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex justify-between items-center">
               <div className="flex items-center gap-2">
                   {selectedExercises.length > 0 && (
                       <button 
                        onClick={() => navigate('/game')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                       >
                           <Gamepad2 size={18}/> Jugar
                       </button>
                   )}
               </div>
               <button 
                 onClick={handleGenerateClick}
                 disabled={selectedExercises.length === 0 || isGenerating}
                 className={`
                   flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-indigo-200
                   transition-all duration-200
                   ${selectedExercises.length === 0 
                     ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                     : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-0.5'}
                 `}
               >
                 <FileDown size={18} />
                 Generar Prueba(s)
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
