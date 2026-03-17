import { useRef, useState } from "react";
import Swal from "sweetalert2";
import { useGetUploadLocation } from "../../../app/core/api/Admin";
import Layout from "../../../app/components/Layout/Layout";

export const UploadLocation = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: MapCitizen } = useGetUploadLocation();
  const token = sessionStorage.getItem("session_token");
  const userId = sessionStorage.getItem("user_id");

  const reSetAll = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      Swal.fire("Warning", "Please select a file", "warning");
      return;
    }
    const payload = {
      user_id: userId, // from session / auth
      session_token: token, // from auth
    };

    const formData = new FormData();
    formData.append("json_data", JSON.stringify(payload));
    formData.append("files", file);

    try {
      setLoading(true);
      const result = await MapCitizen(formData);
      if (result?.result?.toLowerCase() === "success") {
        reSetAll();
        Swal.fire("Success", result?.message, "success");
        if (result.data) {
          window.open(result.data, "_blank");
        }
      } else {
        Swal.fire("Error", result?.message, "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="Upload Location">
      <div className="p-6 flex justify-center">
        <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-center">
            Upload Location Excel
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">
                Upload Excel File <span className="text-red-500">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border rounded-md px-3 py-2 bg-white"
              />

              {/* Selected file name */}
              {file && (
                <p className="text-xs text-green-600 mt-1">
                  Selected file:{" "}
                  <span className="font-medium">{file.name}</span>
                </p>
              )}

              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Only .xls or .xlsx files allowed
                </p>

                {/* Sample Excel download */}
                <a
                  href="/rbi-deployment/admin/files/Location Details - Sample Format.xlsx"
                  download
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Download Sample Excel
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Uploading..." : "Upload File"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};
