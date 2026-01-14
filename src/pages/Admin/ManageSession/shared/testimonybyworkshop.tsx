import Layout from "../../../../app/components/Layout/Layout";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetTestimoniesByWorkshop,
  useApproveTestimony,
} from "../../../../app/core/api/Admin";
import type { Testimony } from "../../../../app/lib/types";

/* ---------------- STATUS DROPDOWN ---------------- */
const StatusDropdown = ({
  status,
  onApprove,
  onReject,
}: {
  status: string;
  onApprove: () => void;
  onReject: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const statusStyle =
    status === "Approved"
      ? "bg-green-600"
      : status === "Rejected"
        ? "bg-red-600"
        : "bg-yellow-500";

  return (
    <div className="relative z-50" onClick={(e) => e.stopPropagation()}>
      {/* Label */}
      <div className="text-[10px] text-gray-500 mb-1 text-right">
        Update Status
      </div>

      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`${statusStyle} text-white px-3 py-1.5 text-xs rounded-md shadow-md hover:opacity-90`}
      >
        {status} ▾
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl">
          {status !== "Approved" && (
            <button
              onClick={() => {
                setOpen(false);
                onApprove();
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-green-50 text-green-700"
            >
              ✅ Approve
            </button>
          )}

          {status !== "Rejected" && (
            <button
              onClick={() => {
                setOpen(false);
                onReject();
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 text-red-700"
            >
              ❌ Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
const TestimonyByWorkshop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const workshopId = new URLSearchParams(location.search).get("workshop_id");

  const [loader, setLoader] = useState(false);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const { mutateAsync: getTestimonies } = useGetTestimoniesByWorkshop();
  const { mutateAsync: approveTestimony } = useApproveTestimony();

  const fetchTestimonies = async () => {
    if (!workshopId) return;
    try {
      setLoader(true);
      const res = await getTestimonies({ workshop_id: workshopId });
      setTestimonies(res?.data ?? []);
    } catch {
      Swal.fire("Error", "Failed to fetch testimonies", "error");
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, [workshopId]);

  const handleApprove = async (id: string) => {
    await approveTestimony({
      testimony_id: Number(id),
      approve_status: "Approved",
      rejected_reason: "",
    });
    fetchTestimonies();
  };

  const handleReject = async (id: string) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Testimony",
      input: "text",
      inputLabel: "Reason",
      showCancelButton: true,
      inputValidator: (v) => (!v ? "Reason required" : null),
    });

    if (!reason) return;

    await approveTestimony({
      testimony_id: Number(id),
      approve_status: "Rejected",
      rejected_reason: reason,
    });
    fetchTestimonies();
  };

  const images = testimonies.filter((t) => t.media_type === "image");
  const videos = testimonies.filter((t) => t.media_type === "video");

  return (
    <Layout headerTitle="Testimonies By Workshop">
      <div className="px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white"
        >
          ← Back
        </button>

        {loader && (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        )}

        {/* IMAGES */}
        {images.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Images</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {images.map((img) => (
                <div
                  key={img.testimony_id}
                  className="border rounded-xl shadow-xl overflow-visible min-h-[420px]"
                >
                  {/* IMAGE ONLY opens modal */}
                  <img
                    src={img.filepath}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalImage(img.filepath);
                    }}
                  />

                  <div className="p-5 flex flex-col justify-between h-[160px]">
                    <p className="text-sm text-gray-800 line-clamp-3">
                      {img.testimony_note}
                    </p>

                    <div className="flex justify-between items-end mt-4">
                      <span className="text-xs text-gray-500">
                        Current Status
                        <br />
                        <strong>{img.is_approved}</strong>
                      </span>

                      <StatusDropdown
                        status={img.is_approved}
                        onApprove={() => handleApprove(img.testimony_id)}
                        onReject={() => handleReject(img.testimony_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIDEOS */}
        {videos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Videos</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.testimony_id}
                  className="border rounded-xl shadow-xl min-h-[420px]"
                >
                  <video
                    src={vid.filepath}
                    controls
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5 flex flex-col justify-between h-[160px]">
                    <p className="text-sm text-gray-800 line-clamp-3">
                      {vid.testimony_note}
                    </p>

                    <div className="flex justify-between items-end mt-4">
                      <span className="text-xs text-gray-500">
                        Current Status
                        <br />
                        <strong>{vid.is_approved}</strong>
                      </span>

                      <StatusDropdown
                        status={vid.is_approved}
                        onApprove={() => handleApprove(vid.testimony_id)}
                        onReject={() => handleReject(vid.testimony_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMAGE MODAL */}
        {modalImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setModalImage(null)}
          >
            <img src={modalImage} className="max-h-[80vh] rounded-lg" />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestimonyByWorkshop;
