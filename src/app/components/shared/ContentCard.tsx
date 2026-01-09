import React from "react";

const ContentCard = ({
  children,
  className,
  bg,
}: {
  children?: React.ReactNode;
  className?: string;
  bg?: string;
}) => {
  return (
    <div
      style={{
        filter: "drop-shadow(10px 10px 4px #E9EAEB)",
        backgroundColor: bg || "white",
      }}
      className={`w-full rounded-[10px] border border-borderGray p-5 ${className} mb-7`}
    >
      {children}
    </div>
  );
};

export default ContentCard;
