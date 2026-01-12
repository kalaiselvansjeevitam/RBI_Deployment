/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

import {
  useDownloadDistrictWiseWorkshopReport,
  useViewDistrictWiseWorkshopReport,
  type DistrictWorkshopRow,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";
import { useGetDistrictParams } from "../../../app/core/api/Admin";

const PAGE_SIZE = 10;

function toNum(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

export default function DistrictPendingCompleteReport() {
  const { mutateAsync: fetchView } = useViewDistrictWiseWorkshopReport();
  const { mutateAsync: download } = useDownloadDistrictWiseWorkshopReport();
  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");

  // Separate state for table
  const [tableDistrict, setTableDistrict] = useState("");
  const [rows, setRows] = useState<DistrictWorkshopRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;
  const { mutateAsync: getDistricts } = useGetDistrictParams();
    const [districtList, setDistrictList] = useState<string[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const districtRes = await getDistricts();
        const districts =
          districtRes?.list ??
          [];

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

  const load = async (opts?: { offsetOverride?: number; reset?: boolean }) => {
    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    try {
      setLoading(true);

      const res = await fetchView({
        district: tableDistrict.trim() ? tableDistrict.trim() : undefined,
        offset: nextOffset,
      });

      const ok =
        String((res as any)?.status ?? "")
          .trim()
          .toLowerCase() === "success";

      if (!ok) {
        setRows([]);
        setTotal(0);
        console.error("VIEW report failed:", (res as any)?.message);
        return;
      }

      const data = Array.isArray((res as any)?.data) ? (res as any).data : [];
      const count = toNum((res as any)?.count);

      setRows(data);
      setTotal(count);

      if (opts?.reset) setOffset(0);
      else setOffset(nextOffset);
    } catch (e) {
      console.error("VIEW report load error:", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // auto-load on first render
  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApply = async () => {
    await load({ reset: true });
  };

  const onClear = async () => {
    setTableDistrict("");
    setTimeout(() => {
      load({ offsetOverride: 0, reset: true });
    }, 0);
  };

  const showingText = useMemo(() => {
    if (total === 0) return "0–0";
    const start = offset + 1;
    const end = Math.min(offset + PAGE_SIZE, total);
    return `${start}–${end}`;
  }, [offset, total]);

  return (
    <Layout headerTitle="District-wise Pending VS Completed Workshop Report">
      <div className="p-6 space-y-6">
        {/* Download Card */}
        <ReportDownloadCard
          title="District-wise Pending VS Completed Workshop Report"
          description="District filter is optional. Generates an Excel download link."
          filtersSlot={
            <div>
              <label className="text-sm text-gray-600">
                District (optional)
              </label>
              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={downloadDistrict}
                  onChange={(e) => {
                    setDownloadDistrict(e.target.value);
                    if (e.target.value === "") {
                      // Add any reset logic here if needed
                      // For example, clearing the download link state in ReportDownloadCard
                    }
                  }}
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
                  value={downloadDistrict}
                  onChange={(e) => setDownloadDistrict(e.target.value)}
                  placeholder="e.g., Springfield"
                />
              )}
            </div>
          }
          onGenerate={async () =>
            download({
              district: downloadDistrict.trim()
                ? downloadDistrict.trim()
                : undefined,
            })
          }
          // onClear={() => setDownloadDistrict("")}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
            <div>
              <label className="text-sm text-gray-600">
                District (optional)
              </label>
              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={tableDistrict}
                  onChange={(e) => {
                    setTableDistrict(e.target.value);
                    if (e.target.value === "") {
                      // Add any reset logic here if needed
                      // For example, clearing the download link state in ReportDownloadCard
                    }
                  }}
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
                  value={tableDistrict}
                  onChange={(e) => setTableDistrict(e.target.value)}
                  placeholder="e.g., Springfield"
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={onApply} disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading
                  </span>
                ) : (
                  "Apply"
                )}
              </Button>

              <Button variant="outline" onClick={onClear} disabled={loading}>
                Clear
              </Button>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Total rows: {total} • Showing {showingText}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!canPrev || loading}
                onClick={() =>
                  load({ offsetOverride: Math.max(0, offset - PAGE_SIZE) })
                }
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={!canNext || loading}
                onClick={() => load({ offsetOverride: offset + PAGE_SIZE })}
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
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Rejected</th>
                  <th className="py-3 px-4">Cancelled</th>
                  <th className="py-3 px-4">Workshops &lt; 50</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={8}>
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={8}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr
                      key={`${r.district}-${idx}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{offset + idx + 1}</td>
                      <td className="py-3 px-4">{r.district}</td>
                      <td className="py-3 px-4">{toNum(r.pending_count)}</td>
                      <td className="py-3 px-4">{toNum(r.approved_count)}</td>
                      <td className="py-3 px-4">{toNum(r.completed_count)}</td>
                      <td className="py-3 px-4">{toNum(r.rejected_count)}</td>
                      <td className="py-3 px-4">{toNum(r.cancelled_count)}</td>
                      <td className="py-3 px-4">{toNum(r.workshops_lt_50)}</td>
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
