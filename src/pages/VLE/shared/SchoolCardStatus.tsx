interface SchoolCardProps {
  title: string;
  total: number;
  male?: number;
  female?: number;
  from?: string;
  to?: string;
}

const SchoolCardStatus: React.FC<SchoolCardProps> = ({
  title,
  total,
  male,
  female,
  from = "from-sky-300",
  to = "to-blue-400",
}) => {
  const hasSplit = male !== undefined || female !== undefined;

  return (
    <div
      className={`flex-1 min-w-[280px] h-[180px] rounded-2xl p-4
      bg-gradient-to-br ${from} ${to}
      shadow-xl border border-white/20
      text-white
      flex flex-col ${hasSplit ? "gap-3" : "gap-2 justify-center"}`}
    >
      {/* Title */}
      <h4 className="text-center text-sm font-semibold uppercase tracking-wide opacity-90">
        {title}
      </h4>

      {/* Total */}
      <p className="text-center text-4xl font-extrabold">{total}</p>

      {/* Male / Female */}
      {hasSplit && (
        <div className="flex gap-3 mt-1">
          <div className="flex-1 rounded-xl bg-white/20 p-2 text-center backdrop-blur-sm">
            <p className="text-xs font-semibold opacity-90">Male</p>
            <p className="text-lg font-bold">{male ?? 0}</p>
          </div>

          <div className="flex-1 rounded-xl bg-white/20 p-2 text-center backdrop-blur-sm">
            <p className="text-xs font-semibold opacity-90">Female</p>
            <p className="text-lg font-bold">{female ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolCardStatus;
