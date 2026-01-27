/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadDistrictWiseByStatusWorkshopReport,
  useViewDistrictWiseByStatusWorkshopReport,
  type DistrictStatusRow,
} from "../../../app/core/api/RBIReports";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

function toNum(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export default function SubDistrictPendingCompleteReport() {
  const { mutateAsync: viewReport } =
    useViewDistrictWiseByStatusWorkshopReport();
  const { mutateAsync: download } =
    useDownloadDistrictWiseByStatusWorkshopReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  // Unified filter state (used for VIEW; download has no filters)
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<DistrictStatusRow[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [loading, setLoading] = useState(false);

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

  const fetchData = async (opts?: { resetPage?: boolean }) => {
    try {
      setLoading(true);
      if (opts?.resetPage) setCurrentPage(0);

      const res = await viewReport({
        district: selectedDistrict.trim() ? selectedDistrict.trim() : "",
        offset: 0,
      });

      const ok =
        String(res?.status ?? "")
          .trim()
          .toLowerCase() === "success";

      if (!ok) {
        setAllRows([]);
        toast.error(String(res?.message ?? "Failed to load report"));
        return;
      }

      const data = Array.isArray(res?.data) ? res.data : [];
      setAllRows(data);
    } catch (e: any) {
      console.error("VIEW report load error:", e);
      setAllRows([]);
      toast.error(e?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      setLoading(true);

      // No filters required for this download
      const res = await download();

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

  // Auto-load on first render
  useEffect(() => {
    fetchData({ resetPage: true });
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
    <Layout headerTitle="District-wise Pending VS Completed Workshop Report">
      <div className="p-6">
        {/* Merged Card */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              District-wise Pending VS Completed Workshop Report
            </h2>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            View report data in the table below (district filter optional).
            Excel download generates the complete report for all districts.
          </p>

          {/* Filters + Actions */}
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

            <div className="flex gap-3 flex-wrap">
              <Button
                className="cursor-pointer"
                onClick={() => fetchData({ resetPage: true })}
                disabled={loading}
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
                disabled={loading}
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
                  setAllRows([]);
                  setCurrentPage(0);
                  setTimeout(() => {
                    fetchData({ resetPage: true });
                  }, 0);
                }}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Download Link Banner
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
                  <th className="py-3 px-4">VLE Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Rejected</th>
                  <th className="py-3 px-4">&lt; 50 Citizens</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={9}>
                      <span className="inline-flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    </td>
                  </tr>
                ) : paginatedRows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={9}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r, idx) => (
                    <tr
                      key={`${r.district}-${r.vle_id}-${idx}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {currentPage * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-3 px-4">{r.district}</td>
                      <td className="py-3 px-4">{r.vle_name}</td>
                      <td className="py-3 px-4">{r.location}</td>
                      <td className="py-3 px-4">{toNum(r.pending_count)}</td>
                      <td className="py-3 px-4">{toNum(r.completed_count)}</td>
                      <td className="py-3 px-4">{toNum(r.approved_count)}</td>
                      <td className="py-3 px-4">{toNum(r.rejected_count)}</td>
                      <td className="py-3 px-4">
                        {toNum(r.citizens_count_lessthan_50)}
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
