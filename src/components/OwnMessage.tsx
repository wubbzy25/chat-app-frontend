import { CardChatInterface } from "../interfaces/CardChatInterface";
export function OwnMessage({ msg }: { msg: CardChatInterface }) {
  console.log(msg.picture);
  return (
    <div className="flex w-full gap-5 pt-5 pb-5 items-center justify-end">
      <div className="flex flex-col items-end">
        <div className="bg-purple-600 rounded-xl p-3 ">
          <p className="text-wrap w-80 text-md text-white">{msg.message}</p>
        </div>
        <p>{msg.time}</p>
      </div>
      <figure className="w-15 h-15">
        <img
          className="w-full h-full rounded-full"
          src={`${msg.picture}?t=${new Date().getTime()}`}
          alt={`${msg.picture} avatar`}
        />
      </figure>
    </div>
  );
}
