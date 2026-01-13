import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import type { ViewLt50Row } from "../../../app/core/api/RBIReports";
import {
  useDownloadCitizenCountLessThan50Report,
  useViewCitizenCountLessThan50Report,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";
import { useGetDistrictParams } from "../../../app/core/api/Admin";

const PAGE_SIZE = 10;
const PREVIEW_COUNT = 5;

export default function WorkshopsLt50Report() {
  const { mutateAsync: fetchLt50 } = useViewCitizenCountLessThan50Report();
  const { mutateAsync: download } = useDownloadCitizenCountLessThan50Report();

  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");

  // State for table
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<ViewLt50Row[]>([]);
  const [expanded, setExpanded] = useState(false);

  const canDownload = Boolean(downloadDistrict);
  const hasNext = useMemo(() => offset + PAGE_SIZE < total, [offset, total]);

  const shownRows = useMemo(() => {
    if (expanded) return rows;
    return rows.slice(0, PREVIEW_COUNT);
  }, [rows, expanded]);

  const fetchPage = async (nextOffset: number) => {
    try {
      setLoading(true);

      const res = await fetchLt50({ offset: nextOffset });
      console.log("LT50 raw response:", res);

      const status = String(res?.status ?? res?.result ?? "").toLowerCase();

      const isSuccess = status === "success";

      const dataList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.list)
          ? res.list
          : [];

      const totalCount = Number(res?.count ?? res?.total ?? 0);

      if (isSuccess) {
        setRows(dataList);
        setTotal(totalCount);
        setOffset(nextOffset);
        setExpanded(false);
      } else {
        console.error("LT50 API error:", res?.message);
        setRows([]);
        setTotal(0);
      }
    } catch (e) {
      console.error("LT50 fetch failed:", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showingText = useMemo(() => {
    if (total === 0) return "Showing 0–0 of 0";
    const start = offset + 1;
    const end = Math.min(offset + rows.length, total);
    return `Showing ${start}–${end} of ${total}`;
  }, [offset, rows.length, total]);

  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const [districtList, setDistrictList] = useState<string[]>([]);
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

  return (
    <Layout headerTitle="Workshops < 50 Attendees Report">
      <div className="p-6 space-y-6">
        {/* Download Card */}
        <ReportDownloadCard
          title="Download Workshop < 50 Citizens Report"
          description="District is required. Date filters are optional."
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

              <div>
                <label className="text-sm text-gray-600">
                  Start Date (optional)
                </label>
                <Input
                  type="date"
                  value={downloadStartDate}
                  onChange={(e) => setDownloadStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  End Date (optional)
                </label>
                <Input
                  type="date"
                  value={downloadEndDate}
                  onChange={(e) => setDownloadEndDate(e.target.value)}
                />
              </div>

              {!canDownload && (
                <div className="md:col-span-3 text-sm text-amber-600">
                  Please enter district to generate this report.
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
          // onClear={() => {
          //   setDownloadDistrict("");
          //   setDownloadStartDate("");
          //   setDownloadEndDate("");
          // }}
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="text-sm text-gray-500">{showingText}</div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))}
                disabled={loading || offset === 0}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                onClick={() => fetchPage(offset + PAGE_SIZE)}
                disabled={loading || !hasNext}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b bg-gray-50">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">VLE Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Citizens Count</th>
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
                    <td className="py-6 text-center text-gray-500" colSpan={6}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  shownRows.map((r, idx) => (
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{offset + idx + 1}</td>
                      <td className="py-3 px-4">{r.vle_name}</td>
                      <td className="py-3 px-4">{r.district}</td>
                      <td className="py-3 px-4">{r.location}</td>
                      <td className="py-3 px-4">{r.date}</td>
                      <td className="py-3 px-4">
                        {Number(r.citizens_count ?? 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* View more / View less */}
          {rows.length > PREVIEW_COUNT && (
            <div className="mt-4 flex items-center justify-end">
              <Button
                variant="outline"
                onClick={() => setExpanded((v) => !v)}
                disabled={loading}
              >
                {expanded
                  ? "View less"
                  : `View more (${rows.length - PREVIEW_COUNT})`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
