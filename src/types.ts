export interface Attributes {
  for: number; // Força física
  agi: number; // Agilidade / velocidade
  int: number; // Capacidade mágica
  vit: number; // Resistência / Vitalidade
  per: number; // Percepção
  wil: number; // Força de vontade / controle mental
}

export interface Character {
  name: string;
  appearance: string;
  gender: string;
  sexuality: string;
  race: string;
  className: string;
  subclass: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attributes: Attributes;
  titles: string[];
  cicatrizes: string[];
}

export interface Item {
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'key' | 'material';
  quantity: number;
  bonus?: string;
}

export interface Skill {
  name: string;
  description: string;
  cost: string;
  type: string;
  level: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed';
  reward?: string;
}

export interface CombatState {
  active: boolean;
  enemyName: string;
  enemyHp: number;
  enemyMaxHp: number;
  round: number;
  log: string[];
}

export interface GameState {
  phase: 
    | 'pre_creation' 
    | 'creation_name' 
    | 'creation_appearance' 
    | 'creation_gender' 
    | 'creation_sexuality' 
    | 'creation_race' 
    | 'creation_class' 
    | 'creation_subclass' 
    | 'playing';
  character: Character | null;
  inventory: Item[];
  grimoire: Skill[];
  quests: Quest[];
  combat: CombatState | null;
  location: string;
  factionAffinities: { [factionName: string]: number }; // -100 to +100
  butterflyEffects: string[]; // Registro de grandes decisões que mudaram o mundo
  rotLevel: number; // Nível de podridão (0-100)
  timeOfDay: 'Manhã' | 'Tarde' | 'Noite' | 'Madrugada';
  suggestedActions?: string[]; // Ações contextuais dinâmicas oferecidas pelo Mestre
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // WhatsApp-like timestamp
  status?: 'sent' | 'delivered' | 'read';
  systemUpdate?: string; // Informações de status exibidas inline como se fossem logs ou sussurros
}
