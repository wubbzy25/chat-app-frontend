import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class ChatService {
  private client: Client;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS("/chat"),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  connect(onMessage: (msg: string) => void) {
    this.client.onConnect = () => {
      this.client.subscribe("/topic/message", (message) => {
        onMessage(JSON.parse(message.body));
      });
    };
    this.client.activate();
  }

  disconnect() {
    this.client.deactivate();
  }

  sendMessage(message: string) {
    this.client.publish({
      destination: "/topic/message",
      body: JSON.stringify(message),
    });
  }
}

const chatService = new ChatService();
export default chatService;
