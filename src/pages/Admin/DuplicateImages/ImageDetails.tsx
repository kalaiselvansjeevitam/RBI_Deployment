import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../../app/components/Layout/Layout";
import {
  useGetDuplicateImageDetails,
  useGetupdateWorkshopStatusByAdmin,
} from "../../../app/core/api/Admin";
import type { DuplicateImageDetails } from "../../../app/lib/types";
import Swal from "sweetalert2";

export const ImageDetails = () => {
  const [searchParams] = useSearchParams();
  const hash_value = searchParams.get("hash_value");

  const { mutateAsync: getDetails, isPending } = useGetDuplicateImageDetails();
  const { mutateAsync: updateWorkshopStatus } =
    useGetupdateWorkshopStatusByAdmin();
  const [data, setData] = useState<DuplicateImageDetails[]>([]);
  const [loadingRowId, setLoadingRowId] = useState<number | null>(null);
  const navigate = useNavigate();
  const handleRejectWorkshop = async (workshopId: number) => {
    const { value: formValues } = await Swal.fire({
      title: "Reject Workshop",
      html: `
      <input id="swal-reason" class="swal2-input" placeholder="Enter reason" />
      <input id="swal-passkey" type="text" class="swal2-input" placeholder="Enter pass key" />
    `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const reason = (
          document.getElementById("swal-reason") as HTMLInputElement
        )?.value;

        const passKey = (
          document.getElementById("swal-passkey") as HTMLInputElement
        )?.value;

        if (!reason) {
          Swal.showValidationMessage("Reason is required");
          return;
        }

        if (!passKey) {
          Swal.showValidationMessage("Pass key is required");
          return;
        }

        return { reason, passKey };
      },
    });

    if (!formValues) return;

    setLoadingRowId(workshopId);

    try {
      const res = await updateWorkshopStatus({
        workshop_id: workshopId,
        workshop_status: "Rejected",
        rejected_reason: formValues.reason,
        pass_key: formValues.passKey,
        approval_count: "",
      });

      Swal.fire("Success", res?.message || "Workshop Rejected", "success");

      // 🔄 Refresh data
      const refreshed = await getDetails({ hash_value: hash_value! });
      setData(refreshed.data || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || "Rejection failed";

      Swal.fire("Error", message, "error");
    } finally {
      setLoadingRowId(null); // ✅ stop loading
    }
  };

  useEffect(() => {
    if (!hash_value) return;

    const fetchDetails = async () => {
      try {
        const res = await getDetails({ hash_value });
        setData(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
  }, [hash_value]);

  if (isPending) {
    return (
      <Layout headerTitle="Image Details">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="Image Details">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.map((item) => (
            <div key={item.id} className="p-4 rounded-xl shadow-md bg-white">
              <img
                src={item.filepath}
                alt=""
                className="w-full h-40 object-cover rounded-lg"
              />

              {/* Content + Button */}
              <div className="mt-3 flex justify-between items-start">
                <div className="text-sm space-y-1">
                  <p>
                    Workshop ID:{" "}
                    <span className="font-semibold text-gray-800">
                      {item.workshop_id}
                    </span>
                  </p>

                  <p>
                    Date:{" "}
                    <span className="font-semibold text-gray-800">
                      {item.workshop_date}
                    </span>
                  </p>

                  <p>
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        item.work_shop_status === "Approved"
                          ? "text-green-600"
                          : item.work_shop_status === "Rejected"
                            ? "text-red-500"
                            : item.work_shop_status === "Rescheduled"
                              ? "text-yellow-500"
                              : "text-blue-500" // Pending default
                      }`}
                    >
                      {item.work_shop_status}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => handleRejectWorkshop(Number(item.workshop_id))}
                  disabled={loadingRowId === Number(item.workshop_id)}
                  className={`ml-2 px-3 py-1 text-sm rounded-lg transition flex items-center justify-center ${
                    loadingRowId === Number(item.workshop_id)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  {loadingRowId === Number(item.workshop_id) ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && !isPending && (
          <div className="text-center mt-10 text-gray-500">No data found</div>
        )}
      </div>
    </Layout>
  );
};
