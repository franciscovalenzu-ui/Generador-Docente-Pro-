
import React, { useState } from 'react';
import { Save, Check, Upload } from 'lucide-react';
import { useExercises } from '../context/ExerciseContext';

const Settings: React.FC = () => {
  const { settings, updateSettings } = useExercises();
  const [localSchoolName, setLocalSchoolName] = useState(settings.schoolName);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSettings({ schoolName: localSchoolName });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Configuración del Sistema</h1>
      
      <div className="space-y-6">
        {/* General Settings */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Preferencias Institucionales</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Nombre de la Institución</label>
                <p className="text-xs text-slate-500">Aparecerá centrado en el encabezado de los documentos Word.</p>
              </div>
              <input 
                type="text" 
                value={localSchoolName}
                onChange={(e) => setLocalSchoolName(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 w-72 outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Ej: Colegio San Agustín" 
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700">Logo Institucional</label>
                <p className="text-xs text-slate-500">Sube una imagen (PNG/JPG) para el membrete.</p>
              </div>
              <div className="flex items-center gap-4">
                {settings.logoBase64 && (
                  <img src={settings.logoBase64} alt="Logo" className="h-10 object-contain border p-1 rounded bg-slate-50" />
                )}
                <label className="cursor-pointer px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 flex items-center gap-2 transition-colors">
                  <Upload size={16}/>
                  Subir Imagen
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">Integraciones IA</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Google Gemini API Key</label>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value="AIzaSy........................" 
                  readOnly
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-500" 
                />
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50" disabled>Configurado en Env</button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Usada para el Asistente y el Análisis de Pruebas.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium shadow-lg transition-all
              ${showSuccess ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}
            `}
          >
            {showSuccess ? <Check size={18} /> : <Save size={18} />}
            {showSuccess ? '¡Guardado!' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
