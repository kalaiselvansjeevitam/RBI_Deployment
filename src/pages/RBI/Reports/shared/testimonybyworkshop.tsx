import Layout from "../../../../app/components/Layout/Layout";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetTestimoniesByWorkshop,
  useGetWorkshopDetails,
} from "../../../../app/core/api/Admin";
import type {
  GetWorkshopDetails,
  Testimony,
  WorkshopDetails,
} from "../../../../app/lib/types";
import { Button } from "../../../../app/components/ui/button";
/* ---------------- MAIN COMPONENT ---------------- */
const TestimonyByRBI = () => {
  const { mutateAsync: getWorkshopById } = useGetWorkshopDetails();
  const location = useLocation();
  const navigate = useNavigate();
  const workshopId = new URLSearchParams(location.search).get("workshop_id");

  const [loader, setLoader] = useState(false);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [modalMedia, setModalMedia] = useState<{
    type: "image" | "video";
    src: string;
  } | null>(null);

  const { mutateAsync: getTestimonies } = useGetTestimoniesByWorkshop();

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
  const [workshopDetails, setWorkshopDetails] =
    useState<WorkshopDetails | null>(null);

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const response: GetWorkshopDetails = await getWorkshopById({
          work_shop_id: workshopId ?? "",
        });

        if (response?.list) {
          setWorkshopDetails(response.list);
        }
      } catch (error) {
        console.error("Failed to fetch workshop details", error);
      }
    };

    fetchWorkshop();
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalMedia(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const images = testimonies.filter((t) => t.media_type === "image");
  const videos = testimonies.filter((t) => t.media_type === "video");

  return (
    <Layout headerTitle="Testimonies By Workshop">
      <div className="p-4 md:p-6">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-sm rounded-md text-white"
          >
            ← Back
          </Button>
        </div>
        {loader && (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        )}

        {/* Workshop Details Card */}
        {workshopDetails && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-gray-800">
                Workshop Details
              </h2>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  workshopDetails.work_shop_status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {workshopDetails.work_shop_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <p className="text-gray-500 text-sm">Workshop ID</p>
                <p className="font-medium">{workshopDetails.id}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Date</p>
                <p className="font-medium">{workshopDetails.date}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">VLE Name</p>
                <p className="font-medium">{workshopDetails.vle_name}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">District</p>
                <p className="font-medium">{workshopDetails.district}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Block Panchayat</p>
                <p className="font-medium">{workshopDetails.block_panchayat}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Gram Panchayat</p>
                <p className="font-medium">{workshopDetails.gram_panchayat}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Time</p>
                <p className="font-medium">
                  {workshopDetails.from_time} - {workshopDetails.to_time}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Total Citizens</p>
                <p className="font-medium">{workshopDetails.total_citizens}</p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">Mobile Number</p>
                <p className="font-medium">
                  {workshopDetails.vle_mobile_number}
                </p>
              </div>

              {/* Location */}
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-gray-500 text-sm mb-1">Location</p>
                <p className="font-medium">{workshopDetails.location}</p>
              </div>

              {/* Checklist */}
              <div className="md:col-span-2 lg:col-span-3">
                <p className="text-gray-500 text-sm mb-3">Checklist</p>

                <div className="space-y-2 ">
                  {workshopDetails.checklist?.split(",").map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 border rounded-lg px-3 py-2 cursor-not-allowed"
                    >
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="w-4 h-4 accent-green-600 cursor-not-allowed"
                      />

                      <span className="text-sm text-gray-700">
                        {item.trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalMedia({
                        type: "image",
                        src: img.filepath,
                      });
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
                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalMedia({
                        type: "video",
                        src: vid.filepath,
                      });
                    }}
                  >
                    <video
                      src={vid.filepath}
                      className="w-full h-56 object-cover"
                      muted
                    />
                  </div>

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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* IMAGE MODAL */}
        {modalMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setModalMedia(null)}
          >
            {modalMedia.type === "image" ? (
              <img
                src={modalMedia.src}
                className="max-h-[80vh] max-w-[90vw] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={modalMedia.src}
                controls
                autoPlay
                className="max-h-[80vh] max-w-[90vw] rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestimonyByRBI;
