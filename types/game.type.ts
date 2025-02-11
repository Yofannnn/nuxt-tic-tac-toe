export interface IGameState {
  board: string[];
  status: 'active' | 'draw' | 'ended';
  id: number;
  createdAt: Date;
  updatedAt: Date;
  room_id: number;
  turn: number;
  winner: number | null;
}

export interface IMatchHistory {
  id: number;
  player1_id: number;
  player2_id: number;
  createdAt: Date;
  updatedAt: Date;
  room_id: number;
  player1_score: number;
  player2_score: number;
  duration: number;
}

export interface IGameChat {
  id: number;
  room_id: number;
  player_id: number;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInitializeGame {
  initial_game: IGameState;
  room_players: {
    player_1: {
      id: number;
      name: string;
    };
    player_2: {
      id: number;
      name: string;
    };
  };
}
