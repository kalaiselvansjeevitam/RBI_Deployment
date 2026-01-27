/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadGenderWiseWorkshopReport,
  useViewGenderWiseWorkshopReport,
  type GenderWorkshopRow,
} from "../../../app/core/api/RBIReports";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const toNum = (x: any) => Number(x) || 0;

export default function GenderParticipationReport() {
  const { mutateAsync: fetchView } = useViewGenderWiseWorkshopReport();
  const { mutateAsync: download } = useDownloadGenderWiseWorkshopReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  // Unified state
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [rows, setRows] = useState<GenderWorkshopRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

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

  const load = async (opts?: { reset?: boolean; offsetOverride?: number }) => {
    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    try {
      setLoading(true);

      const res = await fetchView({
        district: selectedDistrict.trim() || undefined,
        offset: nextOffset,
      });

      if (res?.status !== "Success") {
        setRows([]);
        setTotal(0);
        return;
      }

      setRows(res.data ?? []);
      setTotal(Number(res.count ?? 0));
      setOffset(nextOffset);
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async () => {
    try {
      setLoading(true);

      // No filters required for this download
      const res = await await download({
        district: selectedDistrict || undefined,
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

  // Initial load
  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showing = useMemo(() => {
    if (!total) return "0–0";
    return `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)}`;
  }, [offset, total]);
  const navigate = useNavigate();

  return (
    <Layout headerTitle="Gender-wise Workshop Participation Report">
      <div className="p-6">
        {/* Merged Card */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Gender-wise & District-wise Workshop Report
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
                  placeholder="e.g., Springfield"
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                className="cursor-pointer"
                onClick={() => load({ reset: true })}
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
                  setTimeout(() => {
                    load({ reset: true });
                  }, 0);
                }}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between mb-4 flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Showing {showing} of {total}
            </div>

            <div className="flex gap-2">
              <Button
                className="cursor-pointer"
                variant="outline"
                disabled={!canPrev || loading}
                onClick={() => load({ offsetOverride: offset - PAGE_SIZE })}
              >
                Prev
              </Button>
              <Button
                className="cursor-pointer"
                variant="outline"
                disabled={!canNext || loading}
                onClick={() => load({ offsetOverride: offset + PAGE_SIZE })}
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
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    SR.No
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    District
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Block Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Gram Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Male
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Female
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-gray-500">
                      {loading ? "Loading..." : "No data found"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{offset + i + 1}</td>
                      <td className="px-4 py-3">{r.district}</td>
                      <td className="px-4 py-3">{r.block_panchayat}</td>
                      <td className="px-4 py-3">{r.gram_panchayat}</td>
                      <td className="px-4 py-3">{toNum(r.male_count)}</td>
                      <td className="px-4 py-3">{toNum(r.female_count)}</td>
                      <td className="px-4 py-3">{toNum(r.others_count)}</td>
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
