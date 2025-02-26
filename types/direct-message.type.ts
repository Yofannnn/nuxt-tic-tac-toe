export interface IDirectMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponseGetUserConversations {
  user_id: number;
  conversations: {
    id: number;
    createdAt: Date;
    messages: IDirectMessage[];
    _count: { messages: number };
    participants: {
      user_id: number;
      conversation_id: number;
      createdAt: Date;
      deleted_at: Date | null;
      user: {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }[];
  }[];
}
