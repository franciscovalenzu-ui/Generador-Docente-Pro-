
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Generator from './pages/Generator';
import UploadPage from './pages/Upload';
import AIAssistant from './pages/AIAssistant';
import AIAnalysis from './pages/AIAnalysis';
import Settings from './pages/Settings';
import GameMode from './pages/GameMode';
import { ExerciseProvider } from './context/ExerciseContext';

const App: React.FC = () => {
  return (
    <ExerciseProvider>
      <HashRouter>
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
          <Sidebar />
          <main className="flex-1 ml-64 p-0 h-full overflow-hidden flex flex-col">
            <Routes>
              <Route path="/" element={<div className="h-full p-6"><Generator /></div>} />
              <Route path="/upload" element={<div className="h-full p-6"><UploadPage /></div>} />
              <Route path="/assistant" element={<div className="h-full p-6"><AIAssistant /></div>} />
              <Route path="/analysis" element={<div className="h-full p-6"><AIAnalysis /></div>} />
              <Route path="/settings" element={<div className="h-full p-6"><Settings /></div>} />
              <Route path="/game" element={<GameMode />} /> {/* Fullscreen style for game */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </ExerciseProvider>
  );
};

export default App;
