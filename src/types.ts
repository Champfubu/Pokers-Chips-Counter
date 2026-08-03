export interface Player {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  avatarColor: string;
  lastAction?: string;
  isDealer?: boolean;
  isSmallBlind?: boolean;
  isBigBlind?: boolean;
}

export interface HandRecord {
  id: string;
  handNumber: number;
  potAmount: number;
  winners: { id: string; name: string; amountWon: number }[];
  timestamp: string;
}

export interface GameSettings {
  initialChips: number;
  smallBlind: number;
  bigBlind: number;
  autoBlinds: boolean;
  soundEnabled: boolean;
}
