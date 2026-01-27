/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { useGetDistrictParams } from "../../../app/core/api/Admin";
import type { ViewLt50Row } from "../../../app/core/api/RBIReports";
import {
  useDownloadCitizenCountLessThan50Report,
  useViewCitizenCountLessThan50Report,
} from "../../../app/core/api/RBIReports";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 8;

export default function SubWorkshopsLt50Report() {
  const { mutateAsync: fetchLt50 } = useViewCitizenCountLessThan50Report();
  const { mutateAsync: download } = useDownloadCitizenCountLessThan50Report();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  // Unified state
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<ViewLt50Row[]>([]);

  // const [appliedDistrict, setAppliedDistrict] = useState("");
  // const [appliedStartDate, setAppliedStartDate] = useState("");
  // const [appliedEndDate, setAppliedEndDate] = useState("");

  const canSubmit = Boolean(selectedDistrict);
  const hasNext = useMemo(() => offset + PAGE_SIZE < total, [offset, total]);

  // Load districts
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

  const fetchPage = async (nextOffset: number) => {
    try {
      setLoading(true);

      // Note: The view API does not support filtering - it returns all data
      // Filtering is only available for the download operation
      const res = await fetchLt50({ offset: nextOffset });

      const status = String(res?.result ?? "").toLowerCase();
      const isSuccess = status === "success";

      const dataList = Array.isArray(res?.list)
        ? res.list
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const totalCount = Number(res?.total ?? res?.count ?? 0);

      if (isSuccess) {
        setRows(dataList);
        setTotal(totalCount);
        setOffset(nextOffset);
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

  const handleDownload = async () => {
    if (!canSubmit) {
      toast.error("Please select a district");
      return;
    }

    try {
      setLoading(true);

      const response = await download({
        district: selectedDistrict,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      const url =
        typeof response?.data === "string" && response.data.trim()
          ? response.data.trim()
          : "";

      const isSuccessful =
        String(response?.result ?? "")
          .trim()
          .toLowerCase() === "success";

      if (!isSuccessful || !url) {
        toast.error(response?.message || "Failed to download report");
        return;
      }

      // ✅ DIRECT DOWNLOAD
      window.open(url, "_blank", "noopener,noreferrer");
      toast.success("Excel report downloaded successfully");
    } catch (e: any) {
      console.error("Download failed:", e);
      toast.error(e?.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  // const handleViewReport = () => {
  //   // Save the current filter values as "applied" filters
  //   setAppliedDistrict(selectedDistrict);
  //   setAppliedStartDate(startDate);
  //   setAppliedEndDate(endDate);
  //   // Fetch with offset 0
  //   fetchPage(0);
  // };

  // Initial load - without filters
  // useEffect(() => {
  //   fetchPage(0);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [appliedDistrict, appliedStartDate, appliedEndDate]);

  const showingText = useMemo(() => {
    if (total === 0) return "Showing 0–0 of 0";
    const start = offset + 1;
    const end = Math.min(offset + rows.length, total);
    return `Showing ${start}–${end} of ${total}`;
  }, [offset, rows.length, total]);
  const navigate = useNavigate();

  return (
    <Layout headerTitle="Workshops < 50 Attendees Report">
      <div className="p-6">
        {/* Merged Card */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Workshops with &lt; 50 Citizens Report
            </h2>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            View all report data in the table below. To download filtered data
            by district and date range, use the filters and click "Generate
            Excel". Note: Table view shows all data, filters only apply to Excel
            download.
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                End Date (optional)
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
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Validation Message */}
          {!canSubmit && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              💡 The table shows all workshop data. To download a filtered Excel
              report by district and date range, select filters above and click
              "Download Excel".
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div className="text-sm text-gray-600">{showingText}</div>

            <div className="flex gap-2">
              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => fetchPage(Math.max(0, offset - PAGE_SIZE))}
                disabled={loading || offset === 0}
              >
                Prev
              </Button>

              <Button
                className="cursor-pointer"
                variant="outline"
                onClick={() => fetchPage(offset + PAGE_SIZE)}
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
                      No data found. Please select a district and click View
                      Report.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr
                      key={`${r.vle_name}-${r.district}-${idx}`}
                      className="border-b hover:bg-gray-50"
                    >
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
        </div>
      </div>
    </Layout>
  );
}
