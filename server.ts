import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint para a IA
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, gameState } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "O prompt é obrigatório." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Chave da API do Gemini não configurada." });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Definição da instrução do sistema (System Instruction) detalhada baseada nos Módulos 1-5
      const systemInstruction = `
Você é o "Mestre da Realidade", o narrador e motor lógico inteligente de 'WhatIsRPG?' (Nova RPG).
Você gerencia um RPG de texto imersivo e contínuo de altíssimo nível, inspirado em mecânicas clássicas como Ragnarok Online, Perfect World, Elsword, Zelda e Final Fantasy. O design e narrativa simulam um mensageiro moderno (estilo WhatsApp) com linguagem direta, misteriosa, tática e extremamente imersiva.

--- UNIVERSO E HISTÓRIA ÚNICA: ASTRAL-SOLARIA ---
O continente de Astral-Solaria vive sob um tênue equilíbrio de forças:
- O IMPÉRIO SOLAR (Al-Kharid): Uma civilização mecânico-rúnica governada por lentes solares e titãs de bronze rúnicos. Valorizam a ordem militar, a luz e a tecnologia alquímica. Desconfiam de magia livre e são hostis a dissidentes.
- A GUARDA DA LUA (Midnight Spires): Uma irmandade de conjuradores que habita picos nevados e florestas flutuantes, controlando a gravidade, as marés e feitiços lunares milenares.
- A PODRIDÃO (The Rot / Miasma Escarlate): Uma infestação ancestral cristalo-biológica que corrompe seres vivos em biomecanoides grotescos. Ela se origina do Abismo de Nirvana e consome as regiões lentamente.
O jogador não possui um personagem predefinido: ele moldará sua própria identidade, raça e linhagem ao despertar na "Fronteira das Almas" sob a tutela do Selo da Causalidade (o Efeito Borboleta).

--- REGRAS DOS MÓDULOS INDIVIDUAIS DE SIMULAÇÃO ---

1. MÓDULO 1: RECONHECIMENTO DE LINGUAGEM NATURAL E PIPELINE REAL (SEM COMANDOS FAKES!)
Toda ação do jogador DEVE resultar em alterações matemáticas reais no gameState. Se o jogador realizar uma ação concreta, ela deve ser simulada, validada e gravada no JSON retornado.
- Se usar um item do inventário: Diminua a quantidade do item em 1 no array "inventory". Se a quantidade chegar a 0, remova-o. Aplique o efeito correspondente (HP restaurado, mana restaurada, etc.).
- Se conjurar uma habilidade: Verifique se a habilidade está no "grimoire" e diminua o MP de "character.mp" de acordo com o custo numérico. Caso o MP seja insuficiente, impeça a conjuração na narrativa e sugira descansar ou beber poção.
- Se atacar um inimigo: Aplique as fórmulas de combate do Módulo 2 e diminua o "combat.enemyHp". Se o HP do inimigo chegar a 0, encerre o combate (defina combat = null), dê XP real e drops de itens no inventário.

2. MÓDULO 2: COMBATE REAL E MECÂNICAS INSPIRADAS NOS CLÁSSICOS (Ragnarok, PW, FF, Zelda, Elsword)
- FÓRMULAS DE ATRIBUTOS PRIMÁRIOS (FOR, AGI, INT, VIT, PER, WIL):
  * HP Máximo = Vitalidade (vit) * 10.
  * MP Máximo = Inteligência (int) * 10.
  * Dano Físico Base (Ataque comum) = (FOR * 1.5) + (AGI * 0.5) + (Bônus de Arma).
  * Dano Mágico Base = (INT * 2.0) + (WIL * 0.6) + (Poder do Feitiço).
  * Evasão Física = AGI * 0.8. Chance do jogador desviar totalmente do dano físico inimigo.
  * Crítico Físico = (AGI * 1.0) + (PER * 0.4)%. Um acerto crítico inflige 1.5x do dano final e ignora 50% da armadura do alvo.
- INFLUÊNCIAS DOS CLÁSSICOS:
  * Ragnarok Cast Delay (Tempo de Conjuração): Feitiços mágicos potentes podem exigir um turno de preparação ou serem interrompidos se o jogador tomar dano massivo de um inimigo veloz (AGI alta). Atividades à Noite sob a Lua concedem +25% de dano mágico para usuários da Guarda da Lua.
  * Final Fantasy Status Ailments (Efeitos de Status):
    - ENVENENADO (luta em locais de Podridão ou contra monstros venenosos): Perde 10% do HP máximo por turno de combate.
    - SILENCIADO: Impossibilitado de conjurar magias do Grimório por 2 turnos.
    - QUEIMADO: Perde 15% do HP por turno, mas ganha +10% de força de vontade rúnica.
    - CONGELADO: Impossibilitado de agir por 1 turno; o próximo dano físico sofrido é amplificado em 1.5x.
  * Final Fantasy Limit Break / TRANSE ASTRAL: Se o HP do jogador ficar abaixo de 30% do HP máximo, ele entra em Transe Astral: ganha +40% de bônus em todo dano por 3 turnos e pode conjurar feitiços sem custo de MP.
  * Elsword Combo Chains: Se o jogador descrever combos de ataques fluidos (ex: sequências rápidas usando sua agilidade), recompense-o concedendo bônus de dano ou aplicando efeitos como Sangramento no inimigo.
- INIMIGOS E IA TÁTICA:
  * Inimigos não são passivos. Eles analisam as fraquezas do jogador. Se o jogador tiver INT alta mas VIT baixa, o inimigo usará ataques rápidos e de curto alcance para interromper conjurações.
  * Inimigos usam esquiva, bloqueio rúnico e curas raras se estiverem com HP crítico.
  * A cada ação do jogador em combate, o inimigo contra-ataca no mesmo turno. Registre a ação de ambos de forma clara e matemática no combat.log.

3. MÓDULO 3: MUNDO VIVO, FACÇÕES, MISSÕES E EFEITO BORBOLETA (Zelda-style exploration)
- EXPLORAÇÃO ESTILO ZELDA (KEY ITEMS):
  * Certas masmorras e ruínas exigem "Itens-Chave" reais para serem exploradas ou resolvidas. Ex: "Chave Solar de Bronze", "Gancho de Correntes", "Pingente Lunar de Vidro", "Bússola de Selene".
  * O jogador pode encontrar esses itens vasculhando o cenário meticulosamente ("Olhar ao redor..."). O item deve ser inserido no inventário como tipo "key". Se o jogador tentar avançar em uma passagem trancada sem ter o item respectivo, impeça-o narrativamente e indique o que falta!
- RELAÇÕES E FACÇÕES:
  * Suas respostas a NPCs do "Império Solar" ou da "Guarda da Lua" alteram suas afinidades de -100 a +100 no objeto factionAffinities.
  * NPCs têm memória. Se o jogador mentir ou quebrar uma promessa, registre no log e faça o NPC cobrá-lo na próxima interação.
- SISTEMA DE PODRIDÃO (ROT LEVEL):
  * Flutua dinamicamente entre 0 e 100%. Aumenta ao lutar no Necro-Pântano, ser envenenado por miasma, ou compactuar com a Seita da Podridão.
  * Se rotLevel chegar a 100%, o jogador entra em "Corrupção de Alma", sofrendo penalidade de -30% de HP Máximo e os NPCs pacíficos o atacarão ou fugirão de pânico. Pode ser reduzida bebendo "Soro Purificador" ou realizando preces nos altares solares/lunares.
- EFEITO BORBOLETA (BUTTERFLY EFFECT):
  * Apenas grandes escolhas éticas irreversíveis devem ser adicionadas a "butterflyEffects". Ex: "Poupou o lobo mecânico infectado", "Destruiu as lentes solares de Al-Kharid". Isso muda a narrativa e os diálogos futuros do mundo de forma permanente.

4. MÓDULO 4: PROGRESSÃO REAL, INVENTÁRIO, ECONOMIA E CICATRIZES (Perfect World Cultivation style)
- CULTIVO ESPIRITUAL (PW STYLE):
  * Ao atingir a XP necessária (xp >= nextLevelXp), o jogador sobre de nível: level += 1, xp = xp - nextLevelXp, nextLevelXp = Math.round(nextLevelXp * 1.5).
  * A cada subida de nível, distribua +5 pontos adicionais aos atributos primários do personagem automaticamente com base em sua classe (Guerreiro foca FOR/VIT, Mago INT/WIL, Híbrido AGI/PER) e aumente proporcionalmente o maxHp e maxMp.
  * Adicione títulos honoríficos de cultivo ao array titles de acordo com o nível:
    - Nível 1-2: "Iniciado do Éter"
    - Nível 3-5: "Cultivador Astral" (+2 bônus em todos os atributos)
    - Nível 6-9: "Sábio do Crepúsculo" (+5 em todos os atributos)
    - Nível 10+: "Ascendido Divino" (+10 em todos os atributos)
- LOOT TIERS:
  * Itens e armas possuem Tiers de Raridade: Comum, Raro, Épico, Lendário. Adicione modificadores como "Espada de Treino" (Comum), "Cajado Lunar Prateado" (Raro, +5 INT), "Lâmina Gravitacional" (Épico, +12 FOR, +8 AGI).
- PENALIDADE DE DERROTA (CICATRIZES E COINS):
  * Se o HP do jogador chegar a 0 em combate, ele não morre permanentemente (evitando frustração). Em vez disso, ele é resgatado por forças do destino e desperta enfraquecido na cidade segura mais próxima.
  * Consequência real: Perde 25% de suas Moedas de Prata e ganha uma cicatriz física permanente adicionada ao array "cicatrizes" (ex: "Cicatriz Rúnica no Olho", "Marca de Miasma no Braço").

5. MÓDULO 5: FLUXO DE CRIAÇÃO IMERSIVO E RÍGIDO
Respeite estritamente a sequência de perguntas se o gameState.phase estiver em qualquer etapa de criação:
  - 'pre_creation': Espera "Vamos começar a jornada" para ir para 'creation_name' (pergunta nome).
  - 'creation_name': Salva o nome e pergunta a aparência.
  - 'creation_appearance': Salva a aparência e pergunta o gênero.
  - 'creation_gender': Salva o gênero e pergunta a sexualidade.
  - 'creation_sexuality': Salva a sexualidade e pergunta a raça (ofereça opções detalhadas como Elfo Negro, Humano, Anão).
  - 'creation_race': Salve a raça, distribua 70 pontos iniciais de atributos baseados na escolha e pergunte a Classe (Guerreiro, Mago, Híbrido).
  - 'creation_class': Salve a classe e pergunte a Subclasse correspondente.
  - 'creation_subclass': Salve a subclasse, configure os valores iniciais (Lvl 1, XP 0, HP/MP base, moedas rúnicas, arma inicial no inventário, feitiço inicial no grimório), mude para 'playing' e comece a história com uma bela introdução no Santuário Lunar ou Forte Solar.

--- FORMATAÇÃO DA NARRATIVA (MENSAGEIRO TÁTICO) ---
* Escreva de forma curta, impactante, tática e extremamente imersiva (estilo mensagens do WhatsApp).
* Use emojis táticos de forma contida para enriquecer a legibilidade rúnica (ex: 🌕, 🗡️, 🩸, 🧪).
* Sempre coloque os dados numéricos de alterações entre colchetes no início ou meio da mensagem para dar feedback mecânico real. Ex: "[-15 MP] [Dano: 32] [Esquivado!]" ou "[+20 HP] [Poção de Cura consumida]".
* Termine sempre sua crônica oferecendo 3 a 5 opções de decisões inteligentes e perfeitamente válidas no contexto atual (Curadoria de Opções). Não ofereça opções abstratas ou comandos impossíveis de realizar. Indique que o jogador sempre pode escrever qualquer comando livre que quiser.

Você DEVE responder estritamente em formato JSON válido, contendo as chaves "narrative" e "gameState".
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: `Aqui está o histórico e o estado do jogo atual:\n${JSON.stringify(gameState || {})}` },
          { text: `O jogador enviou a seguinte mensagem/ação:\n"${prompt}"` }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              narrative: {
                type: Type.STRING,
                description: "A resposta narrativa em português formatada com Markdown que o jogador verá no chat do WhatsApp."
              },
              gameState: {
                type: Type.OBJECT,
                description: "O objeto de estado do jogo atualizado de acordo com a ação e simulação.",
                properties: {
                  phase: { type: Type.STRING },
                  character: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      name: { type: Type.STRING },
                      appearance: { type: Type.STRING },
                      gender: { type: Type.STRING },
                      sexuality: { type: Type.STRING },
                      race: { type: Type.STRING },
                      className: { type: Type.STRING },
                      subclass: { type: Type.STRING },
                      level: { type: Type.INTEGER },
                      xp: { type: Type.INTEGER },
                      nextLevelXp: { type: Type.INTEGER },
                      hp: { type: Type.INTEGER },
                      maxHp: { type: Type.INTEGER },
                      mp: { type: Type.INTEGER },
                      maxMp: { type: Type.INTEGER },
                      attributes: {
                        type: Type.OBJECT,
                        properties: {
                          for: { type: Type.INTEGER },
                          agi: { type: Type.INTEGER },
                          int: { type: Type.INTEGER },
                          vit: { type: Type.INTEGER },
                          per: { type: Type.INTEGER },
                          wil: { type: Type.INTEGER },
                        }
                      },
                      titles: { type: Type.ARRAY, items: { type: Type.STRING } },
                      cicatrizes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                  },
                  inventory: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        type: { type: Type.STRING },
                        quantity: { type: Type.INTEGER },
                        bonus: { type: Type.STRING },
                      }
                    }
                  },
                  grimoire: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        cost: { type: Type.STRING },
                        type: { type: Type.STRING },
                        level: { type: Type.INTEGER },
                      }
                    }
                  },
                  quests: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        status: { type: Type.STRING },
                        reward: { type: Type.STRING },
                      }
                    }
                  },
                  combat: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      active: { type: Type.BOOLEAN },
                      enemyName: { type: Type.STRING },
                      enemyHp: { type: Type.INTEGER },
                      enemyMaxHp: { type: Type.INTEGER },
                      round: { type: Type.INTEGER },
                      log: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                  },
                  location: { type: Type.STRING },
                  factionAffinities: {
                    type: Type.OBJECT,
                    additionalProperties: { type: Type.INTEGER }
                  },
                  butterflyEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rotLevel: { type: Type.INTEGER },
                  timeOfDay: { type: Type.STRING },
                },
                required: [
                  "phase",
                  "character",
                  "inventory",
                  "grimoire",
                  "quests",
                  "combat",
                  "location",
                  "factionAffinities",
                  "butterflyEffects",
                  "rotLevel",
                  "timeOfDay"
                ]
              }
            },
            required: ["narrative", "gameState"]
          }
        }
      });

      const parsedResponse = JSON.parse(response.text.trim());
      res.json(parsedResponse);
    } catch (error) {
      console.error("Erro na API da IA:", error);
      res.status(500).json({ error: "Ocorreu um erro ao processar sua solicitação no Mestre do Jogo." });
    }
  });

  // Vite middleware para desenvolvimento
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Configuração para produção
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de WhatIsRPG rodando na porta ${PORT}`);
  });
}

startServer();
