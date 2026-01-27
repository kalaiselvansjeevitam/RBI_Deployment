import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import Swal from "sweetalert2";
import { Loader } from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  useGetDistrictParams,
  useGetVleParams,
  useGetDownloadCitizenParams,
} from "../../../app/core/api/Admin";
import type { District } from "../../../app/lib/types";
import React from "react";

export const CitizenReport = () => {
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getVles } = useGetVleParams();
  const { mutateAsync: downloadCitizen } = useGetDownloadCitizenParams();

  const [districtList, setDistrictList] = useState<District[]>([]);
  const [vleList, setVleList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- Filters ---------- */
  const [district, setDistrict] = useState("");
  const [vleId, setVleId] = useState("");
  const [gender, setGender] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  /* ---------- Load dropdowns ---------- */
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [districtRes, vleRes] = await Promise.all([
          getDistricts(),
          getVles({ get_by: "vle" }),
        ]);

        setDistrictList(districtRes?.list ?? []);
        setVleList(vleRes?.data ?? []);
      } catch (error) {
        Swal.fire("Error", "Failed to load filters", "error");
      }
    };

    loadDropdowns();
  }, []);

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

  /* ---------- Download ---------- */
  const handleDownload = async () => {
    if (!startDate || !endDate || !gender || !district || !vleId) {
      Swal.fire("Validation", "Select All Parameters", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await downloadCitizen({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        gender,
        district,
        vle_id: vleId,
      } as any);

      /* ---------- NO DATA FOUND ---------- */
      if (Array.isArray(res?.data) && res.data.length === 0) {
        Swal.fire("Info", res.message || "No citizens found", "info");
        return;
      }

      /* ---------- NO FILE RECEIVED ---------- */
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
      link.download = "Citizen_Report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire("Success", "Citizen report downloaded", "success");
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

  const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
    <button
      onClick={onClick}
      ref={ref}
      className="border border-gray-700 rounded-md p-1 text-sm w-[95px] text-left"
    >
      {value || "Select Date"}
    </button>
  ));
  const normalizeDate = (date: Date | null) => {
    if (!date) return undefined;
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  return (
    <Layout headerTitle="Citizen Report">
      <div className="flex justify-center mt-10 px-4">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-md p-6 space-y-5">
          <h2 className="text-lg font-semibold text-center text-gray-700">
            Download Citizen Report
          </h2>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-10">
            <label className="flex items-center space-x-2 font-bold">
              <span>From:</span>
              <ReactDatePicker
                dateFormat="dd/MM/yyyy"
                selected={startDate}
                onChange={(date: any) =>
                  setStartDate(normalizeDate(date || undefined))
                }
                placeholderText="Select Start Date"
                popperClassName="z-50"
                customInput={<CustomInput />}
              />
            </label>

            <label className="flex items-center space-x-2 font-bold">
              <span>To:</span>
              <ReactDatePicker
                dateFormat="dd/MM/yyyy"
                selected={endDate}
                onChange={(date: any) =>
                  setEndDate(normalizeDate(date || undefined))
                }
                placeholderText="Select End Date"
                minDate={startDate}
                popperClassName="z-50"
                customInput={<CustomInput />}
              />
            </label>
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* District */}
          <div>
            <label className="text-sm font-medium">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              {districtList.map((d) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>

          {/* VLE */}
          <div>
            <label className="text-sm font-medium">VLE</label>
            <select
              value={vleId}
              onChange={(e) => setVleId(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              {vleList.map((v) => (
                <option key={v.unique_user_id} value={v.unique_user_id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Download */}
          <button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Download Report
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CitizenReport;
