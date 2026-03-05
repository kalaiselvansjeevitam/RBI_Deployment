import type { testimonyAlert, WorkshopAlert } from "../../../../app/lib/types";

interface AlertCardProps {
  title: string;
  alerts: (WorkshopAlert | testimonyAlert)[];
}

/* ---------- TYPE GUARDS ---------- */
const isWorkshopAlert = (
  alert: WorkshopAlert | testimonyAlert,
): alert is WorkshopAlert => {
  return "work_shop_status" in alert;
};

const isTestimonyAlert = (
  alert: WorkshopAlert | testimonyAlert,
): alert is testimonyAlert => {
  return "media_type" in alert;
};

const AlertCard = ({ title, alerts }: AlertCardProps) => {
  if (!alerts.length) return null;

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      {/* ---------- SCROLLABLE AREA ---------- */}
      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="border rounded-lg p-3 text-sm space-y-1"
          >
            {/* ---------- COMMON ---------- */}
            <p>
              <span className="font-semibold">Workshop ID:</span> {alert.id}
            </p>

            <p>
              <span className="font-semibold">Date & Time:</span> {alert.date} |{" "}
              {alert.from_time} – {alert.to_time}
            </p>

            {/* ---------- WORKSHOP ALERT ---------- */}
            {isWorkshopAlert(alert) && (
              <>
                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`${
                      alert.work_shop_status === "approved"
                        ? "text-green-600"
                        : alert.work_shop_status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {alert.work_shop_status}
                  </span>
                </p>

                {alert.rejected_reason && (
                  <p className="text-red-600">
                    <span className="font-semibold">Rejected Reason:</span>{" "}
                    {alert.rejected_reason}
                  </p>
                )}
              </>
            )}

            {/* ---------- TESTIMONY ALERT ---------- */}
            {isTestimonyAlert(alert) && (
              <>
                <p>
                  <span className="font-semibold">Media Type:</span>{" "}
                  {alert.media_type}
                </p>

                <p>
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`${
                      alert.is_approved === "approved"
                        ? "text-green-600"
                        : alert.is_approved === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {alert.is_approved}
                  </span>
                </p>

                {alert.rejected_reason && (
                  <p className="text-red-600">
                    <span className="font-semibold">Rejected Reason:</span>{" "}
                    {alert.rejected_reason}
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertCard;
