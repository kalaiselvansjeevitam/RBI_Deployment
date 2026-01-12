import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import Swal from "sweetalert2";
import { Loader } from "lucide-react";

import {
  useGetDistrictParams,
  useGetDownloadVLEParams,
} from "../../../app/core/api/Admin";
import type { District } from "../../../app/lib/types";

export const VLEReport = () => {
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: downloadVLE } = useGetDownloadVLEParams();

  const [districtList, setDistrictList] = useState<District[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------- Load Districts ---------- */
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const res = await getDistricts();
        setDistrictList(res?.list ?? []);
      } catch (error) {
        Swal.fire("Error", "Failed to load districts", "error");
      }
    };

    loadDistricts();
  }, []);

  /* ---------- Download Handler ---------- */
  const handleDownload = async () => {
    if (!selectedDistrict) {
      Swal.fire("Validation", "Please select a district", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await downloadVLE({
        district: selectedDistrict,
      });

      /* ---------- NO DATA CASE ---------- */
      if (Array.isArray(res?.data) && res.data.length === 0) {
        Swal.fire("Info", res.message || "No data found", "info");
        return;
      }

      /* ---------- NO FILE ---------- */
      if (!res?.data) {
        Swal.fire("Error", "No file received", "error");
        return;
      }

      /* ---------- FILE URL ---------- */
      if (typeof res.data === "string" && res.data.startsWith("http")) {
        window.location.href = res.data;
        return;
      }

      /* ---------- BASE64 / FILE STRING ---------- */
      const link = document.createElement("a");
      link.href = res.data;
      link.download = `VLE_Report_${selectedDistrict}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire("Success", "VLE report downloaded", "success");
    } catch (error: any) {
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Download failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerTitle="VLE Report">
      <div className="flex justify-center mt-12 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-700 text-center">
            Download VLE Report
          </h2>

          {/* District Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-600">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="border rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select District</option>
              {districtList.map((d) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Download Report
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default VLEReport;
