import { useEffect, useRef, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import type { GetWorkshopRes } from "../../../app/lib/types";
import {
  useGetUpdateTestimony,
  useGetWorkshopParams,
} from "../../../app/core/api/Admin";
import { Loader } from "lucide-react";
import imageCompression from "browser-image-compression";
import Swal from "sweetalert2";

interface WorkshopOption {
  id: string;
  workshop_name: string;
  date: string;
}

const UploadTestimony = () => {
  const token = sessionStorage.getItem("session_token");
  const userId = sessionStorage.getItem("user_id");

  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileProcessing, setFileProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: Workshop } = useGetWorkshopParams();
  const { mutateAsync: UpdateTestimony } = useGetUpdateTestimony();

  /* ---------------- Image Compression ---------------- */
  const compressImage = async (file: File) => {
    return await imageCompression(file, {
      maxSizeMB: 5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  };

  /* ---------------- Fetch Workshops ---------------- */
  useEffect(() => {
    Workshop()
      .then((res: GetWorkshopRes) => setWorkshops(res.list))
      .catch(console.error);
  }, []);

  /* ---------------- File Handler ---------------- */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setFileProcessing(true);
    setError("");

    const selectedFiles = Array.from(e.target.files);

    try {
      let imageCount = files.filter((f) => f.type.startsWith("image/")).length;
      let videoCount = files.filter((f) => f.type.startsWith("video/")).length;

      const processedFiles: File[] = [];

      for (const file of selectedFiles) {
        // IMAGE
        if (file.type === "image/png" || file.type === "image/jpeg") {
          if (imageCount >= 4) {
            setError("Maximum 4 images allowed");
            return;
          }

          const compressed = await compressImage(file);

          if (compressed.size > 5 * 1024 * 1024) {
            setError(`"${file.name}" exceeds 5MB`);
            return;
          }

          processedFiles.push(
            new File([compressed], file.name, { type: file.type }),
          );
          imageCount++;
        }

        // VIDEO
        else if (file.type === "video/mp4") {
          if (videoCount >= 2) {
            setError("Maximum 2 videos allowed");
            return;
          }

          if (file.size > 20 * 1024 * 1024) {
            setError(`"${file.name}" exceeds 20MB`);
            return;
          }

          processedFiles.push(file);
          videoCount++;
        } else {
          setError("Only JPG, PNG images and MP4 videos allowed");
          return;
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

    if (!selectedWorkshop || files.length === 0) {
      setError("Please select workshop and upload files");
      return;
    }

    const payload = {
      workshop_id: selectedWorkshop,
      user_id: userId,
      session_token: token,
      testimony_note: notes,
    };

    const formData = new FormData();
    formData.append("json_data", JSON.stringify(payload));

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        formData.append("images[]", file);
      } else if (file.type === "video/mp4") {
        formData.append("videos[]", file);
      }
    });

    try {
      setLoading(true);
      const res = await UpdateTestimony(formData);

      if (res?.result?.toLowerCase() === "success") {
        Swal.fire("Success", res.message, "success");
        setFiles([]);
        setNotes("");
        setSelectedWorkshop("");
      } else {
        Swal.fire("Error", res?.message || "Upload failed", "error");
      }
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message, "error");
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

          {/* Workshop */}
          <select
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select Workshop</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.workshop_name} - {w.date}
              </option>
            ))}
          </select>

          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept="image/png,image/jpeg,video/mp4"
            onChange={handleFileChange}
          />

          <h2 className="text-md text-start font-semibold">Upload</h2>
          {/* Upload Box */}
          <div className="border-2 border-dashed rounded p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Images (max 4) & Videos (max 2)
              </span>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={fileProcessing}
                onClick={() => fileInputRef.current?.click()}
              >
                + Add
              </Button>
            </div>

            {fileProcessing && (
              <div className="flex items-center gap-2 text-sm">
                <Loader className="animate-spin w-4 h-4" />
                Processing...
              </div>
            )}

            {files.map((f, i) => (
              <div
                key={i}
                className="flex justify-between bg-gray-50 p-2 rounded text-sm"
              >
                <span className="truncate">
                  {f.name} ({(f.size / 1024 / 1024).toFixed(2)}MB)
                </span>
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

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Notes (optional)"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Upload"}
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default UploadTestimony;
