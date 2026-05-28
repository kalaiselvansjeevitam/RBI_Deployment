import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import Swal from "sweetalert2";
import { Loader } from "lucide-react";

import {
  useGetDistrictParams,
  useGetDownloadWorkshopParams,
} from "../../../app/core/api/Admin";
import React from "react";
import type { District } from "../../../app/lib/types";
import { Button } from "../../../app/components/ui/button";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const WorkshopReport = () => {
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: downloadWorkshop } = useGetDownloadWorkshopParams();

  const [districtList, setDistrictList] = useState<District[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };
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

  /* ---------- Download ---------- */
  const handleDownload = async () => {
    if (!selectedDistrict) {
      Swal.fire("Validation", "Please select a district", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await downloadWorkshop({
        district: selectedDistrict,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      });

      /* ---------- NO DATA FOUND ---------- */
      if (Array.isArray(res?.data) && res.data.length === 0) {
        Swal.fire("Info", res.message || "No workshops found", "info");
        return;
      }

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
      link.download = `Workshop_Report_${selectedDistrict}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire("Success", "Workshop report downloaded", "success");
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
  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    { value?: string; onClick?: () => void; placeholder?: string }
  >(({ value, onClick, placeholder }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-left bg-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {value || placeholder}
    </button>
  ));

  CustomInput.displayName = "CustomInput";
  const normalizeDate = (date: Date | null) => {
    if (!date) return undefined;
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  return (
    <Layout headerTitle="Workshop Report">
      <div className="flex justify-center mt-10 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-center text-gray-700">
            Download Workshop Report
          </h2>

          {/* District */}
          {/* Filters */}
          <div className="space-y-4">
            {/* District */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                District
              </label>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select District</option>
                <option value="All Districts">All Districts</option>

                {districtList.map((d) => (
                  <option key={d.id} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                Start Date
              </label>

              <ReactDatePicker
                dateFormat="dd/MM/yyyy"
                selected={startDate}
                onChange={(date: any) =>
                  setStartDate(normalizeDate(date || undefined))
                }
                placeholderText="Select Start Date"
                customInput={<CustomInput placeholder="Select Start Date" />}
                popperClassName="z-50"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-1">
                End Date
              </label>

              <ReactDatePicker
                dateFormat="dd/MM/yyyy"
                selected={endDate}
                onChange={(date: any) =>
                  setEndDate(normalizeDate(date || undefined))
                }
                placeholderText="Select End Date"
                customInput={<CustomInput placeholder="Select End Date" />}
                popperClassName="z-50"
              />
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="w-full text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Download Report
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default WorkshopReport;
