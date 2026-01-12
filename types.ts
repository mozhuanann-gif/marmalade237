
export enum SuccessLevel {
  CRITICAL = 'CRITICAL',
  EXTREME = 'EXTREME',
  HARD = 'HARD',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  FUMBLE = 'FUMBLE'
}

export interface User {
  email: string;
  nickname: string;
  avatar: string;
  isKP: boolean;
  attributes?: CharacterAttributes;
}

export interface CharacterAttributes {
  STR: number;
  CON: number;
  DEX: number;
  APP: number;
  POW: number;
  LUCK: number;
  SIZ: number;
  INT: number;
  EDU: number;
  SAN: number;
}

export interface Message {
  id: string;
  userId: string;
  userNickname: string;
  userAvatar: string;
  content: string;
  command?: string;
  timestamp: number;
  isHidden?: boolean; // For .rh commands
}

export interface Deck {
  id: string;
  name: string;
  content: string; // The raw template format
}

export interface KPConfig {
  themeColor: string;
  backgroundImage: string;
  logoImage: string;
  isWhiteMode: boolean;
  templates: {
    [key: string]: string; // Keyed by SuccessLevel or action
  };
  bannedEmails: string[];
}

export interface AppState {
  history: Message[];
  decks: Deck[];
  config: KPConfig;
  users: User[];
}
