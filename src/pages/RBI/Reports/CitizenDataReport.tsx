/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";

import {
  useDownloadCitizenDataByDistrictReport,
  useViewCitizenDataByDistrictReport,
  type CitizenRow,
} from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";
import { useGetDistrictParams } from "../../../app/core/api/Admin";

const PAGE_SIZE = 10;

export default function CitizenDataReport() {
  const { mutateAsync: fetchView } = useViewCitizenDataByDistrictReport();
  const { mutateAsync: download } = useDownloadCitizenDataByDistrictReport();

  // Separate state for download card
  const [downloadDistrict, setDownloadDistrict] = useState("");
  const [downloadStartDate, setDownloadStartDate] = useState("");
  const [downloadEndDate, setDownloadEndDate] = useState("");

  // Separate state for table (all optional)
  const [tableDistrict, setTableDistrict] = useState("");
  const [tableStartDate, setTableStartDate] = useState("");
  const [tableEndDate, setTableEndDate] = useState("");

  const [rows, setRows] = useState<CitizenRow[]>([]);
    const { mutateAsync: getDistricts } = useGetDistrictParams();
  const [districtList, setDistrictList] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDownload = downloadDistrict && downloadStartDate && downloadEndDate;

  const load = async (opts?: { reset?: boolean; offsetOverride?: number }) => {
    // District is required by the API
    if (!tableDistrict) {
      setError("Please enter a district to view data");
      return;
    }

    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    setLoading(true);
    setError("");

    try {
      // Build the payload - district is required, dates are optional
      const payload: any = {
        district: tableDistrict,
        offset: nextOffset,
      };

      if (tableStartDate) {
        payload.start_date = tableStartDate;
      }
      if (tableEndDate) {
        payload.end_date = tableEndDate;
      }

      console.log("Fetching with payload:", payload);

      const res = await fetchView(payload);

      console.log("API Response:", res);

      if (res?.status !== "Success") {
        setRows([]);
        setTotal(0);
        setError(res?.message || "Failed to fetch data");
        return;
      }

      setRows(res.data ?? []);
      setTotal(Number(res.count ?? 0));
      setOffset(nextOffset);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err?.message || "An error occurred while fetching data");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const showing = useMemo(() => {
    if (!total) return "0–0";
    return `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)}`;
  }, [offset, total]);
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
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">View Report Data</h2>

          {/* Table Filters - All Optional */}
          <div className="grid md:grid-cols-4 gap-4 items-end mb-6">
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
            <div>
              <label className="text-sm text-gray-600">
                Start Date (optional)
              </label>
              <Input
                type="date"
                value={tableStartDate}
                onChange={(e) => setTableStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                End Date (optional)
              </label>
              <Input
                type="date"
                value={tableEndDate}
                onChange={(e) => setTableEndDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => load({ reset: true })} disabled={loading}>
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Apply Filters"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTableDistrict("");
                  setTableStartDate("");
                  setTableEndDate("");
                  setError("");
                  load({ reset: true });
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
          <div className="flex justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {showing} of {total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={offset === 0 || loading}
                onClick={() => load({ offsetOverride: offset - PAGE_SIZE })}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                disabled={offset + PAGE_SIZE >= total || loading}
                onClick={() => load({ offsetOverride: offset + PAGE_SIZE })}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    S.No
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    District
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    VLE Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Citizen Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Address
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-gray-500">
                      {loading ? "Loading..." : "No data found"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{offset + i + 1}</td>
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
