export function ListCardMessage() {
  return (
    <div className="w-full flex items-start gap-3 border-b border-gray-200 p-2 mt-0 cursor-pointer hover:shadow-lg rounded-2xl hover:scale-110 ">
      <figure className="w-17 h-17 ">
        <img
          className="w-full h-full rounded-full"
          src="https://i.pinimg.com/736x/b5/98/fe/b598fe7bd4ad22d13066f7d4221beb97.jpg"
          alt=""
        />
      </figure>
      <div className="flex flex-col gap-2 overflow-x-hidden">
        <h2 className="text-2xl">Carlos Salas</h2>
        <p className="text-md text-nowrap">Lorem ipsum</p>
      </div>
    </div>
  );
}
