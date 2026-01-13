import { useEffect, useRef, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import type { GetWorkshopRes } from "../../../app/lib/types";
import {
  useGetMapCitizen,
  useGetWorkshopParams,
} from "../../../app/core/api/Admin";
import Swal from "sweetalert2";
import { Loader } from "lucide-react";
// import CitizenUploadFormat from "../../../assets/files/CitizenUploadFormat.xlsx"

interface WorkshopOption {
  id: string;
  workshop_name: string;
  date: string;
  from_time: string;
  to_time: string;
  vle_name: string;
  conducted_by: string;
  updated_at: string;
  created_at: string;
  total_citizens: string;
  vle_id: string;
  work_shop_status: string;
}

const MapCitizen = () => {
  const [selectedWorkshop, setSelectedWorkshop] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const token = sessionStorage.getItem("session_token");
  const userId = sessionStorage.getItem("user_id");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [workshops, setWorkshops] = useState<WorkshopOption[]>([]);
  const { mutateAsync: Workshop } = useGetWorkshopParams();
  const { mutateAsync: MapCitizen } = useGetMapCitizen();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const response: GetWorkshopRes = await Workshop();
        const mappedWorkshops = response.list.map((item) => ({
          id: item.id,
          workshop_name: item.workshop_name,
          date: item.date,
          from_time: item.from_time,
          to_time: item.to_time,
          vle_name: item.vle_name,
          conducted_by: item.conducted_by,
          updated_at: item.updated_at,
          created_at: item.created_at,
          total_citizens: item.total_citizens,
          vle_id: item.vle_id,
          work_shop_status: item.work_shop_status,
        }));

        setWorkshops(mappedWorkshops);
      } catch (error) {
        console.error("Failed to fetch workshops", error);
      }
    };

    fetchWorkshops();
  }, []);

  const reSetAll = () => {
    setFile(null);
    setSelectedWorkshop("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkshop) {
      setError("Please select a workshop");
      return;
    }

    if (!file) {
      setError("Please upload an Excel file");
      return;
    }

    setError("");

    const payload = {
      work_shop_id: selectedWorkshop,
      user_id: userId, // from session / auth
      session_token: token, // from auth
    };

    const formData = new FormData();
    formData.append("json_data", JSON.stringify(payload));
    formData.append("files", file);

    try {
      setLoading(true);
      const result = await MapCitizen(formData);
      if (result?.result.toLowerCase() == "success") {
        reSetAll();
        Swal.fire("Success", result?.message, "success");
        if (result.data) {
          window.open(result.data, "_blank");
        }
        setLoading(false);
      } else {
        Swal.fire("Error", result?.message, "error");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Upload failed");
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="Upload Citizen">
      <div className="flex justify-center py-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg bg-white p-6 rounded-lg shadow space-y-6"
        >
          <h2 className="text-2xl text-center font-semibold text-gray-700">
            Map Citizens to Workshop
          </h2>

          {/* Workshop Dropdown */}
          <div>
            <label className="text-sm font-medium">
              Select Workshop <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Select</option>
              {workshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.id} - {workshop.date} - {workshop.workshop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Excel Upload */}
          {/* Excel Upload */}
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
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            )}

            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                Only .xls or .xlsx files allowed
              </p>

              {/* Sample Excel download */}
              <a
                href="/rbi-deployment/admin/files/sample.xlsx"
                download
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Download Sample Excel
              </a>
            </div>
          </div>
          {/* Error */}
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div className="flex justify-center">
            <Button type="submit" className="bg-purple">
              {loading ? (
                <div className=" flex justify-center">
                  <Loader className=" animate-spin" />
                </div>
              ) : (
                "Upload & Map"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MapCitizen;
