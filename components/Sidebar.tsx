
import React from 'react';
import { LayoutDashboard, Upload, Settings as SettingsIcon, Database, Bot, BarChart3, Gamepad2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Generador', path: '/' },
    { icon: Upload, label: 'Subir / Crear', path: '/upload' },
    { icon: Gamepad2, label: 'Modo Juego', path: '/game' },
    { icon: BarChart3, label: 'Análisis IA', path: '/analysis' },
    { icon: Bot, label: 'Asistente IA', path: '/assistant' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 z-20 shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          Generador Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1">Suite Docente v2.1</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white w-full transition-colors">
          <SettingsIcon size={18} />
          <span className="text-sm">Configuración</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
