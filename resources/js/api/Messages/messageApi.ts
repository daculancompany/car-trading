import api from "../api";

// Related User

export interface MessageUser {
  id: number;
  username?: string;
  email?: string;
  customer?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    image_url?: string | null;
  } | null;
}

// Message

export interface Message {
  id: number;

  sender_user_id: number;
  receiver_user_id: number;

  message: string;
  is_read: boolean;

  sent_at: string;

  created_at?: string;
  updated_at?: string;

  sender?: MessageUser;
  receiver?: MessageUser;
}

// Create Message

export interface CreateMessageData {
  receiver_user_id?: number;
  message: string;
}

// API Response Interfaces

interface MessageListResponse {
  message: string;
  data: Message[];
}

interface MessageResponse {
  message: string;
  data: Message;
}

// GET MY MESSAGES
// GET /api/messages
//
// CUSTOMER:
// Returns the customer's conversation with the Secretary.
//
// SECRETARY:
// Returns customer-secretary messages.
//

export const getMessages = async (): Promise<Message[]> => {
  const response = await api.get<MessageListResponse>("/messages");

  return response.data.data;
};

// GET CONVERSATION
// GET /api/messages/conversation/{userId}
//
// CUSTOMER:
// userId = Secretary ID
//
// SECRETARY:
// userId = Customer ID
//

export const getConversation = async (userId: number): Promise<Message[]> => {
  const response = await api.get<MessageListResponse>(
    `/messages/conversation/${userId}`,
  );

  return response.data.data;
};

// SEND MESSAGE
// POST /api/messages
//
// CUSTOMER:
// Only sends the message.
// Laravel automatically finds the Secretary.
//
// SECRETARY:
// Sends the message to the selected customer.
//

export const createMessage = async (
  data: CreateMessageData,
): Promise<Message> => {
  const response = await api.post<MessageResponse>("/messages", data);

  return response.data.data;
};

// MARK MESSAGE AS READ
// PATCH /api/messages/{id}/read

export const markMessageAsRead = async (id: number): Promise<Message> => {
  const response = await api.patch<MessageResponse>(`/messages/${id}/read`);

  return response.data.data;
};
