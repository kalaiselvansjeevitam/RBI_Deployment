interface SchoolCardProps {
  title: string;
  total: number;
  male?: number;
  female?: number;
}

const SchoolCardStatus: React.FC<SchoolCardProps> = ({
  title,
  total,
  male,
  female,
}) => {
  const hasSplit = male !== undefined || female !== undefined;

  return (
    <div
      className={`flex-1 min-w-[280px] h-[180px] rounded-2xl p-4
  bg-gradient-to-br from-white to-gray-50
  shadow-xl border border-gray-200
  flex flex-col ${hasSplit ? "gap-3" : "gap-2 justify-center"}`}
    >
      {/* Title */}
      <h4 className="text-center text-sm font-semibold uppercase tracking-wide text-gray-600">
        {title}
      </h4>

      {/* Total */}
      <p className="text-center text-4xl font-extrabold text-gray-800">
        {total}
      </p>

      {/* Male / Female */}
      {hasSplit && (
        <div className="flex gap-3 mt-1">
          <div className="flex-1 rounded-xl bg-gray-100 border border-gray-200 p-2 text-center">
            <p className="text-xs font-semibold text-gray-600">Male</p>
            <p className="text-lg font-bold text-gray-800">{male ?? 0}</p>
          </div>

          <div className="flex-1 rounded-xl bg-gray-100 border border-gray-200 p-2 text-center">
            <p className="text-xs font-semibold text-gray-600">Female</p>
            <p className="text-lg font-bold text-gray-800">{female ?? 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolCardStatus;
