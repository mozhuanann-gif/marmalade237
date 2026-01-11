export enum SuccessLevel {
  CRITICAL = '大成功',
  EXTREME = '极难成功',
  HARD = '困难成功',
  REGULAR = '成功',
  FAILURE = '失败',
  FUMBLE = '大失败'
}

export enum MessageType {
  ROLL = 'ROLL',
  SYSTEM = 'SYSTEM',
  SANITY = 'SANITY',
  LUCK = 'LUCK',
  HELP = 'HELP',
  DRAW = 'DRAW'
}

export interface Player {
  email: string;
  name: string;
  avatar: string;
  isAdmin?: boolean;
}

export interface AppConfig {
  backgroundUrl: string;
  themeColor: string;
}

export interface Message {
  id: string;
  type: MessageType;
  timestamp: number;
  playerName: string;
  playerAvatar: string;
  playerEmail: string;
  content: string; 
  rollData?: {
    label: string;
    formula: string;
    total: number;
    successLevel?: SuccessLevel;
  };
}

export interface CharacterStat {
  id: string;
  name: string;
  value: number;
}
