import Layout from "../../../app/components/Layout/Layout";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Clock, Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useDeleteTestimony,
  useGetViewTestimony,
} from "../../../app/core/api/Admin";
import type { ViewTestimonytype } from "../../../app/lib/types";
import Swal from "sweetalert2";
// import jsPDF from "jspdf";

export const ViewTestimony = () => {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get("workshop_id");
  const { mutateAsync: getSchoolDashboradData } = useGetViewTestimony();
  const { mutateAsync: deleteTestimony } = useDeleteTestimony();
  const [data, setData] = useState<ViewTestimonytype[]>([]);
  const [loading, setLoading] = useState(false);
  // 🔁 Replace sampleData with API response
  //   const data = sampleData;
  useEffect(() => {
    if (!workshopId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await getSchoolDashboradData({
          workshop_id: workshopId, // ✅ ONLY THIS
        });

        setData(response?.data ?? []);
      } catch (error: any) {
        Swal.fire("Error", error?.response?.data?.message, "error");
        console.error("Failed to fetch workshop data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [workshopId]);
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This testimony will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await deleteTestimony({ testimony_id: id });

      // ✅ Show API response message only
      await Swal.fire(
        "Deleted",
        res?.message || "Deleted successfully",
        "success",
      );

      // ✅ Reload page after delete
      window.location.reload();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to delete testimony",
        "error",
      );
    }
  };

  /* ---------- SPLIT MEDIA ---------- */
  const images = useMemo(
    () => data.filter((item) => item.media_type === "image").slice(0, 4),
    [data],
  );

  const videos = useMemo(
    () => data.filter((item) => item.media_type === "video").slice(0, 4),
    [data],
  );

  const navigate = useNavigate();

  const LoadingBlock = () => (
    <div className="flex justify-center items-center py-20">
      <Loader className="w-6 h-6 animate-spin text-blue-600" />
    </div>
  );
  // const loadImageAsBase64 = (url: string): Promise<string> =>
  // new Promise((resolve, reject) => {
  //   const img = new Image();
  //   img.crossOrigin = "anonymous";

  //   img.onload = () => {
  //     try {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = img.width;
  //       canvas.height = img.height;

  //       const ctx = canvas.getContext("2d");
  //       if (!ctx) {
  //         reject("Canvas context not available");
  //         return;
  //       }

  //       ctx.drawImage(img, 0, 0);

  //       // Convert image to Base64 JPEG
  //       const dataURL = canvas.toDataURL("image/jpeg", 0.95);
  //       resolve(dataURL);
  //     } catch (err) {
  //       reject(err);
  //     }
  //   };

  //   img.onerror = () => reject("Failed to load image");
  //   img.src = url;
  // });

  //   const downloadImagesPDF = async () => {
  //   if (!images.length) {
  //     Swal.fire("No Images", "No images available to download", "info");
  //     return;
  //   }

  //   try {
  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const pageHeight = pdf.internal.pageSize.getHeight();

  //     let y = 15;

  //     // Header
  //     pdf.setFontSize(14);
  //     pdf.text("Workshop Testimony Images", 14, y);
  //     pdf.setFontSize(10);
  //     pdf.text(`Workshop ID: ${workshopId}`, 14, y + 6);

  //     y += 15;

  //     for (let i = 0; i < images.length; i++) {
  //       const img = images[i];

  //       // Load image as base64
  //       const base64Image = await loadImageAsBase64(img.filepath);

  //       // Calculate image size
  //       const imgProps = pdf.getImageProperties(base64Image);
  //       const imgWidth = pageWidth - 28;
  //       const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  //       // Add new page if needed
  //       if (y + imgHeight > pageHeight - 20) {
  //         pdf.addPage();
  //         y = 15;
  //       }

  //       // Add image to PDF
  //       pdf.addImage(base64Image, "JPEG", 14, y, imgWidth, imgHeight);
  //       y += imgHeight + 10;
  //     }

  //     pdf.save(`Workshop_${workshopId}_Images.pdf`);
  //   } catch (error) {
  //     console.error("PDF download error:", error);

  //     Swal.fire({
  //       title: "Download Failed",
  //       text: "Failed to download images. Please try again later.",
  //       icon: "error",
  //       confirmButtonText: "OK",
  //     });
  //   }
  // };

  return (
    <Layout headerTitle="View Testimony">
      <div className="px-6 py-4 space-y-10">
        <div className="mb-4 flex items-center justify-end">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            ← Back
          </button>
        </div>

        {loading ? (
          <LoadingBlock />
        ) : (
          <>
            {/* ---------- IMAGES SECTION ---------- */}
            <Section title="Images">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.length > 0 ? (
                  images.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <EmptyState text="No images available" />
                )}
              </div>
            </Section>

            {/* ---------- VIDEOS SECTION ---------- */}
            <Section title="Videos">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {videos.length > 0 ? (
                  videos.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <EmptyState text="No videos available" />
                )}
              </div>
            </Section>

            {/* {images.length > 0 && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={downloadImagesPDF}
                  className="px-3 py-1.5 text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Download Images PDF
                </button>
              </div>
            )} */}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ViewTestimony;

/* ---------- REUSABLE COMPONENTS ---------- */

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    {children}
  </div>
);

const MediaCard = ({
  item,
  onDelete,
}: {
  item: ViewTestimonytype;
  onDelete: (id: string) => void;
}) => {
  const approved = item.is_approved.toLowerCase() === "approved";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {/* MEDIA */}
      <div className="h-48 bg-gray-100 relative">
        {/* DELETE BUTTON */}

        {item.media_type === "image" ? (
          <img
            src={item.filepath}
            alt="testimony"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            src={item.filepath}
            controls
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-gray-700 line-clamp-2">
          {item.testimony_note || "No description"}
        </p>

        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{formatDate(item.created_at)}</span>
          <StatusBadge approved={approved} />
        </div>

        {approved && item.approved_by_name && (
          <p className="text-xs text-gray-600">
            Approved by{" "}
            <span className="font-semibold">{item.approved_by_name}</span>
          </p>
        )}

        {/* DELETE BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={() => onDelete(item.id)}
            className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ approved }: { approved: boolean }) => (
  <span
    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
      approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {approved ? <BadgeCheck size={12} /> : <Clock size={12} />}
    {approved ? "Approved" : "Pending"}
  </span>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-sm text-gray-500 italic">{text}</div>
);

/* ---------- UTIL ---------- */

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
