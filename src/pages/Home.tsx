import { CiPaperplane } from "react-icons/ci";
// import { useState } from "react";
import { IoMdPersonAdd } from "react-icons/io";
import { ListCardMessage } from "../components/ListCardMessage";
import { OtherMessage } from "../components/OtherMessage";
import { OwnMessage } from "../components/OwnMessage";

export function Home() {
  // const [message, setMessage] = useState("");

  return (
    <main className="flex p-10 gap-5 h-screen">
      {/* List of chats */}
      <div className="w-md flex flex-col gap-5 overflow-auto bg-white p-5 border-2 border-gray-400 rounded-2xl">
        <h1 className="font-serif text-3xl">Messages</h1>
        <div className="flex gap-3 items-center">
          {/* Search Bar */}
          <div className=" bg-white w-full  p-2  border border-gray-400 rounded-xl ">
            <input
              className="w-full focus:border-none focus:outline-none"
              type="text"
              placeholder="Search..."
            />
          </div>
          <IoMdPersonAdd className="text-5xl cursor-pointer" />
        </div>
        <ListCardMessage />
        <ListCardMessage />
        <ListCardMessage />
        <ListCardMessage />
      </div>
      {/* Chat  */}
      <div className="w-full bg-white p-5 border-2 border-gray-400 rounded-2xl">
        {/* Header chat */}
        <div className="flex gap-3 items-center h-20 border-b-1 border-gray-400 p-2 ">
          <figure className="w-17 h-17">
            <img
              className="w-full h-full rounded-full"
              src="https://i.pinimg.com/736x/b5/98/fe/b598fe7bd4ad22d13066f7d4221beb97.jpg"
              alt=""
            />
          </figure>
          <h2>Carlos Salas</h2>
        </div>
        {/* Content Chat */}
        <div className="bg-white h-110 overflow-auto ">
          <OtherMessage />
          <OwnMessage />
        </div>
        {/* Input message */}
        <div className="bg-white w-full border-2  flex rounded-xl border-purple-300 p-1">
          <input
            className="w-full focus:border-none focus:outline-none p-2"
            type="text"
            placeholder="Type a message..."
          />
          <div className="bg-purple-500 rounded-xl p-0.5">
            <CiPaperplane className="text-4xl cursor-pointer text-white" />
          </div>
        </div>
      </div>
    </main>
  );
}
