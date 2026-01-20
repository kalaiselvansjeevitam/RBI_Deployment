/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadDistrictWiseWorkshopReport,
  useViewDistrictWiseByStatusWorkshopReport,
  type DistrictStatusRow,
} from "../../../app/core/api/RBIReports";

function isSuccess(x: any) {
  return (
    String(x?.status ?? "")
      .trim()
      .toLowerCase() === "success"
  );
}

const PAGE_SIZE = 8;

export default function DistrictStatusReport() {
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: viewReport } =
    useViewDistrictWiseByStatusWorkshopReport();
  const { mutateAsync: download } = useDownloadDistrictWiseWorkshopReport();

  // Unified state for both view and download
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [allRows, setAllRows] = useState<DistrictStatusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  // Load districts list once
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
    try {
      setLoading(true);
      setCurrentPage(0);
      const res = await viewReport({
        district: selectedDistrict.trim() ? selectedDistrict.trim() : "",
        offset: 0,
      });
      if (isSuccess(res)) {
        const data = Array.isArray(res?.data) ? res.data : [];
        setAllRows(data);
      } else {
        console.error("View report error:", res?.message);
        setAllRows([]);
      }
    } catch (e) {
      console.error("View report failed:", e);
      setAllRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloadUrl("");
      setDownloading(true);

      const response = await download({ district: selectedDistrict });

      // Extract URL from response
      const url =
        typeof response?.data === "string" && response.data.trim()
          ? response.data.trim()
          : "";

      // Check if successful
      const isSuccessful =
        String(response?.result ?? "")
          .trim()
          .toLowerCase() === "success";

      if (isSuccessful) {
        if (!url) {
          // Success but no URL - likely no data for filters
          const msg = String(response?.message ?? "")
            .trim()
            .toLowerCase();
          if (
            msg.includes("no data") ||
            msg.includes("not found") ||
            msg.includes("empty")
          ) {
            toast.info("No data available for the selected filters.");
          } else {
            toast.error("Report generated but no download link was provided");
          }
          return;
        }

        // Success with URL
        setDownloadUrl(url);
        toast.success(
          "Report generated successfully! Click 'Download Excel' to download.",
        );
      } else {
        // Not successful
        const msg = String(response?.message ?? "").trim();
        toast.error(msg || "Failed to generate report");
      }
    } catch (e: any) {
      console.error("Download failed:", e);
      toast.error(e?.message || "Failed to generate report");
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
    toast.success("Download Successful");
  };

  // Initial load
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <Layout headerTitle="District-wise Workshop Status Report">
      <div className="p-6">
        {/* Merged Card */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">
            District-wise Workshop Report
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            View report data in the table below and download as Excel. District
            filter is optional.
          </p>

          {/* Filters and Actions */}
          <div className="flex flex-wrap gap-4 items-end justify-between mb-6">
            <div className="flex flex-col gap-1 min-w-[280px]">
              <label className="text-sm text-gray-600">
                District (optional)
              </label>
              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">All districts</option>
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
                  placeholder="e.g., Ahmednagar"
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                className="cursor-pointer"
                onClick={fetchData}
                disabled={loading || downloading}
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
                disabled={loading || downloading}
              >
                {downloading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating
                  </span>
                ) : (
                  "Generate Excel"
                )}
              </Button>

              {downloadUrl && (
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  onClick={handleOpenDownload}
                >
                  Download Excel
                </Button>
              )}

              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => {
                  setSelectedDistrict("");
                  setDownloadUrl("");
                  setTimeout(() => {
                    fetchData();
                  }, 0);
                }}
                disabled={loading || downloading}
              >
                Clear
              </Button>
            </div>
          </div>

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
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b bg-gray-50">
                  <th className="py-3 px-4">SR.No</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Rejected</th>
                  <th className="py-3 px-4">&lt; 50 Citizens</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={7}>
                      {loading ? "Loading..." : "No data found."}
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r, idx) => (
                    <tr
                      key={`${r.district}-${idx}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {currentPage * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-3 px-4">{r.district}</td>
                      <td className="py-3 px-4">
                        {Number(r.pending_count ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        {Number(r.completed_count ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        {Number(r.approved_count ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        {Number(r.rejected_count ?? 0)}
                      </td>
                      <td className="py-3 px-4">
                        {Number(r.citizens_count_lessthan_50 ?? 0)}
                      </td>
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
