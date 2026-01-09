import Layout from "../../../../app/components/Layout/Layout";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useParams } from "react-router-dom";
import {
  useGetTestimoniesByWorkshop,
  useApproveTestimony,
} from "../../../../app/core/api/Admin";
import type { Testimony } from "../../../../app/lib/types";


const TestimonyByWorkshop = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const [loader, setLoader] = useState(false);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);

  const { mutateAsync: getTestimonies } = useGetTestimoniesByWorkshop();
  const { mutateAsync: approveTestimony } = useApproveTestimony();

  // Fetch testimonies
  const fetchTestimonies = async () => {
    if (!workshopId) return;

    try {
      setLoader(true);
      const res = await getTestimonies({workshop_id : workshopId.toString()});
      setTestimonies(res?.data ?? []);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to fetch testimonies", "error");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, [workshopId]);

  // Approve
  const handleApprove = async (id: string) => {
  try {
    await approveTestimony({
      testimony_id: Number(id), // convert to number
      approve_status: "Approved",
      rejected_reason: ""
    });
    Swal.fire("Success", "Testimony approved", "success");
    fetchTestimonies();
  } catch (error) {
    Swal.fire("Error", "Failed to update status", "error");
  }
};


const handleReject = async (id: string) => {
  // Ask the admin for a reason
  const { value: reason } = await Swal.fire({
    title: "Reject Testimony",
    input: "text",
    inputLabel: "Reason for rejection",
    inputPlaceholder: "Enter reason",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return "You must enter a reason!";
    },
  });

  if (!reason) return; // cancelled or empty

  try {
    setLoader(true);
    await approveTestimony({
      testimony_id: Number(id),
      approve_status: "Rejected",
      rejected_reason: reason,
    });
    Swal.fire("Success", "Testimony rejected", "success");
    fetchTestimonies(); // refresh
  } catch (error: any) {
    Swal.fire("Error", error?.message ?? "Reject failed", "error");
  } finally {
    setLoader(false);
  }
};


  return (
    <Layout headerTitle="Testimonies By Workshop">
      <div className="px-4 py-3">
        {loader ? (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : testimonies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-700">
              No testimonies found
            </h1>
            <p className="text-gray-600 text-sm">
              Once testimonies are submitted, they will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full border border-gray-300 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Media</th>
                <th className="p-2 border">Note</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testimonies.map((t) => (
                <tr key={t.testimony_id}>
                  <td className="p-2 border">
                    {t.media_type === "image" && (
                      <img
                        src={t.filepath}
                        alt="testimony"
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                    {t.media_type === "video" && (
                      <video
                        src={t.filepath}
                        controls
                        className="w-36 h-24 rounded"
                      />
                    )}
                  </td>
                  <td className="p-2 border">{t.testimony_note}</td>
                  <td className="p-2 border">{t.is_approved}</td>
                  <td className="p-2 border">{t.created_at}</td>
                  <td className="p-2 border flex gap-2">
                    {t.is_approved !== "Approved" && (
                      <button
                        onClick={() => handleApprove(t.testimony_id)}
                        className="bg-green-600 text-white px-2 py-1 rounded-md text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {t.is_approved !== "Rejected" && (
                      <button
                        onClick={() => handleReject(t.testimony_id )}
                        className="bg-red-600 text-white px-2 py-1 rounded-md text-sm"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
};

export default TestimonyByWorkshop;
