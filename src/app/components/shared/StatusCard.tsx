// StatusCard.tsx
import React from "react";

interface StatusCardProps {
  title: string;
  openCount: number;
  closeCount: number;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  openCount,
  closeCount,
}) => {
  return (
    <div className="w-full lg:w-[28%] bg-white p-4 rounded-lg  shadow-2xl shadow-[0_0_20px_rgba(0,0,0,0.12)]">
      <div className="mb-1">
        <h4 className="font-bold text-black text-center">{title}</h4>
      </div>
      {/* <div className="my-2 h-0.5 w-full bg-gray-500" /> */}
      <div className="flex divide-x divide-black-900">
        <div className="w-1/2 pr-4 flex flex-col items-center justify-center">
          <p className="text-green-500 font-bold">Open</p>
          <p className=" font-bold">{openCount}</p>
        </div>
        {/* <div className="inline-block h-[50px] min-h-[2em] w-1 self-stretch bg-gray-500"></div> */}
        <div className="w-1/2 pl-4 flex flex-col items-center justify-center">
          <p className="text-red-600 font-bold">Close</p>
          <p className=" font-bold">{closeCount}</p>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
