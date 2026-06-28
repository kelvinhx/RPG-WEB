import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  User, 
  Compass, 
  Clock, 
  Skull, 
  RefreshCw, 
  Coins, 
  Activity, 
  Shield, 
  Flame, 
  Sword, 
  BookOpen, 
  Heart, 
  MapPin, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Feather, 
  Layers 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, Message, Skill, Item, Quest } from './types';

// Initial default state
const initialGameState: GameState = {
  phase: 'pre_creation',
  character: null,
  inventory: [],
  grimoire: [],
  quests: [],
  combat: null,
  location: "Plano do Caos",
  factionAffinities: { "Império Solar": 0, "Guarda da Lua": 0, "Seita da Podridão": -15 },
  butterflyEffects: [],
  rotLevel: 5,
  timeOfDay: 'Manhã',
};

// Initial welcome message
const welcomeMessage: Message = {
  id: 'welcome-message',
  role: 'assistant',
  content: `*Saudações, Viajante da Realidade.* 🌕\n\nVocê acaba de entrar no universo de **WhatIsRPG?** (Nova RPG). Este é um simulador de realidade contínuo e persistente, onde suas palavras em linguagem natural moldam o destino do mundo.\n\nCada escolha sua alimenta o **Efeito Borboleta** e altera suas relações e o destino do continente.\n\nPara iniciar sua criação oficial de personagem (Módulo 5), clique no botão dourado abaixo ou digite:\n\n*"Vamos começar a jornada"*`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  status: 'read'
};

export default function App() {
  // Load state from local storage or fallback to default
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('whatisrpg_gamestate');
    return saved ? JSON.parse(saved) : initialGameState;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('whatisrpg_messages');
    return saved ? JSON.parse(saved) : [welcomeMessage];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'ficha' | 'bag' | 'butterfly'>('chat');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-save to LocalStorage whenever state or messages change
  useEffect(() => {
    localStorage.setItem('whatisrpg_gamestate', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('whatisrpg_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset helper
  const handleResetGame = () => {
    setGameState(initialGameState);
    setMessages([welcomeMessage]);
    setActiveMobileTab('chat');
    setShowResetConfirm(false);
  };

  // Fast trigger helper for character creation choices or tactical quick actions
  const handleQuickAction = (text: string) => {
    setInput(text);
    // Send automatically
    setTimeout(() => {
      handleSend(text);
    }, 50);
  };

  // Main sending handler
  const handleSend = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : input.trim();
    if (!textToSend || isLoading) return;

    if (customText === undefined) {
      setInput('');
    }

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: timeString,
      status: 'read'
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          gameState: gameState
        })
      });

      const data = await response.json();

      if (response.ok && data.gameState) {
        setGameState(data.gameState);
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.narrative,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }]);

        // If the state transition to 'playing' happened, log a dynamic inline message
        if (data.gameState.phase === 'playing' && gameState.phase !== 'playing') {
          setMessages(prev => [...prev, {
            id: `system-${Date.now()}`,
            role: 'assistant',
            content: `✨ _Ficha técnica atualizada! O Grimório e Inventário foram destravados nos painéis de status._`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read'
          }]);
        }
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ *Mestre da Realidade:* Houve um erro ao canalizar o destino. Tente novamente.\n\n_Detalhe: ${data.error || 'Resposta inválida do Mestre'}_`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ *Mestre da Realidade:* Falha ao conectar-se à mente do Mestre. Certifique-se de que sua conexão está estável.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to choose quick action suggestions depending on phase
  const renderActionSuggestions = () => {
    const { phase, character, grimoire, inventory } = gameState;

    if (phase === 'pre_creation') {
      return (
        <button
          id="btn-start-journey"
          onClick={() => handleQuickAction("Vamos começar a jornada")}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-display font-semibold py-3 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer text-sm tracking-wide active:scale-95"
        >
          <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
          COMEÇAR JORNADA (MÓDULO 5)
        </button>
      );
    }

    if (phase === 'creation_name') {
      return (
        <div className="flex flex-wrap gap-2 justify-center">
          <button id="suggest-name-1" onClick={() => handleQuickAction("Aethelgard")} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-medium border border-slate-700">Aethelgard</button>
          <button id="suggest-name-2" onClick={() => handleQuickAction("Lyra")} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-medium border border-slate-700">Lyra</button>
          <button id="suggest-name-3" onClick={() => handleQuickAction("Zaelith")} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-medium border border-slate-700">Zaelith</button>
          <button id="suggest-name-4" onClick={() => handleQuickAction("Kaelen")} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-medium border border-slate-700">Kaelen</button>
        </div>
      );
    }

    if (phase === 'creation_appearance') {
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <button id="suggest-app-1" onClick={() => handleQuickAction("Olhos cinzas profundos, vestes escuras de linho, cicatriz no queixo, cabelos brancos curtos.")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs text-left leading-snug border border-slate-700">
            🎭 Enigmático: Vestes escuras, cabelos brancos e cicatriz.
          </button>
          <button id="suggest-app-2" onClick={() => handleQuickAction("Forte, armadura de placas prateadas com runas lunares, olhos âmbar e cabelo longo preto amarrado.")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs text-left leading-snug border border-slate-700">
            🛡️ Imponente: Armadura de placas, olhos âmbar.
          </button>
        </div>
      );
    }

    if (phase === 'creation_gender') {
      return (
        <div className="flex gap-2 justify-center w-full">
          <button id="gender-male" onClick={() => handleQuickAction("Masculino")} className="flex-1 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-xl text-xs font-semibold border border-indigo-500/30">♂️ Masculino</button>
          <button id="gender-female" onClick={() => handleQuickAction("Feminino")} className="flex-1 py-2.5 bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 rounded-xl text-xs font-semibold border border-pink-500/30">♀️ Feminino</button>
          <button id="gender-nonbinary" onClick={() => handleQuickAction("Não-Binário")} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700">👤 Não-Binário</button>
        </div>
      );
    }

    if (phase === 'creation_sexuality') {
      return (
        <div className="flex gap-2 justify-center w-full">
          <button id="sex-pan" onClick={() => handleQuickAction("Pansexual")} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700">🌈 Pansexual</button>
          <button id="sex-bi" onClick={() => handleQuickAction("Bissexual")} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700">✨ Bissexual</button>
          <button id="sex-hetero" onClick={() => handleQuickAction("Heterossexual")} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700">Heterossexual</button>
          <button id="sex-homo" onClick={() => handleQuickAction("Homossexual")} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700">Homossexual</button>
        </div>
      );
    }

    if (phase === 'creation_race') {
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <button id="race-darkelf" onClick={() => handleQuickAction("Elfo Negro")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-indigo-500/20">
            <span className="block text-xs font-bold text-indigo-300">🧝 Elfo Negro</span>
            <span className="block text-[10px] text-slate-400">Afinidade com magia lunar, sombra e percepção (+INT / +PER)</span>
          </button>
          <button id="race-human" onClick={() => handleQuickAction("Humano")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700">
            <span className="block text-xs font-bold text-amber-300">🧔 Humano</span>
            <span className="block text-[10px] text-slate-400">Excelente adaptabilidade e equilíbrio geral de atributos</span>
          </button>
          <button id="race-dwarf" onClick={() => handleQuickAction("Anão")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700">
            <span className="block text-xs font-bold text-emerald-300">🧔 Anão</span>
            <span className="block text-[10px] text-slate-400">Força bruta e altíssima constituição (+FOR / +VIT)</span>
          </button>
          <button id="race-custom" onClick={() => handleQuickAction("Quero inventar minha própria raça híbrida ancestral")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700 flex items-center justify-center">
            <span className="text-xs font-medium text-indigo-400">🔮 Customizar raça livremente...</span>
          </button>
        </div>
      );
    }

    if (phase === 'creation_class') {
      return (
        <div className="flex gap-2 w-full justify-center">
          <button id="class-warrior" onClick={() => handleQuickAction("Guerreiro")} className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-rose-500/20 text-center">
            <span className="block text-lg">⚔️</span>
            <span className="block text-xs font-bold text-rose-300">Guerreiro</span>
          </button>
          <button id="class-mage" onClick={() => handleQuickAction("Mago")} className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-indigo-500/20 text-center">
            <span className="block text-lg">🔮</span>
            <span className="block text-xs font-bold text-indigo-300">Mago</span>
          </button>
          <button id="class-hybrid" onClick={() => handleQuickAction("Híbrido")} className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-amber-500/20 text-center">
            <span className="block text-lg">✨</span>
            <span className="block text-xs font-bold text-amber-300">Híbrido</span>
          </button>
        </div>
      );
    }

    if (phase === 'creation_subclass') {
      const isMage = character?.className?.toLowerCase().includes('mago');
      const isWarrior = character?.className?.toLowerCase().includes('guerreiro');

      if (isMage) {
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <button id="sub-magolua" onClick={() => handleQuickAction("Mago da Lua")} className="p-2.5 bg-slate-800 hover:bg-indigo-950/40 text-left rounded-xl border border-indigo-500/30">
              <span className="block text-xs font-bold text-indigo-300">🌙 Mago da Lua</span>
              <span className="block text-[10px] text-slate-400 leading-tight">Gravidade, marés, luz prateada e ilusões noturnas</span>
            </button>
            <button id="sub-sombras" onClick={() => handleQuickAction("Feiticeiro Sombrio")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700">
              <span className="block text-xs font-bold text-purple-300">🌑 Feiticeiro Sombrio</span>
              <span className="block text-[10px] text-slate-400 leading-tight">Magia oculta, furtividade e debuffs</span>
            </button>
          </div>
        );
      }

      if (isWarrior) {
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <button id="sub-cavprata" onClick={() => handleQuickAction("Cavaleiro de Prata")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700">
              <span className="block text-xs font-bold text-slate-300">🛡️ Cavaleiro de Prata</span>
              <span className="block text-[10px] text-slate-400 leading-tight">Defesa inquebrável com runas protetoras</span>
            </button>
            <button id="sub-gladiator" onClick={() => handleQuickAction("Gladiador Gravitacional")} className="p-2.5 bg-slate-800 hover:bg-indigo-950/40 text-left rounded-xl border border-indigo-500/30">
              <span className="block text-xs font-bold text-indigo-300">🌀 Gladiador Gravitacional</span>
              <span className="block text-[10px] text-slate-400 leading-tight">Ataques pesados manipulando a gravidade</span>
            </button>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <button id="sub-algoz" onClick={() => handleQuickAction("Algoz Astral")} className="p-2.5 bg-slate-800 hover:bg-indigo-950/40 text-left rounded-xl border border-indigo-500/30">
            <span className="block text-xs font-bold text-indigo-300">✨ Algoz Astral</span>
            <span className="block text-[10px] text-slate-400 leading-tight">Equilíbrio perfeito de cortes rápidos e disparos lunares</span>
          </button>
          <button id="sub-inquisi" onClick={() => handleQuickAction("Inquisidor da Podridão")} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-left rounded-xl border border-slate-700">
            <span className="block text-xs font-bold text-emerald-300">☣️ Inquisidor</span>
            <span className="block text-[10px] text-slate-400 leading-tight">Estuda a corrupção para usá-la contra ela mesma</span>
          </button>
        </div>
      );
    }

    // Normal game: phase === 'playing' (Módulo 2: Curadoria de Opções, max de 5 opções inteligentes)
    return (
      <div className="flex flex-col gap-2 w-full">
        {/* Grimoire casting panel directly integrated */}
        {grimoire && grimoire.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center justify-start bg-indigo-950/35 p-1.5 rounded-xl border border-indigo-500/10">
            <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold mr-1 shrink-0">✨ Conjurar:</span>
            {grimoire.map((skill: Skill) => (
              <button
                id={`cast-${skill.name}`}
                key={skill.name}
                onClick={() => handleQuickAction(`Conjurar habilidade: ${skill.name}`)}
                className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 text-xs rounded-lg font-medium transition-all"
              >
                {skill.name} <span className="text-[9px] opacity-60">({skill.cost})</span>
              </button>
            ))}
          </div>
        )}

        {/* Consumables quickuse directly integrated */}
        {inventory && inventory.some(i => i.type === 'consumable') && (
          <div className="flex flex-wrap gap-1.5 items-center justify-start bg-emerald-950/20 p-1.5 rounded-xl border border-emerald-500/10">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold mr-1 shrink-0">🧪 Usar:</span>
            {inventory.filter(i => i.type === 'consumable' && i.quantity > 0).map((item: Item) => (
              <button
                id={`use-${item.name}`}
                key={item.name}
                onClick={() => handleQuickAction(`Usar item: ${item.name}`)}
                className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-200 text-xs rounded-lg font-medium transition-all"
              >
                {item.name} <span className="text-[9px] opacity-60">({item.quantity}x)</span>
              </button>
            ))}
          </div>
        )}

        {/* Universal RPG action choices */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="action-explore"
            onClick={() => handleQuickAction("Explorar arredores meticulosamente")}
            className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex flex-col items-center gap-1 shadow-sm"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Explorar</span>
          </button>
          <button
            id="action-search"
            onClick={() => handleQuickAction("Olhar ao redor em busca de pistas ou segredos")}
            className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex flex-col items-center gap-1 shadow-sm"
          >
            <User className="w-4 h-4 text-sky-400" />
            <span>Vasculhar</span>
          </button>
          <button
            id="action-status"
            onClick={() => handleQuickAction("Verificar estado físico e examinar cicatrizes")}
            className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex flex-col items-center gap-1 shadow-sm"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Checar Status</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c1317] text-slate-100 font-sans">
      {/* 
        RESET GAME MODAL DIALOG
      */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#1f2c34] border border-red-500/30 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-red-600/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Reiniciar Simulação?</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Isso apagará sua ficha de personagem, progresso no grimório, inventário atual e histórico de mensagens. Esta ação é irreversível.
              </p>
              <div className="flex gap-2">
                <button
                  id="btn-confirm-reset"
                  onClick={handleResetGame}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Sim, Reiniciar
                </button>
                <button
                  id="btn-cancel-reset"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        DESKTOP LAYOUT LEFT SIDEBAR: "WhatsApp Contacts & General Systems"
      */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 border-r border-[#222e35] bg-[#111b21] h-full">
        {/* User profile details header */}
        <div className="p-4 bg-[#202c33] flex items-center justify-between border-b border-[#222e35]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400 ring-2 ring-indigo-500/20">
              <User className="w-5 h-5" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white truncate max-w-[140px]">
                {gameState.character?.name || "Novo Viajante"}
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-semibold uppercase">
                {gameState.phase === 'playing' ? `Lvl ${gameState.character?.level} ${gameState.character?.subclass || gameState.character?.className}` : "CRIANDO HEROI"}
              </span>
            </div>
          </div>
          <button 
            id="btn-trigger-reset-desktop"
            title="Reiniciar jogo"
            onClick={() => setShowResetConfirm(true)}
            className="p-2 hover:bg-slate-700/50 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Global info cards (Quick Stats overview mimicking Whatsapp Contacts list) */}
        <div className="flex-1 overflow-y-auto space-y-0.5 p-2">
          <div className="p-1 px-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase font-semibold">Canais de Sintonia</div>
          
          {/* Active Chat card */}
          <div className="flex items-center gap-3 p-3 bg-[#2a3942]/65 border-l-4 border-emerald-500 rounded-xl cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center relative shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
              {isLoading && (
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white">Mestre da Realidade</span>
                <span className="text-[9px] text-emerald-400 font-mono font-medium">ONLINE</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate mt-0.5">
                {messages[messages.length - 1]?.content.replace(/\*|_|#/g, '') || "Aguardando ação..."}
              </p>
            </div>
          </div>

          {/* Quick World Stats Cards */}
          <div className="p-3 bg-[#111b21] hover:bg-[#1f2c34]/50 rounded-xl mt-3 border border-[#222e35] space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
              <span>🌎 Coordenadas do Mundo</span>
            </div>
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="font-medium font-display text-white truncate">{gameState.location}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Ciclo:</span>
                </div>
                <span className="font-bold text-sky-300">{gameState.timeOfDay}</span>
              </div>
              
              {/* Rot (Podridão) level */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Nível de Podridão:</span>
                  </div>
                  <span className="font-bold text-purple-400">{gameState.rotLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-600 transition-all duration-500" 
                    style={{ width: `${gameState.rotLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Active Factions Panel */}
          {gameState.phase === 'playing' && (
            <div className="p-3 bg-[#111b21] hover:bg-[#1f2c34]/50 rounded-xl mt-2 border border-[#222e35] space-y-2">
              <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">🤝 Influência de Facção</div>
              <div className="space-y-1.5 pt-1 text-[11px]">
                {Object.entries(gameState.factionAffinities || {}).map(([faction, value]) => {
                  const percent = Math.min(Math.max((value + 100) / 2, 0), 100);
                  return (
                    <div key={faction} className="space-y-0.5">
                      <div className="flex justify-between font-mono text-slate-300">
                        <span className="truncate max-w-[120px]">{faction}</span>
                        <span className={`font-bold ${value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {value > 0 ? `+${value}` : value}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${value >= 0 ? 'bg-emerald-500' : 'bg-rose-500'} transition-all`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* 
        CENTER PANEL: WhatsApp main Chat Viewport
      */}
      <section className="flex-1 flex flex-col bg-[#0b141a] h-full relative">
        
        {/* Chat top header bar */}
        <header className="p-3 bg-[#202c33] flex items-center justify-between border-b border-[#222e35] shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mysterious Nebula active avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#059669] to-[#4f46e5] flex items-center justify-center text-white shrink-0 relative">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#202c33] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-sm text-white font-display leading-tight">Mestre da Realidade</h1>
                <span className="text-[9px] bg-indigo-600/35 border border-indigo-500/20 text-indigo-300 px-1 rounded-md font-mono tracking-wider">DM</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate max-w-[140px] sm:max-w-[240px] font-mono text-[10px] font-semibold text-white/90">
                  {gameState.location} • {gameState.timeOfDay}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick indicators in header */}
            <div className="lg:hidden flex items-center gap-2 pr-2 mr-2 border-r border-[#222e35]">
              <div className="flex items-center gap-1 text-xs">
                <Skull className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-mono font-bold text-purple-400">{gameState.rotLevel}%</span>
              </div>
            </div>
            {/* Reset helper */}
            <button
              id="btn-trigger-reset-header"
              title="Reiniciar Simulação"
              onClick={() => setShowResetConfirm(true)}
              className="p-2 hover:bg-[#2c3d47] text-slate-400 hover:text-red-400 rounded-full transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Combat Alert Banner */}
        {gameState.combat?.active && (
          <div className="bg-gradient-to-r from-red-950/80 to-indigo-950/80 border-b border-red-500/20 p-2 text-center text-xs text-white font-mono flex items-center justify-center gap-3 animate-pulse">
            <Sword className="w-4 h-4 text-red-500 animate-bounce" />
            <span>
              EM COMBATE CONTRA: <strong className="text-red-400 uppercase">{gameState.combat.enemyName}</strong> 
              (HP: <span className="font-bold text-red-400">{gameState.combat.enemyHp} / {gameState.combat.enemyMaxHp}</span>)
            </span>
            <div className="w-16 bg-red-900/30 h-1.5 rounded-full overflow-hidden shrink-0 border border-red-500/10">
              <div 
                className="h-full bg-red-500 transition-all duration-300" 
                style={{ width: `${Math.max(0, Math.min(100, (gameState.combat.enemyHp / gameState.combat.enemyMaxHp) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat Messages scroll area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 whatsapp-grid scroll-smooth"
        >
          <div className="max-w-xl mx-auto space-y-4">
            
            {/* System Encryption warning mock mimicking WhatsApp */}
            <div className="bg-[#182229] border border-[#222e35] rounded-xl p-2 px-3 mx-auto max-w-sm text-center shadow-sm">
              <p className="text-[11px] text-amber-500/90 leading-normal flex items-center justify-center gap-2">
                🔒 As decisões desta simulação estão sendo escritas no fluxo temporal da realidade. O Efeito Borboleta é contínuo e irreversível.
              </p>
            </div>

            {/* Render historic messages */}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              
              return (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-[92%] sm:max-w-[85%]`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mb-1 text-xs shadow">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      </div>
                    )}
                    
                    <div 
                      className={`p-3 px-4 rounded-2xl relative shadow ${
                        isUser 
                          ? 'bg-[#005c4b] text-white rounded-tr-none' 
                          : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-[#26353d]'
                      }`}
                    >
                      {/* Message Content */}
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">{msg.content}</p>
                      ) : (
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-strong:text-amber-300 prose-pre:bg-[#111b21] prose-pre:border prose-pre:border-[#222e35] prose-pre:rounded-xl leading-relaxed text-slate-100 font-sans">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      )}

                      {/* Message Meta Info (WhatsApp timestamp & read status) */}
                      <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-slate-400 font-mono text-right select-none">
                        <span>{msg.timestamp || '18:57'}</span>
                        {isUser && (
                          <span className="text-sky-400 font-bold ml-1">✓✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Active AI typing loader */}
            {isLoading && (
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-[#202c33] text-white flex items-center justify-center shrink-0 mb-1 shadow">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                </div>
                <div className="bg-[#202c33] border border-[#26353d] p-3 px-4 rounded-2xl rounded-tl-none shadow flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="text-xs text-slate-300 font-mono font-medium tracking-wide">Causalidade processando...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-6" />
          </div>
        </div>

        {/* 
          BOTTOM CHAT PANEL: Message Input area & Suggested Action Cards
        */}
        <footer className="bg-[#1f2c34] border-t border-[#222e35] p-3 shrink-0 z-10">
          <div className="max-w-xl mx-auto space-y-3">
            
            {/* Quick Action Suggestions area (Curadoria de Opções) */}
            <div className="py-1">
              {renderActionSuggestions()}
            </div>

            {/* Text input form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 flex items-center bg-[#2a3942] rounded-3xl p-1 px-2 border border-slate-700/35 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Envie sua ação livre para o Mestre..."
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 min-h-[40px] max-h-32"
                  rows={1}
                />
              </div>

              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 bg-gradient-to-tr from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:hover:from-emerald-600 disabled:hover:to-indigo-600 transition-all cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            <div className="flex justify-between items-center text-[9px] text-slate-500 px-1 select-none">
              <span className="font-mono tracking-wider uppercase">WhatIsRPG? Engine v3.5</span>
              <span>Responda às escolhas para alterar o destino.</span>
            </div>
          </div>
        </footer>

        {/* 
          MOBILE BOTTOM NAVIGATION TAB BAR
        */}
        <nav className="lg:hidden bg-[#111b21] border-t border-[#222e35] grid grid-cols-4 py-2 text-center select-none shrink-0">
          <button 
            id="tab-chat"
            onClick={() => setActiveMobileTab('chat')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${activeMobileTab === 'chat' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-medium">Conversas</span>
          </button>
          <button 
            id="tab-ficha"
            onClick={() => setActiveMobileTab('ficha')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${activeMobileTab === 'ficha' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Ficha</span>
          </button>
          <button 
            id="tab-bag"
            onClick={() => setActiveMobileTab('bag')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${activeMobileTab === 'bag' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium">Grimório</span>
          </button>
          <button 
            id="tab-butterfly"
            onClick={() => setActiveMobileTab('butterfly')}
            className={`flex flex-col items-center justify-center gap-1 cursor-pointer ${activeMobileTab === 'butterfly' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-medium">Diário</span>
          </button>
        </nav>
      </section>

      {/* 
        DESKTOP RIGHT SIDE PANEL or MOBILE TAB OVERLAYS:
        - Ficha do Personagem (Atributos, HP/MP, Raça, Classe)
        - Inventário Persistente (Itens)
        - Grimório (Habilidades adquiridas)
        - Efeito Borboleta Diário
      */}
      <aside 
        className={`w-full lg:w-96 shrink-0 border-l border-[#222e35] bg-[#111b21] h-full overflow-y-auto flex-col ${
          activeMobileTab !== 'chat' ? 'fixed inset-0 z-40 flex lg:relative lg:flex' : 'hidden lg:flex'
        }`}
      >
        {/* Mobile Header overlay */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#202c33] border-b border-[#222e35]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display font-bold text-white uppercase text-xs tracking-wider">
              {activeMobileTab === 'ficha' ? 'Ficha de Status' : activeMobileTab === 'bag' ? 'Equipamento & Magia' : 'Efeito Borboleta & Diário'}
            </h2>
          </div>
          <button 
            id="btn-close-mobile-tab"
            onClick={() => setActiveMobileTab('chat')}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Voltar ao Chat
          </button>
        </div>

        {/* Detailed Character status section */}
        {(activeMobileTab === 'ficha' || activeMobileTab === 'chat') && (
          <div className="p-4 border-b border-[#222e35]">
            <div className="flex items-center gap-1.5 mb-3">
              <User className="w-4 h-4 text-emerald-400" />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Identidade do Herói</h3>
            </div>
            
            {gameState.character ? (
              <div className="space-y-4">
                {/* Character Name card */}
                <div className="bg-[#1f2c34] p-3 rounded-2xl border border-slate-700/20">
                  <div className="text-xs text-slate-400">Nome do Personagem:</div>
                  <div className="text-base font-bold font-display text-indigo-300 mt-0.5">{gameState.character.name}</div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/30 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Raça</span>
                      <strong className="text-white font-medium">{gameState.character.race}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Subclasse / Classe</span>
                      <strong className="text-amber-300 font-medium truncate block">
                        {gameState.character.subclass || gameState.character.className}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* HP / MP progress bars */}
                <div className="space-y-2 font-mono">
                  {/* HP Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <div className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                        <span>VITALIDADE (HP)</span>
                      </div>
                      <span className="text-rose-400">{gameState.character.hp} / {gameState.character.maxHp}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-rose-950/20">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300" 
                        style={{ width: `${Math.max(0, Math.min(100, (gameState.character.hp / gameState.character.maxHp) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* MP Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <div className="flex items-center gap-1 text-indigo-400">
                        <Feather className="w-3.5 h-3.5" />
                        <span>MANA (MP)</span>
                      </div>
                      <span className="text-indigo-400">{gameState.character.mp} / {gameState.character.maxMp}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-indigo-950/20">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-sky-600 transition-all duration-300" 
                        style={{ width: `${Math.max(0, Math.min(100, (gameState.character.mp / gameState.character.maxMp) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Level & XP */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>PROGRESSO DE EXP</span>
                      <span>{gameState.character.xp} / {gameState.character.nextLevelXp} XP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 transition-all duration-300" 
                        style={{ width: `${Math.max(0, Math.min(100, (gameState.character.xp / gameState.character.nextLevelXp) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attributes breakdown sheet */}
                <div className="bg-[#1f2c34]/50 border border-slate-700/25 p-3 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold mb-2">Atributos Primários</div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">🗡️ FOR:</span>
                      <strong className="text-rose-300 text-sm">{gameState.character.attributes.for}</strong>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">⚡ AGI:</span>
                      <strong className="text-amber-300 text-sm">{gameState.character.attributes.agi}</strong>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">🔮 INT:</span>
                      <strong className="text-indigo-300 text-sm">{gameState.character.attributes.int}</strong>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">🛡️ VIT:</span>
                      <strong className="text-emerald-300 text-sm">{gameState.character.attributes.vit}</strong>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">👁️ PER:</span>
                      <strong className="text-sky-300 text-sm">{gameState.character.attributes.per}</strong>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-400">🧘 WIL:</span>
                      <strong className="text-purple-300 text-sm">{gameState.character.attributes.wil}</strong>
                    </div>
                  </div>
                </div>

                {/* Titles and Cicatrizes */}
                {((gameState.character.titles && gameState.character.titles.length > 0) || 
                  (gameState.character.cicatrizes && gameState.character.cicatrizes.length > 0)) && (
                  <div className="space-y-2 pt-1">
                    {gameState.character.titles && gameState.character.titles.length > 0 && (
                      <div>
                        <div className="text-[10px] text-amber-400 font-mono tracking-wider uppercase font-semibold mb-1">👑 Títulos Obtidos:</div>
                        <div className="flex flex-wrap gap-1">
                          {gameState.character.titles.map(title => (
                            <span key={title} className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold py-0.5 px-2 rounded-full">
                              {title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {gameState.character.cicatrizes && gameState.character.cicatrizes.length > 0 && (
                      <div>
                        <div className="text-[10px] text-rose-400 font-mono tracking-wider uppercase font-semibold mb-1">🩸 Cicatrizes de Batalha:</div>
                        <div className="flex flex-wrap gap-1">
                          {gameState.character.cicatrizes.map(scar => (
                            <span key={scar} className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] py-0.5 px-2 rounded-full">
                              {scar}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#1f2c34]/50 rounded-2xl border border-slate-700/25">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Inicie a criação de personagem no chat principal para desbloquear sua ficha técnica e atributos!
                </p>
                <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mt-4" />
              </div>
            )}
          </div>
        )}

        {/* Grimório (Habilidades adquiridas) & Bolsa (Inventário) */}
        {(activeMobileTab === 'bag' || activeMobileTab === 'chat') && (
          <div className="p-4 border-b border-[#222e35] space-y-4">
            {/* Grimório */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Grimório Persistente</h3>
              </div>
              
              {gameState.grimoire && gameState.grimoire.length > 0 ? (
                <div className="space-y-1.5">
                  {gameState.grimoire.map((skill: Skill) => (
                    <div 
                      key={skill.name} 
                      className="p-2.5 bg-indigo-950/20 border border-indigo-500/15 rounded-xl text-xs hover:border-indigo-500/30 transition-all"
                    >
                      <div className="flex justify-between font-semibold">
                        <span className="text-indigo-300">{skill.name}</span>
                        <span className="text-sky-300 text-[10px] font-mono">{skill.cost}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{skill.description}</p>
                      <div className="flex gap-2 items-center mt-1.5 pt-1.5 border-t border-indigo-500/5 text-[10px] text-slate-500">
                        <span>Foco: <strong className="text-slate-400">{skill.type}</strong></span>
                        <span>•</span>
                        <span>Nível: <strong className="text-slate-400">{skill.level}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-normal italic py-1">
                  Seu grimório está vazio. Aprenda habilidades táticas e mágicas com o decorrer da aventura.
                </p>
              )}
            </div>

            {/* Bolsa (Inventário) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Bolsa de Inventário</h3>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Coins Prata</span>
                </div>
              </div>

              {gameState.inventory && gameState.inventory.length > 0 ? (
                <div className="grid grid-cols-1 gap-1.5">
                  {gameState.inventory.map((item: Item) => (
                    <div 
                      key={item.name} 
                      className="p-2 bg-slate-800/30 border border-slate-700/20 rounded-xl text-xs flex justify-between items-start gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                          {item.bonus && (
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1 rounded font-mono font-bold">
                              {item.bonus}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-1">{item.description}</p>
                      </div>
                      <span className="text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 rounded px-1.5 text-[10px] font-semibold shrink-0">
                        {item.quantity}x
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-normal italic py-1">
                  Nenhum item na bolsa. Colete materiais e tesouros ao explorar e derrotar monstros.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Efeito Borboleta & Diário de Missões */}
        {(activeMobileTab === 'butterfly' || activeMobileTab === 'chat') && (
          <div className="p-4 space-y-4">
            {/* Missões Diárias */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Diário de Missões</h3>
              </div>

              {gameState.quests && gameState.quests.length > 0 ? (
                <div className="space-y-1.5">
                  {gameState.quests.map((quest: Quest) => (
                    <div 
                      key={quest.id} 
                      className="p-2.5 bg-slate-800/30 border border-slate-700/20 rounded-xl text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <strong className="text-slate-200 leading-tight block">{quest.title}</strong>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          quest.status === 'completed' 
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                            : quest.status === 'failed' 
                              ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400' 
                              : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                        }`}>
                          {quest.status === 'completed' ? 'CONCLUÍDO' : quest.status === 'failed' ? 'FALHADO' : 'ATIVO'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">{quest.description}</p>
                      {quest.reward && (
                        <div className="mt-1 text-[10px] text-emerald-400 font-mono">
                          Recompensa: <strong>{quest.reward}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-normal italic py-1">
                  Sem missões ativas no momento.
                </p>
              )}
            </div>

            {/* Efeito Borboleta */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <TrendingUp className="w-4 h-4 text-rose-400 animate-pulse" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-white">Efeito Borboleta (Destino)</h3>
              </div>
              
              {gameState.butterflyEffects && gameState.butterflyEffects.length > 0 ? (
                <div className="space-y-1.5 font-mono text-[11px]">
                  {gameState.butterflyEffects.map((effect, idx) => (
                    <div 
                      key={idx} 
                      className="p-2 bg-rose-950/10 border border-rose-500/10 text-rose-300 rounded-xl flex gap-2 items-start"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <p className="leading-relaxed select-text">{effect}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-normal italic py-1">
                  Nenhuma grande decisão tomada ainda. Suas escolhas críticas que alterarem o destino do mundo serão eternizadas aqui.
                </p>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
