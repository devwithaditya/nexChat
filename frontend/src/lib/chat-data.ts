// Mock data layer. Swap these with Lovable Cloud queries when wiring DB.

export type Conversation = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  online?: boolean;
  avatarTone: "green" | "blue" | "pink" | "amber" | "violet";
};

export type Message = {
  id: string;
  conversationId: string;
  authorId: string; // "me" or conversation.id
  text: string;
  time: string;
};

export const conversations: Conversation[] = [];

export const initialMessages: Message[] = [];
