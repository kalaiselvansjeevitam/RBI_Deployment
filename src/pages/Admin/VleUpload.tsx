import { useRef, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import { Button } from "../../app/components/ui/button";
import { Loader } from "lucide-react";
import Swal from "sweetalert2";
import { useGetUploadVle } from "../../app/core/api/Admin"; // assume API hook

const VleUpload = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: uploadExcel } = useGetUploadVle();

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const user_id = sessionStorage.getItem("user_id");
  const session_token = sessionStorage.getItem("session_token");

  /* ---------------- File Change ---------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const selectedFile = e.target.files[0];

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      Swal.fire("Invalid File", "Please upload an Excel file only", "error");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!file) {
      Swal.fire("Error", "Please select an Excel file", "error");
      return;
    }

    const payload = {
      user_id,
      session_token,
    };

    const formData = new FormData();
    formData.append("json_data", JSON.stringify(payload));
    formData.append("files", file); // backend expects "files"

    try {
      setLoading(true);
      const res = await uploadExcel(formData);

      if (res?.result?.toLowerCase() === "success") {
        Swal.fire("Success", res.message, "success");
        if (res.data) {
          window.open(res.data, "_blank");
        }
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
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
    <Layout headerTitle="VLE Upload">
      <div className="flex justify-center py-10">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow space-y-5">
          <h2 className="text-xl font-semibold text-center text-gray-700">
            Upload Excel File
          </h2>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />

          {file && (
            <p className="text-sm text-gray-600 truncate">
              Selected: {file.name}
            </p>
          )}
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-500">
              Only .xls or .xlsx files allowed
            </p>

            {/* Sample Excel download */}
            <a
              href="/rbi-deployment/admin/files/VLE Details - Sample Format.xlsx"
              download
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              Download Sample Excel
            </a>
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader className="animate-spin" /> : "Upload"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default VleUpload;
