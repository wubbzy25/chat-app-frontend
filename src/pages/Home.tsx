import { useState, useRef, useEffect, useCallback } from "react";
import { ListChat } from "../components/ListChat";
import { ChatPage } from "../components/ChatPage";
import { Client } from "@stomp/stompjs";
import { ChatSelect } from "../interfaces/ChatSelectInterface";
import { SocketMessage } from "../interfaces/SocketMessageInterface";
import { CardChatInterface } from "../interfaces/CardChatInterface";
import api from "../Utils/Api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Notification from "../assets/sounds/Notification.mp3";
import { DecodedToken } from "../interfaces/DecodeTokenHomeInterface";

export function Home() {
  const [Chat, SetChat] = useState<boolean>(false);
  const [messages, setMessages] = useState<CardChatInterface[]>([]);
  const [currentChatMessages, setCurrentChatMessages] = useState<
    CardChatInterface[]
  >([]);
  const [ChatPageProps, setChatPageProps] = useState<ChatSelect>(
    {} as ChatSelect
  );

  const clientRef = useRef<Client | null>(null);
  const messageProcessingRef = useRef(false);
  // Keep track of message IDs we've already processed
  const processedMessageIds = useRef(new Set());
  const notificationAudioRef = useRef(new Audio(Notification));
  const [currentUserId, setCurrentUserId] = useState("");

  // Connect to main WebSocket once on component mount
  useEffect(() => {
    // Create a single WebSocket connection for all chats
    const socket = new WebSocket("ws://localhost:8080/chat");

    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("Connected to chat WebSocket");

        // We'll subscribe to specific topics when a chat is selected
        clientRef.current = client;
      },
      onStompError: (frame) => {
        console.error("STOMP Error:", frame.headers["message"]);
        console.error("Details:", frame.body);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.activate();

    // Cleanup on unmount
    return () => {
      if (client && client.active) {
        client.deactivate();
      }
    };
  }, []);

  // Subscribe to chat topic when chat ID changes
  useEffect(() => {
    const chatId = ChatPageProps.idChat;
    if (!chatId || !clientRef.current || !clientRef.current.active) return;

    console.log(`Subscribing to chat: ${chatId}`);

    // Subscribe to this chat's messages
    const subscription = clientRef.current.subscribe(
      `/topic/chat/${chatId}`,
      (message) => {
        if (messageProcessingRef.current) return;

        messageProcessingRef.current = true;
        try {
          const socketMessage = JSON.parse(message.body) as SocketMessage;

          // Create a unique message ID for deduplication
          const messageId = `${socketMessage.senderId}-${socketMessage.time}-${socketMessage.message}`;

          // Skip if we've already processed this message
          if (processedMessageIds.current.has(messageId)) {
            console.log("Skipping duplicate message:", messageId);
            return;
          }

          // Mark this message as processed
          processedMessageIds.current.add(messageId);

          const cardChatMessage: CardChatInterface = {
            chatId: socketMessage.chatId,
            message: socketMessage.message,
            picture: socketMessage.picture,
            senderId: socketMessage.senderId,
            time: socketMessage.time,
          };

          console.log(currentUserId);

          if (socketMessage.senderId !== currentUserId && Chat) {
            console.log("notification");
            notificationAudioRef.current
              .play()
              .catch((err) =>
                console.error("Error playing notification sound:", err)
              );
          }

          // Update both global and current chat messages
          setMessages((prev) => [...prev, cardChatMessage]);
          setCurrentChatMessages((prev) => [...prev, cardChatMessage]);
        } catch (error) {
          console.error("Error processing message:", error);
        } finally {
          messageProcessingRef.current = false;
        }
      }
    );

    // Initial connection
    if (clientRef.current && clientRef.current.active) {
      clientRef.current.publish({
        destination: `/app/chat/${chatId}`,
      });
    }

    // Cleanup subscription when chat changes
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [ChatPageProps.idChat]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setCurrentUserId(decoded?.id_user);
    }
  }, []);

  const sendMessageToSocket = useCallback((message: SocketMessage) => {
    const idChat = message.chatId;

    if (!clientRef.current || !clientRef.current.active) {
      console.error("WebSocket not connected");
      return;
    }

    // Create a unique message ID
    const messageId = `${message.senderId}-${message.time}-${message.message}`;

    // Add to processed set so we don't duplicate when it comes back from WebSocket
    processedMessageIds.current.add(messageId);

    // Add message immediately to the UI for the sender
    const cardChatMessage: CardChatInterface = {
      chatId: message.chatId,
      message: message.message,
      picture: message.picture,
      senderId: message.senderId,
      time: message.time,
    };

    setCurrentChatMessages((prev) => [...prev, cardChatMessage]);
    setMessages((prev) => [...prev, cardChatMessage]);

    // Send via WebSocket for the receiver
    clientRef.current.publish({
      destination: `/app/chat/${idChat}`,
      body: JSON.stringify(message),
    });
  }, []);

  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      // Clear current chat messages before loading new ones
      setCurrentChatMessages([]);

      // Also clear the processed message set when changing chats
      processedMessageIds.current.clear();

      const response = await api.get(`/chats/GetMessages?chatId=${chatId}`);
      const dbMessages = response.data;

      if (Array.isArray(dbMessages)) {
        console.log(`Loaded ${dbMessages.length} messages for chat ${chatId}`);

        // Mark loaded messages as processed
        dbMessages.forEach((msg) => {
          const messageId = `${msg.senderId}-${msg.time}-${msg.message}`;
          processedMessageIds.current.add(messageId);
        });

        setCurrentChatMessages(dbMessages);
      } else {
        console.error("Invalid message data format:", dbMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const handleChatSelect = useCallback(
    (chat: ChatSelect) => {
      console.log("Selected chat:", chat);
      setChatPageProps(chat);
      fetchMessages(chat.idChat);
      SetChat(true);
    },
    [fetchMessages]
  );

  return (
    <main className="h-screen lg:flex">
      <ListChat
        setChat={SetChat}
        isChatOpen={Chat}
        setOnChatSelect={handleChatSelect}
        messages={messages}
        connectToSocket={() => {}}
      />

      {Chat && (
        <ChatPage
          setChat={SetChat}
          isChatOpen={Chat}
          name={ChatPageProps.name}
          picture={ChatPageProps.picture}
          chatId={ChatPageProps.idChat}
          sendMessage={sendMessageToSocket}
          messages={currentChatMessages}
        />
      )}
    </main>
  );
}
