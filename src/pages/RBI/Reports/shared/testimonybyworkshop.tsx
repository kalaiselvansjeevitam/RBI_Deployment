import Layout from "../../../../app/components/Layout/Layout";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetTestimoniesByWorkshop } from "../../../../app/core/api/Admin";
import type { Testimony } from "../../../../app/lib/types";
import { Button } from "../../../../app/components/ui/button";
/* ---------------- MAIN COMPONENT ---------------- */
const TestimonyByRBI = () => {
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
      <div className="px-4 py-3">
        <Button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm rounded-md text-white"
        >
          ← Back
        </Button>

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
