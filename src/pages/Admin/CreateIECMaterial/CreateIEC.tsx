import { useRef, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { useGetcreateIECMaterial } from "../../../app/core/api/Admin";
import Swal from "sweetalert2";

type IECForm = {
  language: string;
  media_type: string;
  material_type: string;
  session_token: string | null;
  user_id: string | null;
};

export const CreateIEC = () => {
  const { mutateAsync: createIEC } = useGetcreateIECMaterial();
  const user_id = sessionStorage.getItem("user_id");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const session_token = sessionStorage.getItem("session_token");
  const [form, setForm] = useState<IECForm>({
    language: "",
    media_type: "",
    material_type: "",
    user_id,
    session_token,
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a file");
      return;
    }

    const formData = new FormData();
    formData.append("json_data", JSON.stringify(form));
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await createIEC(formData);
      if (res?.result?.toLowerCase() === "success") {
        Swal.fire("Success", res.message, "success");
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
    <Layout headerTitle="Create IEC Material">
      <div className="pt-8 px-4"></div>
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow space-y-4"
      >
        <h2 className="text-xl text-center font-bold text-black-800 mb-4">
          Create IEC Material
        </h2>
        {/* Language */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Language</label>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Language</option>
            <option value="marathi">Marathi</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>

        {/* Media Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Media Type</label>
          <select
            name="media_type"
            value={form.media_type}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Media Type</option>
            <option value="PDF">PDF</option>
            <option value="Images">Images</option>
            <option value="Videos">Videos</option>
          </select>
        </div>

        {/* Material Type */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Material Type</label>
          <select
            name="material_type"
            value={form.material_type}
            onChange={handleChange}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Material Type</option>
            <option value="HandBook">HandBook</option>
            <option value="Banner">Banner</option>
            <option value="Videos">Videos</option>
          </select>
        </div>

        {/* File Upload */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="border rounded px-3 py-2"
            accept="application/pdf,image/*,video/*"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Create IEC"}
        </button>
      </form>
    </Layout>
  );
};
