import { ListCardMessageProps } from "../interfaces/ListCardMessagePropsInterface";
export function ListCardMessage({ msg, onClick }: ListCardMessageProps) {
  return (
    <div
      onClick={onClick}
      className="w-full flex items-start gap-3 border-b border-gray-200 p-2 mt-0 cursor-pointer hover:shadow-lg rounded-2xl hover:scale-100 "
    >
      <figure className="w-17 h-17 shrink-0 ">
        <img
          className="w-full h-full rounded-full"
          src={`${msg.picture}?t=${new Date().getTime()}`}
          alt={`${msg.name} avatar`}
        />
      </figure>
      <div className="flex flex-col gap-2 overflow-hidden">
        <h2 className="text-2xl">{msg.name}</h2>
        <p className="text-md w-full truncate ">{msg.lastMessage}</p>
      </div>
    </div>
  );
}
