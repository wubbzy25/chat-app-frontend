import { IoMdPersonAdd } from "react-icons/io";
import { ListCardMessage } from "../components/ListCardMessage";
import api from "../Utils/Api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { ListCardInterface } from "../interfaces/ListCardnterface";
import { DecodedToken } from "../interfaces/DecodeTokenHomeInterface";
import SearchModal from "../components/SearchModal";
import { ChatSelect } from "../interfaces/ChatSelectInterface";

interface ListCardProps {
  chats: chat[];
  setOnChatSelect: (chat: ChatSelect) => void;
}

interface chat {
  idChat: string;
  participants: string[];
  messages: [];
}

export function ListChat({
  setChat,
  setOnChatSelect,
}: {
  setChat: (value: boolean) => void;
  setOnChatSelect: (chat: ChatSelect) => void;
}) {
  const [Chats, setChats] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userInfos, setUserInfos] = useState<{
    [key: string]: ListCardInterface;
  }>({});

  const fetchedUserIds = useRef<Set<string>>(new Set());

  const handleClick = (name: string, picture: string, idChat: string) => {
    const chat = { name, picture, idChat };

    setOnChatSelect(chat);
    setChat(true);
  };

  const handleClickSearchModal = () => {
    setIsOpen(true);
  };

  const fetchData = async (idUser: string) => {
    try {
      const response = await api.get(`/chats/GetChats?idUser=${idUser}`);
      const chats = response.data;
      setChats(chats);
      chats.forEach((chat: chat) => {
        chat.participants.forEach((participantId) => {
          if (!fetchedUserIds.current.has(participantId)) {
            fetchedUserIds.current.add(participantId);
            fetchDataUserInformation(participantId);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchDataUserInformation = async (idUser: string) => {
    try {
      const response = await api.get(
        `/chats/GetUserInformation?idUser=${idUser}`
      );
      setUserInfos((prev) => ({ ...prev, [idUser]: response.data }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      const idUser = decoded?.id_user;
      fetchData(idUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    const token = Cookies.get("token");
    if (token) {
      Cookies.remove("token");
      window.location.reload();
    }
  };

  const ListCard: React.FC<ListCardProps> = ({ chats }) => {
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
          const { name, lastMessage, picture } = userInfo;
          const messageProps = { name, lastMessage, picture };
          return (
            <ListCardMessage
              key={chat.idChat}
              msg={messageProps}
              onClick={() => handleClick(name, picture, chat.idChat)}
            />
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* List of chats */}
      <div className="w-md flex flex-col gap-5 overflow-auto bg-white p-5 border-2 border-gray-400 rounded-2xl">
        <div className="flex justify-between items-center">
          <h1 className="font-serif text-3xl">Messages</h1>
          <button
            onClick={handleLogout}
            className="text-2xl shadow-lg p-3 rounded-3xl cursor-pointer hover:scale-110"
          >
            Logout
          </button>
        </div>
        <div className="flex gap-3 items-center">
          {/* Search Bar */}
          <div className=" bg-white w-full  p-2  border border-gray-400 rounded-xl ">
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
        <ListCard chats={Chats} setOnChatSelect={setOnChatSelect} />
      </div>
    </>
  );
}
