/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

import { useGetDistrictParams } from "../../../app/core/api/Admin";
import {
  useDownloadGenderWiseWorkshopReport,
  useViewGenderWiseWorkshopReport,
  type GenderWorkshopRow,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";

const PAGE_SIZE = 10;

const toNum = (x: any) => Number(x) || 0;

export default function GenderParticipationReport() {
  const { mutateAsync: fetchView } = useViewGenderWiseWorkshopReport();
  const { mutateAsync: download } = useDownloadGenderWiseWorkshopReport();

  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");

  // Separate state for table
  const [tableDistrict, setTableDistrict] = useState("");
  const [rows, setRows] = useState<GenderWorkshopRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const load = async (opts?: { reset?: boolean; offsetOverride?: number }) => {
    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    try {
      setLoading(true);

      const res = await fetchView({
        district: tableDistrict.trim() || undefined,
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

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showing = useMemo(() => {
    if (!total) return "0–0";
    return `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)}`;
  }, [offset, total]);
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
    <Layout headerTitle="Gender-wise Workshop Participation Report">
      <div className="p-6 space-y-6">
        {/* Download Card */}
        <ReportDownloadCard
          key={downloadDistrict}
          title="Download Gender-wise & District-wise Workshop Report"
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
            download({ district: downloadDistrict || undefined })
          }
        />

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          <div className="flex gap-3 items-end flex-wrap mb-6">
            <div>
              <label className="text-sm text-gray-600">
                Filter by District
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

            <Button
              className=" cursor-pointer"
              onClick={() => load({ reset: true })}
              disabled={loading}
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : "Apply"}
            </Button>

            <Button
              className=" cursor-pointer"
              variant="outline"
              onClick={() => {
                setTableDistrict("");
                setTimeout(() => {
                  load({ reset: true });
                }, 0);
              }}
              disabled={loading}
            >
              Clear
            </Button>
          </div>

          <div className="flex justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {showing} of {total}
            </div>

            <div className="flex gap-2">
              <Button
                className=" cursor-pointer"
                variant="outline"
                disabled={!canPrev}
                onClick={() => load({ offsetOverride: offset - PAGE_SIZE })}
              >
                Prev
              </Button>
              <Button
                className=" cursor-pointer"
                variant="outline"
                disabled={!canNext}
                onClick={() => load({ offsetOverride: offset + PAGE_SIZE })}
              >
                Next
              </Button>
            </div>
          </div>

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
                    Location
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Topic
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
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-4 py-3">{r.topic}</td>
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
