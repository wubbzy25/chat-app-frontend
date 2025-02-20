export function OwnMessage() {
  return (
    <div className="flex w-full gap-5 pt-5 pb-5 items-center justify-end">
      <div className="flex flex-col items-end">
        <div className="bg-purple-600 rounded-xl p-3 ">
          <p className="text-wrap w-80 text-md text-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae
            esse, dolore debitis officiis,
          </p>
        </div>
        <p>8:00 PM</p>
      </div>
      <figure className="w-15 h-15">
        <img
          className="w-full h-full rounded-full"
          src="https://i.pinimg.com/474x/5a/29/9e/5a299e4d3df7af991eae3bd9504bb63e.jpg"
          alt=""
        />
      </figure>
    </div>
  );
}
