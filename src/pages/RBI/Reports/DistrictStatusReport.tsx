/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadDistrictWiseWorkshopReport,
  useViewDistrictWiseByStatusWorkshopReport,
  type DistrictStatusRow,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";

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

  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");

  // Separate state for table
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [tableDistrict, setTableDistrict] = useState<string>("");

  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [rows, setRows] = useState<DistrictStatusRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [hasNext, setHasNext] = useState(false);

  // load districts list once
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

  const fetchPage = async (nextOffset: number, reset = false) => {
    try {
      setLoading(true);

      const res = await viewReport({
        district: tableDistrict.trim() ? tableDistrict.trim() : "",
        offset: nextOffset,
      });

      if (isSuccess(res)) {
        const data = Array.isArray(res?.data) ? res.data : [];
        setRows(data);
        setTotalCount(Number(res?.count ?? 0));

        // next page exists if backend has more after this offset
        setHasNext(nextOffset + PAGE_SIZE < Number(res?.count ?? 0));

        if (reset) setOffset(nextOffset);
      } else {
        console.error("View report error:", res?.message);
        setRows([]);
        setTotalCount(0);
        setHasNext(false);
        if (reset) setOffset(nextOffset);
      }
    } catch (e) {
      console.error("View report failed:", e);
      setRows([]);
      setTotalCount(0);
      setHasNext(false);
      if (reset) setOffset(nextOffset);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchPage(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showingText = useMemo(() => {
    if (totalCount === 0) return "Showing 0–0 of 0";
    const start = offset + 1;
    const end = Math.min(offset + rows.length, totalCount);
    return `Showing ${start}–${end} of ${totalCount}`;
  }, [offset, rows.length, totalCount]);

  return (
    <Layout headerTitle="District-wise Workshop Status Report">
      <div className="p-6 space-y-6">
        {/* Download Card */}
        <ReportDownloadCard
          key={downloadDistrict}
          title="Download District-wise Workshop Report"
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
          onGenerate={async () => download({ district: downloadDistrict })}
        />
        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-end justify-between mb-6">
            <div className="flex flex-col gap-1 min-w-[280px]">
              <label className="text-sm text-gray-600">
                District (optional)
              </label>

              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3"
                  value={tableDistrict}
                  onChange={(e) => setTableDistrict(e.target.value)}
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
                  placeholder="e.g., Ahmednagar"
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                className=" cursor-pointer"
                onClick={() => fetchPage(0, true)}
                disabled={loading}
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
                  setTimeout(() => {
                    fetchPage(0, true);
                  }, 0);
                }}
                disabled={loading}
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
                className=" cursor-pointer"
                variant="outline"
                onClick={() => {
                  const next = Math.max(0, offset - PAGE_SIZE);
                  setOffset(next);
                  fetchPage(next);
                }}
                disabled={loading || offset === 0}
              >
                Prev
              </Button>

              <Button
                className=" cursor-pointer"
                variant="outline"
                onClick={() => {
                  const next = offset + PAGE_SIZE;
                  setOffset(next);
                  fetchPage(next);
                }}
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
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">VLE</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Approved</th>
                  <th className="py-3 px-4">Rejected</th>
                  <th className="py-3 px-4">&lt; 50 Citizens</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={9}>
                      {loading ? "Loading..." : "No data found."}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr
                      key={`${r.district}-${r.vle_id}-${idx}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{offset + idx + 1}</td>
                      <td className="py-3 px-4">{r.district}</td>
                      <td className="py-3 px-4">{r.vle_name}</td>
                      <td className="py-3 px-4">{r.location}</td>
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