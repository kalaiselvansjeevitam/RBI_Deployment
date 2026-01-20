/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadCitizenDataByDistrictReport,
  useViewCitizenDataByDistrictReport,
  type CitizenRow,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";

const PAGE_SIZE = 8;

export default function CitizenDataReport() {
  const { mutateAsync: fetchView } = useViewCitizenDataByDistrictReport();
  const { mutateAsync: download } = useDownloadCitizenDataByDistrictReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");

  // Separate state for table - all required
  const [tableDistrict, setTableDistrict] = useState("");
  const [tableStartDate, setTableStartDate] = useState("");
  const [tableEndDate, setTableEndDate] = useState("");

  const [allRows, setAllRows] = useState<CitizenRow[]>([]);
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDownload = downloadDistrict && downloadStartDate && downloadEndDate;

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

  const load = async () => {
    // All fields are required by the API
    if (!tableDistrict || !tableStartDate || !tableEndDate) {
      setError("Please select district, start date, and end date");
      setAllRows([]);
      return;
    }

    setLoading(true);
    setError("");
    setCurrentPage(0);

    try {
      // Build the payload - all fields required
      const payload: any = {
        district: tableDistrict,
        start_date: tableStartDate,
        end_date: tableEndDate,
        offset: 0,
      };

      console.log("Fetching with payload:", payload);

      const res = await fetchView(payload);

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
    <Layout headerTitle="District-wise Citizen Data Report">
      <div className="p-6 space-y-6">
        {/* Download Card */}
        <ReportDownloadCard
          title="Download District-wise Citizens Report"
          description="District + Start Date + End Date are required."
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
                  Please fill district + both dates to generate this report.
                </div>
              )}
            </div>
          }
          onGenerate={async () => {
            if (!canDownload) {
              return {
                result: "Error",
                message: "District, start date, and end date are required",
                data: "",
              };
            }
            return download({
              district: downloadDistrict,
              start_date: downloadStartDate,
              end_date: downloadEndDate,
            });
          }}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          {/* Table Filters - All required */}
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
                onClick={load}
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
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">VLE Name</th>
                  <th className="px-4 py-3">Citizen Name</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">Program</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Address</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-gray-500">
                      {loading
                        ? "Loading..."
                        : error ||
                          "No data found. Please select district, start date, end date and click Apply."}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {currentPage * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-3">{r.district}</td>
                      <td className="px-4 py-3">{r.vle_name}</td>
                      <td className="px-4 py-3">{r.citizen_name}</td>
                      <td className="px-4 py-3">{r.mobile_number}</td>
                      <td className="px-4 py-3">{r.gender}</td>
                      <td className="px-4 py-3">{r.age}</td>
                      <td className="px-4 py-3">{r.program_name}</td>
                      <td className="px-4 py-3">{r.program_date}</td>
                      <td className="px-4 py-3">{r.address}</td>
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
