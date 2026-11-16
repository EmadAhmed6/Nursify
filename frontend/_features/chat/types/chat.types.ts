export interface ChatSender {
  _id: string;
  fullName?: string;
  username: string;
  profilePicture?: {
    url?: string;
    publicId?: string | null;
  };
  role?: "student" | "admin" | "superadmin";
}

export interface RepliedMessage {
  _id: string;
  sender: ChatSender;
  content: string;
  createdAt?: string;
}

export interface GlobalChatMessage {
  _id: string;
  sender: ChatSender;
  content: string;
  replyTo?: RepliedMessage | null;
  createdAt: string;
  updatedAt?: string;
}
