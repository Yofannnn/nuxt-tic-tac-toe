import type { IMatchHistory } from './game.type';

export interface IGetRoomsWaitingResponse {
  id: number;
  name: string;
  owner_id: number;
  status: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponseCreateAndJoinRoom {
  message: string;
  room: IGetRoomsWaitingResponse;
  user_id: number;
}

export interface IResponseLeaveRoom {
  message: string;
  match_history?: IMatchHistory;
}
