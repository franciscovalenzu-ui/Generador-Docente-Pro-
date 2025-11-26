import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { generateAIResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: '¡Hola! Soy tu asistente pedagógico virtual. ¿En qué puedo ayudarte hoy? Puedo sugerir ideas para pruebas, redactar preguntas o explicar indicadores OA.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const aiText = await generateAIResponse(userMsg.content, "El usuario está creando una prueba en Generador Docente Pro.");

    const aiMsg: Message = {
      role: 'ai',
      content: aiText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-full">
           <Sparkles size={20} />
        </div>
        <div>
          <h2 className="font-bold">Asistente IA (Gemini)</h2>
          <p className="text-xs text-indigo-200">Powered by Google GenAI</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 
                ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}
            >
              {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
            </div>
            
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`p-3 rounded-2xl text-sm shadow-sm
                  ${msg.role === 'ai' 
                    ? 'bg-white text-slate-700 border border-slate-100 rounded-tl-none' 
                    : 'bg-indigo-600 text-white rounded-tr-none'}`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
               <Bot size={18} />
             </div>
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
               <div className="flex space-x-2">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu pregunta aquí..."
            className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-sm text-slate-700 placeholder:text-slate-400"
            rows={1}
            style={{ minHeight: '44px', paddingTop: '10px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-0.5"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          La IA puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;