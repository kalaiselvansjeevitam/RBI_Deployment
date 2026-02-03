/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import {
  useGetBlockPanchayat,
  useGetDistrictParams,
  useGetGramPanchayat,
} from "../../../app/core/api/Admin";
import {
  useDownloadRBIWorkshopReport,
  useViewWorkshopReport,
  type RBIWorkshopReportRow,
} from "../../../app/core/api/RBIReports";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export default function RBIWorkshopReport() {
  const navigate = useNavigate();
  const { mutateAsync: fetchView } = useViewWorkshopReport();
  const { mutateAsync: download } = useDownloadRBIWorkshopReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [rows, setRows] = useState<RBIWorkshopReportRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockList, setBlockList] = useState<any[]>([]);
  const [gramList, setGramList] = useState<any[]>([]);

  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedGram, setSelectedGram] = useState("");

  const [loadingBlock, setLoadingBlock] = useState(false);
  const [loadingGram, setLoadingGram] = useState(false);
  const { mutateAsync: getBlocks } = useGetBlockPanchayat();
  const { mutateAsync: getGrams } = useGetGramPanchayat();

  const canSubmit = Boolean(
    selectedDistrict && startDate && endDate && selectedBlock && selectedGram,
  );
  const canSubmitDownload = Boolean(selectedDistrict && startDate && endDate);

  /* ---------------- Load districts ---------------- */
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
  useEffect(() => {
    if (!selectedDistrict) {
      setBlockList([]);
      setGramList([]);
      setSelectedBlock("");
      setSelectedGram("");
      return;
    }

    (async () => {
      try {
        setLoadingBlock(true);
        const res = await getBlocks({ district: selectedDistrict });
        setBlockList(res?.list ?? []);
      } catch (e) {
        setBlockList([]);
      } finally {
        setLoadingBlock(false);
      }
    })();
  }, [selectedDistrict]);
  useEffect(() => {
    if (!selectedBlock) {
      setGramList([]);
      setSelectedGram("");
      return;
    }

    (async () => {
      try {
        setLoadingGram(true);
        const res = await getGrams({
          block_panchayat_name: selectedBlock,
        });
        setGramList(res?.list ?? []);
      } catch (e) {
        setGramList([]);
      } finally {
        setLoadingGram(false);
      }
    })();
  }, [selectedBlock]);

  /* ---------------- Fetch data ---------------- */
  const fetchData = async (opts?: {
    reset?: boolean;
    offsetOverride?: number;
  }) => {
    if (!canSubmit) {
      setError("Please select district, start date, and end date");
      setRows([]);
      setTotal(0);
      return;
    }

    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    try {
      setLoading(true);
      setError("");

      const res = await fetchView({
        district: selectedDistrict,
        block_panchayat: selectedBlock,
        gram_panchayat: selectedGram,
        start_date: startDate,
        end_date: endDate,
        offset: nextOffset,
      });

      if (res?.status !== "Success") {
        setRows([]);
        setTotal(0);
        setError(res?.message || "Failed to fetch data");
        return;
      }

      setRows(res?.data ?? []);
      setTotal(Number(res?.count ?? 0));
      setOffset(nextOffset);
    } catch (e: any) {
      console.error("Fetch failed:", e);
      setRows([]);
      setTotal(0);
      setError(e?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Download ---------------- */
  const handleDownload = async () => {
    if (!canSubmit) {
      toast.error("Please select district, start date, and end date");
      return;
    }

    try {
      setLoading(true);

      const res = await download({
        district: selectedDistrict,
        block_panchayat: selectedBlock,
        gram_panchayat: selectedGram,
        start_date: startDate,
        end_date: endDate,
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

  /* ---------------- Pagination helpers ---------------- */
  const canPrev = offset > 0;
  const canNext = offset + PAGE_SIZE < total;

  const showingText = useMemo(() => {
    if (!total) return "Showing 0–0 of 0";
    return `Showing ${offset + 1}–${Math.min(
      offset + PAGE_SIZE,
      total,
    )} of ${total}`;
  }, [offset, total]);

  /* ---------------- UI ---------------- */
  return (
    <Layout headerTitle="View Workshop by District, Gram, Panchayat">
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">View Workshop Report</h2>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            {/* ===== Row 1 : Filters ===== */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* District */}
              <div>
                <label className="text-sm text-gray-600">
                  District (required)
                </label>
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="">Select district</option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="text-sm text-gray-600">
                  Block Panchayat (required)
                </label>
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  disabled={!selectedDistrict || loadingBlock}
                >
                  <option value="">
                    {loadingBlock ? "Loading blocks..." : "All blocks"}
                  </option>
                  {blockList.map((b: any) => (
                    <option
                      key={b.block_panchayat_name}
                      value={b.block_panchayat_name}
                    >
                      {b.block_panchayat_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gram */}
              <div>
                <label className="text-sm text-gray-600">
                  Gram Panchayat (required)
                </label>
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedGram}
                  onChange={(e) => setSelectedGram(e.target.value)}
                  disabled={!selectedBlock || loadingGram}
                >
                  <option value="">
                    {loadingGram ? "Loading grams..." : "All gram panchayats"}
                  </option>
                  {gramList.map((g: any) => (
                    <option
                      key={g.gram_panchayat_code}
                      value={g.gram_panchayat_name}
                    >
                      {g.gram_panchayat_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="text-sm text-gray-600">
                  Start Date (required)
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm text-gray-600">
                  End Date (required)
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* ===== Row 2 : Actions (Right aligned) ===== */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => fetchData({ reset: true })}
                disabled={loading || !canSubmit}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "View"}
              </Button>

              <Button
                onClick={handleDownload}
                disabled={loading || !canSubmitDownload}
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
                variant="outline"
                onClick={() => {
                  setSelectedDistrict("");
                  setSelectedBlock("");
                  setSelectedGram("");
                  setStartDate("");
                  setEndDate("");
                  setRows([]);
                  setTotal(0);
                  setOffset(0);
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Messages */}
          {!canSubmit && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm">
              Please fill district, start date, and end date.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm">
              {error}
            </div>
          )}

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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    SR.No
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Time
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Created At
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Checklist
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Aproved Date
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Rejected Reason
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    VLE Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Approver Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Center Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Center Address
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Participants Count
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Block Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Gram Panchayat
                  </th>
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
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-gray-500">
                      {loading ? "Loading..." : "No data found"}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{offset + i + 1}</td>
                      <td className="px-4 py-3">{r.workshop_name}</td>
                      <td className="px-4 py-3">{r.workshop_date}</td>
                      <td className="px-4 py-3">
                        {r.workshop_from_time} - {r.workshop_to_time}
                      </td>
                      <td className="px-4 py-3">{r.workshop_district}</td>
                      <td className="px-4 py-3">{r.workshop_created_at}</td>
                      <td className="px-4 py-3">{r.workshop_status}</td>
                      <td className="px-4 py-3">{r.workshop_checklist}</td>
                      <td className="px-4 py-3">{r.workshop_approved_date}</td>
                      <td className="px-4 py-3">
                        {r.workshop_rejected_reason}
                      </td>
                      <td className="px-4 py-3">{r.vle_name}</td>
                      <td className="px-4 py-3">{r.approver_name}</td>
                      <td className="px-4 py-3">{r.workshop_id}</td>
                      <td className="px-4 py-3">{r.workshop_center_name}</td>
                      <td className="px-4 py-3">{r.workshop_center_address}</td>
                      <td className="px-4 py-3">{r.participants_count}</td>
                      <td className="px-4 py-3">
                        {r.workshop_block_panchayat}
                      </td>
                      <td className="px-4 py-3">{r.workshop_gram_panchayat}</td>
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
