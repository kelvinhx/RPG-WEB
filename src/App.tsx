import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: 'Olá! Sou a Nova IA. Como posso te ajudar hoje?'
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: data.text }]);
      } else {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: `**Erro:** ${data.error}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: '**Erro:** Falha na conexão com o servidor.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans sm:pb-0">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-semibold text-lg tracking-tight">Nova IA</h1>
        </div>
        <button className="p-2 text-slate-500 hover:text-slate-800 transition-colors rounded-full hover:bg-slate-100">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[90%] sm:max-w-[80%]">
                {msg.role === 'assistant' && (
                  <div className="flex-none w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mb-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                
                <div 
                  className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-slate max-w-none leading-relaxed prose-p:my-1 prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]"
            >
               <div className="flex-none w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-slate-500 font-medium">Processando...</span>
                </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-slate-200 p-3 sm:p-4 pb-safe">
        <div className="max-w-2xl mx-auto">
          <form 
            onSubmit={handleSend}
            className="flex items-end gap-2 bg-slate-100 p-1.5 sm:p-2 rounded-3xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Pergunte algo à Nova IA..."
              className="flex-1 bg-transparent border-none focus:outline-none resize-none px-3 py-2.5 text-slate-900 placeholder:text-slate-500 min-h-[44px] max-h-32 rounded-xl"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex-none shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-2 pb-1">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Desenvolvido com Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
