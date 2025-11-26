
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exercise, GlobalSettings } from '../types';
import { MANUAL_DATABASE } from '../constants';

// --- INDEXED DB CONFIG ---
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
  deleteAllExercises: () => void;
  restoreDemoData: () => void;
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

  // Load from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const savedExercises = request.result as Exercise[];
          // Merge manual database with saved exercises (prioritizing saved data)
          if (savedExercises.length > 0) {
            setExercises(savedExercises);
          } else {
            setExercises(MANUAL_DATABASE);
          }
          setIsLoadingDB(false);
        };
      } catch (error) {
        console.error("Error loading DB:", error);
        setExercises(MANUAL_DATABASE);
        setIsLoadingDB(false);
      }
    };
    loadData();
  }, []);

  // Helper to save to DB
  const saveToDB = async (exercise: Exercise) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(exercise);
    } catch (e) {
      console.error("Error saving to DB", e);
    }
  };

  // Helper to delete from DB
  const deleteFromDB = async (id: string) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
    } catch (e) {
      console.error("Error deleting from DB", e);
    }
  };

  // Helper to clear DB
  const clearDB = async () => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
    } catch (e) { console.error("Error clearing DB", e); }
  };


  const addExercise = (exercise: Exercise) => {
    setExercises(prev => [exercise, ...prev]);
    saveToDB(exercise);
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
    // Map selectedIds to exercises to PRESERVE ORDER
    return selectedIds
      .map(id => exercises.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => ex !== undefined);
  };

  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const deleteAllExercises = () => {
    setExercises([]);
    setSelectedIds([]);
    clearDB();
  };

  const restoreDemoData = () => {
    setExercises(MANUAL_DATABASE);
    MANUAL_DATABASE.forEach(ex => saveToDB(ex));
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
    throw new Error('useExercises must be used within an ExerciseProvider');
  }
  return context;
};
