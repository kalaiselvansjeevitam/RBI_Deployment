import Layout from "../../../../app/components/Layout/Layout";
import { Loader } from "lucide-react"; // Added ArrowLeft icon
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom"; // import useNavigate
import {
  useGetTestimoniesByWorkshop,
  useApproveTestimony,
} from "../../../../app/core/api/Admin";
import type { Testimony } from "../../../../app/lib/types";

const TestimonyByWorkshop = () => {
  const location = useLocation();
  const navigate = useNavigate(); // initialize navigate
  const searchParams = new URLSearchParams(location.search);
  const workshopId = searchParams.get("workshop_id");
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

  const handleApprove = async (id: string) => {
    try {
      await approveTestimony({
        testimony_id: Number(id),
        approve_status: "Approved",
        rejected_reason: "",
      });
      Swal.fire("Success", "Testimony approved", "success");
      fetchTestimonies();
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleReject = async (id: string) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Testimony",
      input: "text",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter reason",
      showCancelButton: true,
      inputValidator: (value) => (!value ? "You must enter a reason!" : null),
    });
    if (!reason) return;
    try {
      setLoader(true);
      await approveTestimony({
        testimony_id: Number(id),
        approve_status: "Rejected",
        rejected_reason: reason,
      });
      Swal.fire("Success", "Testimony rejected", "success");
      fetchTestimonies();
    } catch (error: any) {
      Swal.fire("Error", error?.message ?? "Reject failed", "error");
    } finally {
      setLoader(false);
    }
  };

  const images = testimonies.filter((t) => t.media_type === "image");
  const videos = testimonies.filter((t) => t.media_type === "video");

  return (
    <Layout headerTitle="Testimonies By Workshop">
      <div className="px-4 py-3">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          <div className="text-white-600 font-bold">← Back</div>
        </button>

        {loader && (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        )}

        {/* Images Section */}
        {images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {images.map((img) => (
                <div
                  key={img.testimony_id}
                  className="border rounded-lg overflow-hidden shadow-lg cursor-pointer"
                  onClick={() => setModalImage(img.filepath)}
                >
                  <img
                    src={img.filepath}
                    alt="testimony"
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-4 flex flex-col gap-2">
                    <p className="text-gray-800 text-sm">
                      {img.testimony_note}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{img.is_approved}</span>
                      <div className="flex gap-2">
                        {img.is_approved !== "Approved" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(img.testimony_id);
                            }}
                            className="bg-green-600 px-2 py-1 rounded text-white text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {img.is_approved !== "Rejected" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(img.testimony_id);
                            }}
                            className="bg-red-600 px-2 py-1 rounded text-white text-xs"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((vid) => (
                <div
                  key={vid.testimony_id}
                  className="border rounded-lg overflow-hidden shadow-lg"
                >
                  <video
                    src={vid.filepath}
                    controls
                    className="w-full h-56 object-cover"
                  />
                  <div className="p-4 flex flex-col gap-2">
                    <p className="text-gray-800 text-sm">
                      {vid.testimony_note}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">{vid.is_approved}</span>
                      <div className="flex gap-2">
                        {vid.is_approved !== "Approved" && (
                          <button
                            onClick={() => handleApprove(vid.testimony_id)}
                            className="bg-green-600 px-2 py-1 rounded text-white text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {vid.is_approved !== "Rejected" && (
                          <button
                            onClick={() => handleReject(vid.testimony_id)}
                            className="bg-red-600 px-2 py-1 rounded text-white text-xs"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {modalImage && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setModalImage(null)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 transition"
              >
                ×
              </button>
              <img
                src={modalImage}
                alt="enlarged"
                className="w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}

        {/* No testimonies */}
        {images.length === 0 && videos.length === 0 && !loader && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-700">
              No testimonies found
            </h1>
            <p className="text-gray-600 text-sm">
              Once testimonies are submitted, they will appear here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestimonyByWorkshop;
