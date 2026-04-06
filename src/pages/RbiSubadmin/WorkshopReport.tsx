/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../app/components/Layout/Layout";
import { Button } from "../../app/components/ui/button";
import {
  usedownloadWorkshopRBISubAdmin,
  useViewRBISubAdminWorkshopReport,
  type RBISubAdminWorkshopReportRow,
} from "../../app/core/api/RBIReports";
import Swal from "sweetalert2";

const TABLE_COLS = 10;
const PAGE_SIZE = 10;

export default function RBISubAdminWorkshopReport() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { mutateAsync: fetchView } = useViewRBISubAdminWorkshopReport();
  const { mutateAsync: downloadReport } = usedownloadWorkshopRBISubAdmin();

  const [rows, setRows] = useState<RBISubAdminWorkshopReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);

  const [offset, setOffset] = useState(Number(searchParams.get("offset") ?? 0));
  const [downloading, setDownloading] = useState(false);

  const [filtertype, setFilterType] = useState<"Ascending" | "Descending">(
    "Descending",
  );

  /* ---------------- Sync offset in URL ---------------- */
  useEffect(() => {
    setSearchParams({
      offset: String(offset),
    });
  }, [offset, setSearchParams]);
  const handleDownload = async () => {
    try {
      setDownloading(true);

      const res = await downloadReport();

      const url =
        typeof res?.data === "string" && res.data.trim() ? res.data.trim() : "";

      if (!url) {
        throw new Error("Invalid download URL");
      }

      // ✅ Success Alert
      Swal.fire({
        icon: "success",
        title: "Download Started",
        text: "Your report is being downloaded.",
        timer: 2000,
        showConfirmButton: false,
      });

      // 🔥 Trigger download
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      console.error("Download failed:", e);

      // ❌ Error Alert
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: e?.message || "Something went wrong while downloading.",
      });
    } finally {
      setDownloading(false);
    }
  };

  /* ---------------- Fetch Data ---------------- */
  const fetchData = async (
    offsetOverride?: number,
    filterOverride?: "Ascending" | "Descending",
  ) => {
    try {
      setLoading(true);

      const finalOffset = offsetOverride ?? offset;
      const finalFilter = filterOverride ?? filtertype;

      const res = await fetchView({
        offset: finalOffset,
        filter_type: finalFilter,
      });

      console.log("API RESPONSE:", res);

      if (res?.status !== "Success") {
        setRows([]);
        setError(res?.message || "Failed to fetch data");
        return;
      }

      setRows(res.data || []);
      setTotal(res.count || 0);
      setOffset(finalOffset);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Something went wrong");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Initial Load ---------------- */
  useEffect(() => {
    fetchData(offset, filtertype);
  }, []);

  /* ---------------- Toggle Sort ---------------- */
  const toggleSort = () => {
    const next = filtertype === "Ascending" ? "Descending" : "Ascending";

    setFilterType(next);
    fetchData(offset, next); // ✅ KEEP SAME PAGE
  };

  /* ---------------- Pagination ---------------- */

  const startItem = total === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + PAGE_SIZE, total);
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const showingText = `Showing ${startItem} - ${endItem} of ${total}`;

  return (
    <Layout headerTitle="Workshop Report">
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Header */}
          {/* Header + Pagination */}
          <div className="flex flex-col gap-3 mb-4">
            {/* Top Row */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Workshop Report ({total})
              </h2>

              <div className="flex gap-2">
                <Button onClick={() => navigate(-1)}>Back</Button>
              </div>
            </div>

            {/* Pagination Row */}
            <div className="flex justify-between mb-4">
              {/* LEFT SIDE: showing text + download */}
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">{showingText}</div>

                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <Loader className="animate-spin mr-2" />
                      Downloading...
                    </>
                  ) : (
                    "Download Report"
                  )}
                </Button>
              </div>

              {/* RIGHT SIDE: pagination */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!canPrev || loading}
                  onClick={() => fetchData(offset - PAGE_SIZE)}
                >
                  Prev
                </Button>

                <Button
                  variant="outline"
                  disabled={!canNext || loading}
                  onClick={() => fetchData(offset + PAGE_SIZE)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">Workshop ID</th>

                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      Workshop Date
                      <button
                        onClick={toggleSort}
                        className="text-blue-600 text-xs"
                      >
                        {filtertype === "Ascending" ? "▲" : "▼"}
                      </button>
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    VLE Name
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Participants
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    District
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Block
                  </th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">
                    Gram
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={TABLE_COLS} className="text-center py-6">
                      <Loader className="animate-spin inline mr-2" />
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={TABLE_COLS} className="text-center py-6">
                      {error || "No data found"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={r.workshop_id || i} className="border-b">
                      <td className="px-4 py-3">{r.workshop_id || "-"}</td>

                      <td className="px-4 py-3">
                        {r.workshop_date_format || "-"}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.workshop_from_time || "-"} -{" "}
                        {r.workshop_to_time || "-"}
                      </td>

                      <td className="px-4 py-3">{r.workshop_status || "-"}</td>

                      <td className="px-4 py-3">{r.mobile_number || "-"}</td>

                      <td className="px-4 py-3">{r.vle_name || "-"}</td>

                      <td className="px-4 py-3">
                        {r.participants_count || "0"}
                      </td>

                      <td className="px-4 py-3">
                        {r.workshop_district || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {r.workshop_block_panchayat || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {r.workshop_gram_panchayat || "-"}
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
