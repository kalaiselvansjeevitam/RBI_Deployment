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
  loading,
  onApprove,
  onReject,
}: {
  status: string;
  loading: boolean;
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
      <div className="text-[10px] text-gray-500 mb-1 text-right">
        Update Status
      </div>

      <button
        disabled={loading}
        onClick={() => setOpen(!open)}
        className={`${statusStyle} text-white px-3 py-1.5 text-xs rounded-md shadow-md
          ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
      >
        {loading ? (
          <span className="flex items-center gap-1">
            <Loader className="w-3 h-3 animate-spin" />
            Updating
          </span>
        ) : (
          `${status} ▾`
        )}
      </button>

      {open && !loading && (
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
  const [statusLoadingId, setStatusLoadingId] = useState<number | null>(null);

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
    try {
      setStatusLoadingId(Number(id));
      await approveTestimony({
        testimony_id: Number(id),
        approve_status: "Approved",
        rejected_reason: "",
      });
      await fetchTestimonies();
      setStatusLoadingId(null);
    } catch {
      Swal.fire("Error", "Failed to approve testimony", "error");
      setStatusLoadingId(null);
    } finally {
      setStatusLoadingId(null);
    }
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

    try {
      setStatusLoadingId(Number(id));
      await approveTestimony({
        testimony_id: Number(id),
        approve_status: "Rejected",
        rejected_reason: reason,
      });
      await fetchTestimonies();
    } catch {
      Swal.fire("Error", "Failed to reject testimony", "error");
    } finally {
      setStatusLoadingId(null);
    }
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
        {/* IMAGES */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Images</h2>

          {images.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No images found</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {images.map((img) => (
                <div
                  key={img.testimony_id}
                  className="border rounded-xl shadow-xl min-w-[320px] overflow-visible"
                >
                  <img
                    src={img.filepath}
                    className="w-full h-64 object-cover cursor-pointer"
                    // onClick={(e) => {
                    //   e.stopPropagation();
                    //   setModalImage(img.filepath);
                    // }}
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
                        loading={statusLoadingId === Number(img.testimony_id)}
                        onApprove={() => handleApprove(img.testimony_id)}
                        onReject={() => handleReject(img.testimony_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIDEOS */}
        {/* VIDEOS */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Videos</h2>

          {videos.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No videos found</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {videos.map((vid) => (
                <div
                  key={vid.testimony_id}
                  className="border rounded-xl shadow-xl min-w-[320px]"
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
                        loading={statusLoadingId === Number(vid.testimony_id)}
                        onApprove={() => handleApprove(vid.testimony_id)}
                        onReject={() => handleReject(vid.testimony_id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
