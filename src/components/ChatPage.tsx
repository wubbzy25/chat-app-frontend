import { OtherMessage } from "../components/OtherMessage";
import { OwnMessage } from "../components/OwnMessage";
import { CiPaperplane } from "react-icons/ci";
import { useEffect, useState } from "react";
import { ChatPageInterface } from "../interfaces/ChatPageInterface";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../interfaces/DecodeTokenHomeInterface";
import { SocketMessage } from "../interfaces/SocketMessageInterface";
import api from "../Utils/Api";
// import { ChatPageInterface } from "../interfaces/ChatPageInterface";

interface userInfo {
  idUser: string;
  name: string;
  email: string;
  picture: string;
}
export function ChatPage({
  name,
  picture,
  chatId,
  sendMessage,
  messages,
  setMessages,
}: ChatPageInterface) {
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const [message, setMessage] = useState("");
  const [SenderId, setSenderId] = useState("");
  const [userInfos, setUserInfos] = useState<userInfo>({} as userInfo);

  const fetchDataUserInformation = async (userId: string) => {
    try {
      const response = await api.get(
        `/chats/GetUserInformation?idUser=${userId}`
      );
      const user = response.data;
      console.log(response.data);
      setUserInfos(user);
    } catch (error) {
      console.error("Error fetching user information:", error);
    }
  };

  const handleSendMessage = () => {
    const token = Cookies.get("token");
    if (token) {
      const idUser = jwtDecode<DecodedToken>(token)?.id_user;
      setSenderId(idUser);

      if (message.trim() === "" || !userInfos.picture) return;

      const newSocketMessage: SocketMessage = {
        chatId: chatId,
        message: message,
        senderId: idUser,
        picture: userInfos.picture,
        time: new Date().toLocaleTimeString([], timeOptions),
      };
      sendMessage(newSocketMessage);
      setMessage("");
    }
  };
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      const idUser = decoded?.id_user;
      console.log(idUser);
      if (idUser === SenderId) {
        fetchDataUserInformation(idUser);
      }
    }
  }, [SenderId, messages]);

  useEffect(() => {
    if (userInfos.picture) {
      handleSendMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfos.picture]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat  */}
      <div className="w-full flex flex-col justify-between bg-white p-5 border-2 border-gray-400 rounded-2xl">
        <div>
          {/* Header chat */}
          <div className="flex gap-3 items-center h-20 border-b-1 border-gray-400 p-2 ">
            <figure className="w-17 h-17">
              <img
                src={`${picture}?t=${new Date().getTime()}`}
                className="w-full h-full rounded-full"
                alt={`${name} avatar`}
              />
            </figure>
            <h2>{name}</h2>
          </div>
          {/* Content Chat */}
          <div className="bg-white h-110 overflow-auto ">
            {messages.map((msg, index) =>
              msg.senderId === SenderId ? (
                <OwnMessage key={index} msg={msg} />
              ) : (
                <OtherMessage key={index} msg={msg} />
              )
            )}
          </div>
        </div>

        {/* Input message */}
        <div className="bg-white w-full border-2  flex rounded-xl border-purple-300 p-1">
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
