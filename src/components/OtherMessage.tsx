import { CardChatInterface } from "../interfaces/CardChatInterface";

export function OtherMessage({ msg }: { msg: CardChatInterface }) {
  return (
    <div className="flex w-full gap-5 pt-5 pb-5 items-center">
      <figure className="w-15 h-15 ">
        <img
          className="w-full h-full rounded-full"
          src={`${msg.picture}?t=${new Date().getTime()}`}
          alt={`${msg.picture} avatar`}
        />
      </figure>
      <div>
        <div className="border-2 border-purple-200 rounded-xl p-3 ">
          <p className="text-wrap w-auto text-md text-purple-600  max-w-[70vw] overflow-x-hidden break-words lg:max-w-[30vw] ">
            {msg.message}
          </p>
        </div>
        <p>{msg.time}</p>
      </div>
    </div>
  );
}
