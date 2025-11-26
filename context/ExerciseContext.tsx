
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exercise, GlobalSettings } from '../types';
import { loadDemoExercises } from '../services/demoLoader';

// --- INDEXED DB CONFIG (sin cambios) ---
const DB_NAME = 'GeneradorDocenteDB';
const STORE_NAME = 'exercises';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// --- Tipos del Contexto (restoreDemoData ahora es async) ---
interface ExerciseContextType {
  exercises: Exercise[];
  selectedIds: string[];
  settings: GlobalSettings;
  addExercise: (exercise: Exercise) => void;
  deleteExercise: (id: string) => void;
  toggleSelection: (id: string) => void;
  reorderSelection: (newOrder: string[]) => void;
  clearSelection: () => void;
  getSelectedExercises: () => Exercise[];
  updateSettings: (newSettings: Partial<GlobalSettings>) => void;
  deleteAllExercises: () => Promise<void>;
  restoreDemoData: () => Promise<void>; // <-- Modificado
  isLoadingDB: boolean;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export const ExerciseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [settings, setSettings] = useState<GlobalSettings>({
    schoolName: "",
    logoBase64: null,
    includeSpecTable: true
  });

  // --- MODIFICADO: Carga de datos desde IndexedDB o Banco de Demo ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingDB(true);
      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = async () => {
          const savedExercises = request.result as Exercise[];
          
          if (savedExercises && savedExercises.length > 0) {
            // Si el usuario ya tiene datos, los cargamos
            setExercises(savedExercises);
            console.log("Ejercicios cargados desde la base de datos local (IndexedDB).");
          } else {
            // Si no, cargamos el banco de ejercicios de demostración
            console.log("Base de datos local vacía. Cargando banco de ejercicios de demostración...");
            const demoExercises = await loadDemoExercises();
            setExercises(demoExercises);
            // Guardamos los ejercicios de demo en la BD local para uso futuro
            if (demoExercises.length > 0) {
              const dbWrite = await openDB();
              const txWrite = dbWrite.transaction(STORE_NAME, 'readwrite');
              const storeWrite = txWrite.objectStore(STORE_NAME);
              demoExercises.forEach(ex => storeWrite.put(ex));
              console.log("Banco de demostración guardado en IndexedDB para la próxima vez.");
            }
          }
          setIsLoadingDB(false);
        };

        request.onerror = async () => {
            console.error("Error al leer IndexedDB. Cargando banco de demostración como alternativa.");
            const demoExercises = await loadDemoExercises();
            setExercises(demoExercises);
            setIsLoadingDB(false);
        }

      } catch (error) {
        console.error("Error crítico al abrir IndexedDB. Cargando banco de demostración.", error);
        const demoExercises = await loadDemoExercises();
        setExercises(demoExercises);
        setIsLoadingDB(false);
      }
    };
    loadData();
  }, []);

  // --- Helpers de Base de Datos (sin cambios) ---
  const saveToDB = async (exercise: Exercise) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(exercise);
    } catch (e) { console.error("Error al guardar en IndexedDB", e); }
  };

  const deleteFromDB = async (id: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch (e) { console.error("Error al eliminar de IndexedDB", e); }
  };

  const clearDB = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
    } catch (e) { console.error("Error al limpiar IndexedDB", e); }
  };

  // --- Acciones del Contexto ---
  const addExercise = (exercise: Exercise) => {
    setExercises(prev => {
        if (prev.some(ex => ex.id === exercise.id)) return prev; // Evita duplicados
        saveToDB(exercise);
        return [exercise, ...prev];
    });
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
    deleteFromDB(id);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const reorderSelection = (newOrder: string[]) => {
    setSelectedIds(newOrder);
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const getSelectedExercises = () => {
    return selectedIds
      .map(id => exercises.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined);
  };

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const deleteAllExercises = async () => {
    setExercises([]);
    setSelectedIds([]);
    await clearDB();
  };

  // --- MODIFICADO: Restaurar Datos de Demo ---
  const restoreDemoData = async () => {
    console.log("Restaurando banco de ejercicios de demostración...");
    setIsLoadingDB(true);
    await clearDB(); // Limpia la base de datos actual
    const demoExercises = await loadDemoExercises();
    setExercises(demoExercises);
    // Vuelve a guardar los ejercicios de demo en la BD
    demoExercises.forEach(ex => saveToDB(ex));
    setIsLoadingDB(false);
    console.log("Restauración completada.");
  };

  return (
    <ExerciseContext.Provider value={{ 
      exercises, 
      selectedIds,
      settings,
      addExercise, 
      deleteExercise,
      toggleSelection,
      reorderSelection,
      clearSelection,
      getSelectedExercises,
      updateSettings,
      deleteAllExercises,
      restoreDemoData,
      isLoadingDB
    }}>
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExercises = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercises debe ser usado dentro de un ExerciseProvider');
  }
  return context;
};
