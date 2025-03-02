import { IoMdPersonAdd } from "react-icons/io";
import { ListCardMessage } from "../components/ListCardMessage";
import api from "../Utils/Api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { ListCardInterface } from "../interfaces/ListCardnterface";
import { CardChatInterface } from "../interfaces/CardChatInterface";
import { DecodedToken } from "../interfaces/DecodeTokenHomeInterface";
import SearchModal from "../components/SearchModal";
import { ChatSelect } from "../interfaces/ChatSelectInterface";

interface ListCardProps {
  chats: chat[];
  userInfos: { [key: string]: ListCardInterface };
  lastMessages: { [key: string]: string };
  onChatSelect: (name: string, picture: string, idChat: string) => void;
}

interface chat {
  idChat: string;
  participants: string[];
  messages: [];
}

export function ListChat({
  isChatOpen,
  setChat,
  setOnChatSelect,
  messages,
  connectToSocket,
}: {
  isChatOpen: boolean;
  setChat: (value: boolean) => void;
  setOnChatSelect: (chat: ChatSelect) => void;
  messages: CardChatInterface[];
  connectToSocket: (value: string) => void;
}) {
  const [chats, setChats] = useState<chat[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userInfos, setUserInfos] = useState<{
    [key: string]: ListCardInterface;
  }>({});
  const [lastMessages, setLastMessages] = useState<{ [key: string]: string }>(
    {}
  );

  const fetchedUserIds = useRef<Set<string>>(new Set());
  const connectedChats = useRef<Set<string>>(new Set());
  const userId = useRef<string>("");

  const handleClick = useCallback(
    (name: string, picture: string, idChat: string) => {
      const chat = { name, picture, idChat };
      setOnChatSelect(chat);
      setChat(true);
    },
    [setOnChatSelect, setChat]
  );

  const handleClickSearchModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const fetchDataUserInformation = useCallback(async (idUser: string) => {
    if (fetchedUserIds.current.has(idUser)) return;

    try {
      fetchedUserIds.current.add(idUser);
      const response = await api.get(
        `/chats/GetUserInformation?idUser=${idUser}`
      );
      setUserInfos((prev) => ({ ...prev, [idUser]: response.data }));
    } catch (error) {
      console.log("Error fetching user information:", error);
    }
  }, []);

  const fetchLastMessage = useCallback(async (chatId: string) => {
    try {
      const response = await api.get(`/chats/GetLastMessage?chatId=${chatId}`);
      return response.data;
    } catch (error) {
      console.log("Error fetching last message:", error);
      return "";
    }
  }, []);

  const fetchData = useCallback(
    async (idUser: string) => {
      try {
        const response = await api.get(`/chats/GetChats?idUser=${idUser}`);
        const fetchedChats = response.data;

        setChats(fetchedChats);

        // Process each chat
        const userPromises: Promise<void>[] = [];
        const messagePromises: Promise<void>[] = [];

        fetchedChats.forEach((chat: chat) => {
          // Connect to socket only once per chat
          if (!connectedChats.current.has(chat.idChat)) {
            connectedChats.current.add(chat.idChat);
            connectToSocket(chat.idChat);
          }

          // Batch user info requests
          chat.participants.forEach((participantId) => {
            if (!fetchedUserIds.current.has(participantId)) {
              userPromises.push(fetchDataUserInformation(participantId));
            }
          });

          // Batch last message requests
          messagePromises.push(
            fetchLastMessage(chat.idChat).then((lastMessage) => {
              setLastMessages((prev) => ({
                ...prev,
                [chat.idChat]: lastMessage,
              }));
            })
          );
        });

        // Wait for all fetches to complete
        await Promise.all([...userPromises, ...messagePromises]);
      } catch (error) {
        console.log("Error fetching chats:", error);
      }
    },
    [connectToSocket, fetchDataUserInformation, fetchLastMessage]
  );

  // Extract userId from token only once
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      userId.current = decoded?.id_user;
      fetchData(userId.current);
    }
  }, [fetchData]);

  // Update last messages when new messages arrive - use memo to avoid excessive processing
  const processedMessages = useMemo(() => {
    const latestMessages: { [key: string]: string } = {};

    // Group messages by chatId and find the latest for each chat
    messages.forEach((message) => {
      latestMessages[message.chatId] = message.message;
    });

    return latestMessages;
  }, [messages]);

  // Only update state when processed messages change
  useEffect(() => {
    if (Object.keys(processedMessages).length > 0) {
      setLastMessages((prev) => ({ ...prev, ...processedMessages }));
    }
  }, [processedMessages]);

  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    window.location.reload();
  }, []);

  // Memoize ListCard component to prevent unnecessary re-renders
  const ListCard = useCallback(
    ({ chats, userInfos, lastMessages, onChatSelect }: ListCardProps) => {
      return (
        <div>
          {chats.map((chat: chat) => {
            const participantId =
              chat.participants.length > 0 ? chat.participants[0] : null;
            if (!participantId) {
              return null;
            }
            const userInfo = userInfos[participantId];
            if (!userInfo) {
              return null;
            }
            const { name, picture } = userInfo;
            const lastMessage = lastMessages[chat.idChat] || "";
            const messageProps = { name, lastMessage, picture };

            return (
              <ListCardMessage
                key={chat.idChat}
                msg={messageProps}
                onClick={() => onChatSelect(name, picture, chat.idChat)}
              />
            );
          })}
        </div>
      );
    },
    []
  );

  const memoizedListCard = useMemo(
    () => (
      <ListCard
        chats={chats}
        userInfos={userInfos}
        lastMessages={lastMessages}
        onChatSelect={handleClick}
      />
    ),
    [chats, userInfos, lastMessages, handleClick, ListCard]
  );

  return (
    <>
      {/* List of chats */}
      <div
        className={`w-full h-full flex flex-col gap-5 bg-white p-5 ${
          isChatOpen ? "hidden lg:block" : ""
        } lg:w-[30vw] border-r border-gray-300 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full`}
      >
        <div
          className={`flex justify-between items-center ${isChatOpen} ? "mb-6" : "" `}
        >
          <h1 className="font-serif text-3xl">Messages</h1>
          <button
            onClick={handleLogout}
            className="text-2xl shadow-lg p-3 rounded-3xl cursor-pointer hover:scale-110"
          >
            Logout
          </button>
        </div>
        <div className="flex gap-3 items-center ">
          {/* Search Bar */}
          <div className="bg-white w-full p-2 border border-gray-400 rounded-xl">
            <input
              className="w-full focus:border-none focus:outline-none"
              type="text"
              placeholder="Search..."
            />
          </div>
          <IoMdPersonAdd
            onClick={handleClickSearchModal}
            className="text-5xl cursor-pointer"
          />
          <SearchModal isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
        <div className="grow overflow-auto">{memoizedListCard}</div>
      </div>
    </>
  );
}
