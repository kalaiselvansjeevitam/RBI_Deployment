// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from '@/app/components/ui/hover-card';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

import { EllipsisVertical } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

interface CardContainerProps {
  className?: string;
  shadowColor?: string;
  day?: string;
  dayColor?: string;
  title?: string;
  value?: number;
  bg?: string;
  textColor?: string;
  navigateTo?: string;
  hoverData?: string;
  underline?: boolean;
  viewText?: boolean;
}

const DashboardCardContainer: React.FC<CardContainerProps> = ({
  className = "",
  shadowColor = "#E9EAEB",
  // day,
  // dayColor,
  title,
  value,
  bg = "white",
  textColor = "gray-700",
  navigateTo,
  hoverData,
  underline = false,
  viewText = false,
}) => {
  const navigate = useNavigate();
  return (
    <>
      <HoverCard>
        <HoverCardTrigger asChild>
          <div
            // href={navigateTo}
            style={{
              filter: `drop-shadow(10px 10px 4px ${shadowColor})`,
              backgroundColor: bg,
            }}
            onClick={navigateTo ? () => navigate(navigateTo) : undefined}
            className={`rounded-[20px] border border-[rgba(1,1,1,0.3)] p-5 ${className} flex flex-col justify-between ${navigateTo && "cursor-pointer"}`}
          >
            <div>
              <div className="flex items-center  justify-between">
                {/* <p className={`text-sm font-bold text-end ${dayColor}`}>
                    {day} <span className="font-medium text-[#A3AED0]"></span>
                  </p> */}
                <h3
                  style={{ color: textColor }}
                  className={`font-medium text-lg  ${underline && "underline"}`}
                >
                  {title}
                </h3>

                {/* <h3
                    style={{ color: textColor }}
                    className="font-medium text-lg "
                  >
                    {title}
                  </h3> */}
              </div>
              <p style={{ color: textColor }} className="font-medium text-2xl">
                {value}
              </p>
            </div>
            <HoverCard>
              <div>
                <p className="text-xs font-bold flex justify-end ">
                  {viewText ? (
                    <p
                      style={{ color: textColor }}
                      className={` underline cursor-pointer `}
                    >
                      View
                    </p>
                  ) : (
                    <HoverCardTrigger asChild>
                      <EllipsisVertical
                        style={{ color: textColor }}
                        className="w-4 h-4 cursor-pointer text-skyBlue"
                      />
                    </HoverCardTrigger>
                  )}
                </p>
              </div>
              {navigateTo && (
                <HoverCardContent
                  onClick={navigateTo ? () => navigate(navigateTo) : undefined}
                  className="w-auto rounded-[10px] p-3"
                  side="top"
                >
                  View More
                </HoverCardContent>
              )}
            </HoverCard>
          </div>
        </HoverCardTrigger>
        {hoverData && (
          <HoverCardContent className="w-auto rounded-[20px]" side="top">
            <p className={`font-medium text-lg `}>{hoverData}</p>
          </HoverCardContent>
        )}
      </HoverCard>
    </>
  );
};
export default DashboardCardContainer;
