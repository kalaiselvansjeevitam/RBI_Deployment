/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadLocationManagerWiseWorkshopReport,
  useViewLocationManagerWiseWorkshopReport,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";

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

export default function LocationScheduleReport() {
  const { mutateAsync: download } =
    useDownloadLocationManagerWiseWorkshopReport();
  const { mutateAsync: viewReport } =
    useViewLocationManagerWiseWorkshopReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");

  // Separate state for table
  const [tableDistrict, setTableDistrict] = useState("");
  const [tableStartDate, setTableStartDate] = useState("");
  const [tableEndDate, setTableEndDate] = useState("");

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<LocationRow[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDownload = Boolean(downloadDistrict);

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
    if (!tableDistrict) {
      setError("Please select a district to view data");
      setAllRows([]);
      return;
    }

    setLoading(true);
    setError("");
    setCurrentPage(0);

    try {
      const payload: any = {
        district: tableDistrict,
        offset: 0,
      };

      if (tableStartDate) {
        payload.start_date = tableStartDate;
      }
      if (tableEndDate) {
        payload.end_date = tableEndDate;
      }

      console.log("Fetching with payload:", payload);

      const res = await viewReport(payload);

      console.log("API Response:", res);

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

  return (
    <Layout headerTitle="Location-wise Workshop Schedule Report">
      <div className="p-6 space-y-6">
        {/* Download Card */}
        <ReportDownloadCard
          title="Download Location(Center)-Wise Workshop [Scheduled/Pending] Report"
          description="District is required. Date filters are required."
          filtersSlot={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600">
                  District (required)
                </label>
                {districtList.length > 0 ? (
                  <select
                    className="border rounded-md h-10 px-3 w-full"
                    value={downloadDistrict}
                    onChange={(e) => setDownloadDistrict(e.target.value)}
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
                    value={downloadDistrict}
                    onChange={(e) => setDownloadDistrict(e.target.value)}
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
                  value={downloadStartDate}
                  onChange={(e) => setDownloadStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  End Date (required)
                </label>
                <Input
                  type="date"
                  value={downloadEndDate}
                  onChange={(e) => setDownloadEndDate(e.target.value)}
                />
              </div>

              {!canDownload && (
                <div className="md:col-span-3 text-sm text-amber-600">
                  Please select district to generate this report.
                </div>
              )}
            </div>
          }
          onGenerate={async () => {
            if (!canDownload) {
              return {
                result: "Error",
                message: "District is required",
                data: "",
              };
            }
            return download({
              district: downloadDistrict,
              start_date: downloadStartDate || undefined,
              end_date: downloadEndDate || undefined,
            });
          }}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          {/* Table Filters */}
          <div className="grid md:grid-cols-4 gap-4 items-end mb-6">
            <div>
              <label className="text-sm text-gray-600">
                District (required)
              </label>
              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={tableDistrict}
                  onChange={(e) => setTableDistrict(e.target.value)}
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
                  value={tableDistrict}
                  onChange={(e) => setTableDistrict(e.target.value)}
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
                value={tableStartDate}
                onChange={(e) => setTableStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                End Date (required)
              </label>
              <Input
                type="date"
                value={tableEndDate}
                onChange={(e) => setTableEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={fetchData}
                disabled={loading}
                className=" cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading
                  </span>
                ) : (
                  "Apply"
                )}
              </Button>
              <Button
                className=" cursor-pointer"
                variant="outline"
                onClick={() => {
                  setTableDistrict("");
                  setTableStartDate("");
                  setTableEndDate("");
                  setError("");
                  setAllRows([]);
                  setCurrentPage(0);
                }}
              >
                Clear
              </Button>
            </div>
          </div>

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
                          "No data found. Please select a district, start + end date and click Apply."}
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
