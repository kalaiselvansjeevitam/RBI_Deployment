/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadLocationManagerWiseWorkshopReport,
  useViewLocationManagerWiseWorkshopReport,
} from "../../../app/core/api/RBIReports";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

type LocationRow = {
  center_name: string;
  center_address: string;
  workshop_name: string;
  workshop_date: string;
  workshop_from_time: string;
  workshop_to_time: string;
  district: string;
  created_at: string;
  workshop_status: string;
  vle_id: string;
  vle_name: string;
};

export default function SubLocationScheduleReport() {
  const { mutateAsync: download } =
    useDownloadLocationManagerWiseWorkshopReport();
  const { mutateAsync: viewReport } =
    useViewLocationManagerWiseWorkshopReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  // Unified state
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<LocationRow[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = Boolean(selectedDistrict);

  // Load districts on mount
  useEffect(() => {
    (async () => {
      try {
        const districtRes = await getDistricts();
        const districts = districtRes?.list ?? [];

        const names: string[] = Array.isArray(districts)
          ? districts
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map((x: any) => String(x))
              .filter(Boolean)
          : [];

        setDistrictList(names);
      } catch (e) {
        console.error("Failed to load districts:", e);
        setDistrictList([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    // District is required
    if (!selectedDistrict) {
      setError("Please select a district to view data");
      setAllRows([]);
      return;
    }

    setLoading(true);
    setError("");
    setCurrentPage(0);

    try {
      const payload: any = {
        district: selectedDistrict,
        offset: 0,
      };

      if (startDate) {
        payload.start_date = startDate;
      }
      if (endDate) {
        payload.end_date = endDate;
      }

      const res = await viewReport(payload);

      if (res?.status !== "Success") {
        setAllRows([]);
        setError(res?.message || "Failed to fetch data");
        return;
      }

      setAllRows(res.data ?? []);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err?.message || "An error occurred while fetching data");
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async () => {
    try {
      setLoading(true);

      // No filters required for this download
      const res = await download({
        district: selectedDistrict,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      const url =
        typeof res?.data === "string" && res.data.trim() ? res.data.trim() : "";

      const isSuccessful =
        String(res?.result ?? "")
          .trim()
          .toLowerCase() === "success";

      if (!isSuccessful || !url) {
        toast.error(res?.message || "Failed to download report");
        return;
      }

      // 🔥 DIRECT DOWNLOAD
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Excel report downloaded successfully");
    } catch (e: any) {
      console.error("Download failed:", e);
      toast.error(e?.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  // Client-side pagination
  const paginatedRows = useMemo(() => {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return allRows.slice(start, end);
  }, [allRows, currentPage]);

  const totalPages = Math.ceil(allRows.length / PAGE_SIZE);
  const hasNext = currentPage < totalPages - 1;
  const hasPrev = currentPage > 0;

  const showingText = useMemo(() => {
    if (allRows.length === 0) return "Showing 0–0 of 0";
    const start = currentPage * PAGE_SIZE + 1;
    const end = Math.min((currentPage + 1) * PAGE_SIZE, allRows.length);
    return `Showing ${start}–${end} of ${allRows.length}`;
  }, [currentPage, allRows.length]);
  const navigate = useNavigate();

  return (
    <Layout headerTitle="Location-wise Workshop Schedule Report">
      <div className="p-6">
        {/* Merged Card */}
        <div className="bg-white rounded-2xl shadow p-6 bg-linear-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Location (Center)-Wise Workshop Schedule Report
            </h2>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            View report data in the table below and download as Excel. District
            is required, date filters are required.
          </p>

          {/* Filters and Actions */}
          <div className="grid md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label className="text-sm text-gray-600">
                District (required)
              </label>
              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">Select district</option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  placeholder="e.g., Springfield"
                />
              )}
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Start Date (required)
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                End Date (required)
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                className="cursor-pointer"
                onClick={fetchData}
                disabled={loading || !canSubmit}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading
                  </span>
                ) : (
                  "View Report"
                )}
              </Button>

              <Button
                className="cursor-pointer"
                onClick={handleDownload}
                disabled={loading || !canSubmit}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Downloading
                  </span>
                ) : (
                  "Download Excel"
                )}
              </Button>

              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setSelectedDistrict("");
                  setStartDate("");
                  setEndDate("");
                  setError("");
                  setAllRows([]);
                  setCurrentPage(0);
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Validation Message */}
          {!canSubmit && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              Please select a district and date filters to view or generate this
              report.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="text-sm text-gray-600">{showingText}</div>

            <div className="flex items-center gap-3">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={loading || !hasPrev}
              >
                Prev
              </Button>

              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={loading || !hasNext}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Download Link Display
          {downloadUrl && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800 mb-1">
                Excel report ready!
              </div>
              <a
                className="text-sm text-blue-600 break-all underline hover:text-blue-800"
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                {downloadUrl}
              </a>
            </div>
          )} */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3">SR.No</th>
                  <th className="px-4 py-3">Center Name</th>
                  <th className="px-4 py-3">Center Address</th>
                  <th className="px-4 py-3">Workshop Name</th>
                  <th className="px-4 py-3">Workshop Date</th>
                  <th className="px-4 py-3">From Time</th>
                  <th className="px-4 py-3">To Time</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">VLE Name</th>
                  <th className="px-4 py-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-gray-500">
                      {loading
                        ? "Loading..."
                        : error ||
                          "No data found. Please select a district and click View Report."}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {currentPage * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-3">{r.center_name}</td>
                      <td className="px-4 py-3">{r.center_address}</td>
                      <td className="px-4 py-3">{r.workshop_name}</td>
                      <td className="px-4 py-3">{r.workshop_date}</td>
                      <td className="px-4 py-3">{r.workshop_from_time}</td>
                      <td className="px-4 py-3">{r.workshop_to_time}</td>
                      <td className="px-4 py-3">{r.district}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            r.workshop_status === "Pending"
                              ? "bg-amber-100 text-amber-800"
                              : r.workshop_status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {r.workshop_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.vle_name}</td>
                      <td className="px-4 py-3">{r.created_at}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
