import { useEffect, useRef, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import type { GetWorkshopRes } from "../../../app/lib/types";
import {
  useGetUpdateTestimony,
  useGetWorkshopParams,
  useGetMediaCount, // ✅ ADD THIS
} from "../../../app/core/api/Admin";
import { Loader } from "lucide-react";
import imageCompression from "browser-image-compression";
import Swal from "sweetalert2";

interface WorkshopOption {
  id: string;
  workshop_name: string;
  date: string;
}

const MAX_IMAGE = 4;
const MAX_VIDEO = 2;

const UploadTestimony = () => {
  const token = sessionStorage.getItem("session_token");
  const userId = sessionStorage.getItem("user_id");

  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [fileType, setFileType] = useState<"image" | "video" | "">("");
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);
  const [countLoading, setCountLoading] = useState(false);

  // ✅ existing uploaded count
  const [existingCount, setExistingCount] = useState({
    image: 0,
    video: 0,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: Workshop } = useGetWorkshopParams();
  const { mutateAsync: UpdateTestimony } = useGetUpdateTestimony();
  const { mutateAsync: GetMediaCount } = useGetMediaCount();

  /* ---------------- Fetch Workshops ---------------- */
  useEffect(() => {
    Workshop()
      .then((res: GetWorkshopRes) => setWorkshops(res.list))
      .catch(console.error);
  }, []);

  /* ---------------- Fetch media count on workshop select ---------------- */
  useEffect(() => {
    if (!selectedWorkshop) return;
    setCountLoading(true);

    const fetchCounts = async () => {
      try {
        const res = await GetMediaCount({
          workshop_id: selectedWorkshop,
        });

        let image = 0;
        let video = 0;

        res.data.forEach((item: any) => {
          if (item.media_type === "image")
            image = Number(item.media_type_count);
          if (item.media_type === "video")
            video = Number(item.media_type_count);
        });

        setExistingCount({ image, video });
        setFiles([]);
        setFileType("");
        setError("");
        setCountLoading(false);
      } catch (err) {
        setError("Failed to fetch media count");
        setCountLoading(false);
      }
    };

    fetchCounts();
  }, [selectedWorkshop]);

  const remainingImage = Math.max(0, MAX_IMAGE - existingCount.image);
  const remainingVideo = Math.max(0, MAX_VIDEO - existingCount.video);

  /* ---------------- Image Compression ---------------- */
  const compressImage = async (file: File) => {
    return await imageCompression(file, {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  };

  /* ---------------- File Handler ---------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !fileType) return;

    setFileProcessing(true);
    setError("");

    const selectedFiles = Array.from(e.target.files);
    const maxAllowed = fileType === "image" ? remainingImage : remainingVideo;

    if (files.length + selectedFiles.length > maxAllowed) {
      setError(
        `You can upload only ${maxAllowed} ${
          fileType === "image" ? "images" : "videos"
        }`,
      );
      setFileProcessing(false);
      return;
    }

    const processedFiles: File[] = [];

    try {
      for (const file of selectedFiles) {
        if (fileType === "image") {
          if (!file.type.startsWith("image/")) {
            setError("Only images allowed");
            return;
          }

          const compressed = await compressImage(file);
          processedFiles.push(
            new File([compressed], file.name, { type: file.type }),
          );
        } else {
          if (file.type !== "video/mp4") {
            setError("Only MP4 videos allowed");
            return;
          }
          if (file.size > 20 * 1024 * 1024) {
            setError("Video must be under 20MB");
            return;
          }
          processedFiles.push(file);
        }
      }

      setFiles((prev) => [...prev, ...processedFiles]);
    } finally {
      setFileProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkshop || !fileType || files.length === 0) {
      setError("Please select workshop, file type and upload files");
      return;
    }

    const payload = {
      workshop_id: selectedWorkshop,
      user_id: userId,
      session_token: token,
      testimony_note: notes,
      file_type: fileType,
    };

    const formData = new FormData();
    formData.append("json_data", JSON.stringify(payload));

    files.forEach((file) => {
      if (fileType === "image") formData.append("images[]", file);
      else formData.append("videos[]", file);
    });

    try {
      setLoading(true);
      const res = await UpdateTestimony(formData);

      if (res?.result?.toLowerCase() === "success") {
        Swal.fire("Success", res.message, "success");
        setFiles([]);
        setNotes("");
        setSelectedWorkshop("");
        setFileType("");
      } else {
        Swal.fire("Error", res?.message || "Upload failed", "error");
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed to update status",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="Upload Files">
      <div className="flex justify-center py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white p-6 rounded-lg shadow space-y-6"
        >
          <h2 className="text-2xl text-center font-semibold">Upload Files</h2>

          {/* ================= Workshop ================= */}
          <div>
            <label className="text-sm font-medium">
              Workshop <span className="text-red-500">*</span>
            </label>

            <select
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Select Workshop</option>
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id} - {w.date} - {w.workshop_name}
                </option>
              ))}
            </select>
          </div>

          {/* ================= Uploaded Count ================= */}
          {selectedWorkshop && (
            <div className="bg-gray-50 border rounded p-3 text-sm">
              {countLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader className="w-4 h-4 animate-spin" />
                  Fetching uploaded files count...
                </div>
              ) : (
                <div className="space-y-1">
                  <p>
                    <span className="font-medium text-red-700">
                      NOTE : Only 4 Images and 2 Videos are allowed
                    </span>{" "}
                  </p>
                  <p>
                    <span className="font-medium">
                      Already uploaded image :
                    </span>{" "}
                    {existingCount.image}
                  </p>
                  <p>
                    <span className="font-medium">
                      Already uploaded video :
                    </span>{" "}
                    {existingCount.video}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================= File Type ================= */}
          <div>
            <label className="text-sm font-medium">
              File Type <span className="text-red-500">*</span>
            </label>

            <select
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value as "image" | "video");
                setFiles([]);
                setError("");
              }}
              className="w-full border rounded px-3 py-2 mt-1"
            >
              <option value="">Select File Type</option>

              <option value="image" disabled={remainingImage === 0}>
                Image (remaining {remainingImage})
              </option>

              <option value="video" disabled={remainingVideo === 0}>
                Video (remaining {remainingVideo})
              </option>
            </select>
          </div>

          {/* ================= Hidden File Input ================= */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept={fileType === "image" ? "image/png,image/jpeg" : "video/mp4"}
            onChange={handleFileChange}
          />

          {/* ================= Upload Box ================= */}
          <div className="border-2 border-dashed rounded p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {fileType === "image" &&
                  `Images (max 4, remaining ${remainingImage})`}
                {fileType === "video" &&
                  `Videos (max 2, remaining ${remainingVideo})`}
                {!fileType && "Select file type first"}
              </span>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  !fileType ||
                  fileProcessing ||
                  (fileType === "image" && files.length >= remainingImage) ||
                  (fileType === "video" && files.length >= remainingVideo)
                }
                onClick={() => fileInputRef.current?.click()}
              >
                + Add
              </Button>
            </div>

            {/* Selected Files */}
            {files.map((f, i) => (
              <div
                key={i}
                className="flex justify-between bg-gray-50 p-2 rounded text-sm mt-2"
              >
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  className="text-red-500"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* ================= Notes ================= */}
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Notes (optional)"
            />
          </div>

          {/* ================= Error ================= */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* ================= Submit ================= */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Upload"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default UploadTestimony;
