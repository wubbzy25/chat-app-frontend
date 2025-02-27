import { CardChatInterface } from "./CardChatInterface";
import { SocketMessage } from "./SocketMessageInterface";

export interface ChatPageInterface {
  picture: string;
  name: string;
  chatId: string;
  sendMessage: (message: SocketMessage) => void;
  messages: CardChatInterface[];
  setMessages: (message: CardChatInterface[]) => void;
}
