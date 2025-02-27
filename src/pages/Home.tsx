import { useState, useRef } from "react";
import { ListChat } from "../components/ListChat";
import { ChatPage } from "../components/ChatPage";
import { Client } from "@stomp/stompjs";
import { ChatSelect } from "../interfaces/ChatSelectInterface";
import { SocketMessage } from "../interfaces/SocketMessageInterface";
import { CardChatInterface } from "../interfaces/CardChatInterface";
export function Home() {
  const [Chat, SetChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<CardChatInterface[]>([]);
  const [ChatPageProps, setChatPageProps] = useState<ChatSelect>(
    {} as ChatSelect
  );

  const webSocketRefs = useRef<{ [key: string]: WebSocket }>({});
  const clientRef = useRef<{ [key: string]: Client }>({});

  const connectToSocket = (idChat: string) => {
    if (!webSocketRefs.current[idChat]) {
      const socket = new WebSocket("http://localhost:8080/chat");
      const client = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          client.subscribe(`/topic/chat/${idChat}`, (message) => {
            const socketMessage = JSON.parse(message.body) as SocketMessage;
            const cardChatMessage: CardChatInterface = {
              message: socketMessage.message,
              picture: socketMessage.picture,
              senderId: socketMessage.senderId,
              time: socketMessage.time,
            };
            setMessages((prevMessages) => [...prevMessages, cardChatMessage]);
            console.log(cardChatMessage);
          });
          client.publish({
            destination: `/app/chat/${idChat}`,
          });
        },
        onStompError: (frame) => {
          console.error("Error STOMP: ", frame.headers["message"]);
          console.error("Detalles: ", frame.body);
        },
      });
      clientRef.current[idChat] = client;
      webSocketRefs.current[idChat] = socket;
      client.activate();
    }
  };

  const sendMessageToSocket = (message: SocketMessage) => {
    const idChat = ChatPageProps.idChat;
    const socketMessage: SocketMessage = {
      chatId: message.chatId,
      message: message.message,
      senderId: message.senderId,
      picture: message.picture,
      time: message.time,
    };
    if (clientRef.current[idChat]) {
      clientRef.current[idChat].publish({
        destination: `/app/chat/${idChat}`,
        body: JSON.stringify(socketMessage),
      });
    }
  };

  const handleChatSelect = (chat: ChatSelect) => {
    setChatPageProps(chat);
    connectToSocket(chat.idChat);
  };

  return (
    <main className="flex p-10 gap-5 h-screen">
      <ListChat setChat={SetChat} setOnChatSelect={handleChatSelect} />
      {Chat && (
        <ChatPage
          name={ChatPageProps.name}
          picture={ChatPageProps.picture}
          chatId={ChatPageProps.idChat}
          sendMessage={sendMessageToSocket}
          messages={messages}
          setMessages={setMessages}
        />
      )}
    </main>
  );
}
