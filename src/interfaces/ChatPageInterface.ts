import { CardChatInterface } from "./CardChatInterface";
import { SocketMessage } from "./SocketMessageInterface";

export interface ChatPageInterface {
  setChat: (value: boolean) => void;
  isChatOpen: boolean;
  picture: string;
  name: string;
  chatId: string;
  sendMessage: (message: SocketMessage) => void;
  messages: CardChatInterface[];
}
