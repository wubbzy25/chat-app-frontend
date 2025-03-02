import { OtherMessage } from "../components/OtherMessage";
import { OwnMessage } from "../components/OwnMessage";
import { CiPaperplane } from "react-icons/ci";
import { FaArrowLeft } from "react-icons/fa6";
import { useEffect, useState, useRef, useCallback, memo } from "react";
import { ChatPageInterface } from "../interfaces/ChatPageInterface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../interfaces/DecodeTokenHomeInterface";
import { SocketMessage } from "../interfaces/SocketMessageInterface";
import api from "../Utils/Api";

interface userInfo {
  idUser: string;
  name: string;
  email: string;
  picture: string;
}

// Memoized message components to prevent re-rendering when parent re-renders
const MemoizedOwnMessage = memo(OwnMessage);
const MemoizedOtherMessage = memo(OtherMessage);

export function ChatPage({
  setChat,
  isChatOpen,
  name,
  picture,
  chatId,
  sendMessage,
  messages,
}: ChatPageInterface) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const [message, setMessage] = useState("");
  const [senderId, setSenderId] = useState("");
  const [userInfos, setUserInfos] = useState<userInfo>({} as userInfo);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userInfoFetched = useRef(false);

  // Cache-busting key for the image
  const imageKey = useRef(`${picture}?t=${new Date().getTime()}`);

  // Update image key when picture prop changes
  useEffect(() => {
    imageKey.current = `${picture}?t=${new Date().getTime()}`;
  }, [picture]);

  const fetchDataUserInformation = useCallback(async (userId: string) => {
    try {
      const response = await api.get(
        `/chats/GetUserInformation?idUser=${userId}`
      );
      setUserInfos(response.data);
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  }, []);

  // Fetch user information only once when component mounts
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      const idUser = decoded?.id_user;
      setSenderId(idUser);

      if (!userInfoFetched.current) {
        userInfoFetched.current = true;
        fetchDataUserInformation(idUser);
      }
    }
  }, [fetchDataUserInformation]);

  const handleSendMessage = useCallback(() => {
    if (message.trim() === "" || !userInfos.picture || !senderId) return;

    const newSocketMessage: SocketMessage = {
      chatId: chatId,
      message: message,
      senderId: senderId,
      picture: userInfos.picture,
      time: new Date().toLocaleTimeString([], timeOptions),
    };

    sendMessage(newSocketMessage);
    setMessage("");
  }, [message, userInfos.picture, senderId, chatId, sendMessage, timeOptions]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleBackListChat = useCallback(() => {
    setChat(false);
  }, [setChat]);

  return (
    <>
      {/* Chat  */}
      <div
        className={`flex flex-col h-dvh px-2  w-full ${isChatOpen} ? "hidden": "" lg:grow lg:w-0 lg:px-5`}
      >
        {/* Header chat */}
        <header className="flex gap-3 items-center h-20 border-b-1 border-gray-400 p-2">
          <FaArrowLeft
            className="text-3xl lg:hidden"
            onClick={handleBackListChat}
          />
          <figure className="w-15 h-15">
            <img
              src={imageKey.current}
              className="w-full h-full rounded-full"
              alt={`${name} avatar`}
            />
          </figure>
          <h2 className="text-3xl">{name}</h2>
        </header>

        {/* Content Chat */}
        <div className="grow bg-white overflow-y-auto lg:px-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full">
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, index) =>
              msg.senderId === senderId ? (
                <MemoizedOwnMessage
                  key={`${msg.senderId}-${index}-${msg.time}`}
                  msg={msg}
                />
              ) : (
                <MemoizedOtherMessage
                  key={`${msg.senderId}-${index}-${msg.time}`}
                  msg={msg}
                />
              )
            )
          ) : (
            <div className="text-center text-gray-500 mt-10">
              No messages yet. Start a conversation!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input message */}
        <div className="bg-white w-full border-2 flex rounded-xl mb-3 border-purple-300 lg:mb-1">
          <input
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full focus:border-none focus:outline-none p-2"
            type="text"
            placeholder="Type a message..."
            value={message}
          />
          <div
            className="bg-purple-500 rounded-xl p-0.5"
            onClick={handleSendMessage}
          >
            <CiPaperplane className="text-4xl cursor-pointer text-white" />
          </div>
        </div>
      </div>
    </>
  );
}
