export function OtherMessage() {
  return (
    <div className="flex w-full gap-5 pt-5 pb-5 items-center">
      <figure className="w-15 h-15 ">
        <img
          className="w-full h-full rounded-full"
          src="https://i.pinimg.com/736x/43/85/e5/4385e5dab8c1b025c372b2bae82c73bb.jpg"
          alt=""
        />
      </figure>
      <div>
        <div className="border-2 border-purple-200 rounded-xl p-3 ">
          <p className="text-wrap w-80 text-md text-purple-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Esse
          </p>
        </div>
        <p>8:00 PM</p>
      </div>
    </div>
  );
}
