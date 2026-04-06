/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PAGE_SIZE = 10;

export default function DistrictStatusReport() {
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: viewReport } =
    useViewDistrictWiseByStatusWorkshopReport();
  const { mutateAsync: download } = useDownloadDistrictWiseWorkshopReport();

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [rows, setRows] = useState<DistrictStatusRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* -------------------- Load districts -------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await getDistricts();
        const list = res?.list ?? [];
        const names = Array.isArray(list)
          ? list
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map(String)
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

  /* -------------------- Fetch report -------------------- */
  const fetchData = async (opts?: {
    reset?: boolean;
    offsetOverride?: number;
  }) => {
    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    try {
      setLoading(true);

      const res = await viewReport({
        district: selectedDistrict.trim() || undefined,
        offset: nextOffset,
      });

      if (isSuccess(res)) {
        setRows(res?.data ?? []);
        setTotal(Number(res?.count ?? 0));
        setOffset(nextOffset);
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch (e) {
      console.error("View report failed:", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Initial load -------------------- */
  useEffect(() => {
    fetchData({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- Download -------------------- */
  const handleDownload = async () => {
    try {
      setLoading(true);

      const res = await download({
        district: selectedDistrict || undefined,
      });

      const url =
        typeof res?.data === "string" && res.data.trim() ? res.data.trim() : "";

      const ok =
        String(res?.result ?? "")
          .trim()
          .toLowerCase() === "success";

      if (!ok || !url) {
        toast.error(res?.message || "Failed to download report");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Excel report downloaded successfully");
    } catch (e: any) {
      console.error("Download failed:", e);
      toast.error(e?.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Pagination helpers -------------------- */
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const showingText = useMemo(() => {
    if (!total) return "Showing 0–0 of 0";
    return `Showing ${offset + 1}–${Math.min(
      offset + PAGE_SIZE,
      total,
    )} of ${total}`;
  }, [offset, total]);

  /* -------------------- UI -------------------- */
  return (
    <Layout headerTitle="District-wise Workshop Status Report">
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6 bg-linear-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              District-wise Workshop Report
            </h2>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            View report data and download as Excel. District filter is optional.
          </p>

          {/* Filters */}
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
                  <option value="">Select</option>
                  <option value="All Districts">All Districts</option>
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
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => fetchData({ reset: true })}
                disabled={loading}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "View"}
              </Button>

              <Button onClick={handleDownload} disabled={loading}>
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
                variant="outline"
                onClick={() => {
                  setSelectedDistrict("");
                  setTimeout(() => fetchData({ reset: true }), 0);
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between mb-4">
            <div className="text-sm text-gray-600">{showingText}</div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!canPrev || loading}
                onClick={() =>
                  fetchData({ offsetOverride: offset - PAGE_SIZE })
                }
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={!canNext || loading}
                onClick={() =>
                  fetchData({ offsetOverride: offset + PAGE_SIZE })
                }
              >
                Next
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    SR.No
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    District
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Pending
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Approved
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Rejected
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Rescheduled
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={6}>
                      <span className="inline-flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      {loading ? "Loading..." : "No data found"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{offset + i + 1}</td>
                      <td className="px-4 py-3">{r.district}</td>
                      <td className="px-4 py-3">
                        {Number(r.pending_count ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        {Number(r.completed_count ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        {Number(r.approved_count ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        {Number(r.rejected_count ?? 0)}
                      </td>
                      <td className="px-4 py-3">
                        {Number(r.rescheduled_count ?? 0)}
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
