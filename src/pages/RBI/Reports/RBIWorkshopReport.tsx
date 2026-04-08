/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import {
  useGetBlockPanchayat,
  useGetDistrictParams,
  useGetGramPanchayat,
  useGetVLEParams,
  useGetWorkShopParams,
} from "../../../app/core/api/Admin";
import {
  useDownloadRBIWorkshopReport,
  useViewWorkshopReport,
  type RBIWorkshopReportRow,
} from "../../../app/core/api/RBIReports";
import RBIViewSheet from "./shared/AdminViewSheet";

const PAGE_SIZE = 10;
const TABLE_COLS = 14;

type BlockItem = { block_panchayat_name: string };
type GramItem = { gram_panchayat_code: string; gram_panchayat_name: string };

const isSuccess = (x: any) =>
  String(x?.result ?? "")
    .trim()
    .toLowerCase() === "success";

const normalizeDate = (d: string) => String(d ?? "").trim(); // YYYY-MM-DD
// const isValidDateRange = (start: string, end: string) => {
//   if (!!start !== !!end) return false; // one set => both required
//   if (!start && !end) return true;
//   return start <= end; // lexical works for YYYY-MM-DD
// };

function safeText(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

/**
 * Keeps same UI/table, just prevents 100+ words exploding layout.
 * Shows truncated preview with "Show more/less" and optional "Copy".
 */
function ExpandableText({
  text,
  maxChars = 140,
}: {
  text: unknown;
  maxChars?: number;
}) {
  const [open, setOpen] = useState(false);

  const clean = safeText(text);
  if (!clean) return <span className="text-gray-400">-</span>;

  const isLong = clean.length > maxChars;
  const shown = open || !isLong ? clean : `${clean.slice(0, maxChars)}…`;

  return (
    <div className="max-w-[420px]">
      <p className="text-gray-700 break-words">{shown}</p>

      {isLong && (
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Show less" : "Show more"}
          </button>

          <button
            type="button"
            className="text-xs text-gray-600 hover:underline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(clean);
                toast.success("Copied");
              } catch {
                toast.error("Copy failed");
              }
            }}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

export default function RBIWorkshopReport() {
  const navigate = useNavigate();
  const [distLoad, setDistLoad] = useState(false);
  const { mutateAsync: fetchView } = useViewWorkshopReport();
  const { mutateAsync: downloadWorkshop } = useDownloadRBIWorkshopReport();
  const { mutateAsync: getWorkshopStatuses } = useGetWorkShopParams();
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getBlocks } = useGetBlockPanchayat();
  const { mutateAsync: getGrams } = useGetGramPanchayat();
  const [statusList, setStatusList] = useState<string[]>([]);
  const [districtList, setDistrictList] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedDistrict, setSelectedDistrict] = useState(
    searchParams.get("district") ?? "",
  );
  const [selectedBlock, setSelectedBlock] = useState(
    searchParams.get("block") ?? "",
  );
  const [selectedGram, setSelectedGram] = useState(
    searchParams.get("gram") ?? "",
  );

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") ?? "",
  );
  const [endDate, setEndDate] = useState(searchParams.get("endDate") ?? "");

  const [workshopStatusfilter, setWorkshopStatusFilter] = useState(
    searchParams.get("status") ?? "",
  );

  const [selectedVleId, setSelectedVleId] = useState(
    searchParams.get("vle") ?? "",
  );

  const [offset, setOffset] = useState(Number(searchParams.get("offset") ?? 0));
  const UserType = sessionStorage.getItem("user_type");
  useEffect(() => {
    setSearchParams({
      district: selectedDistrict,
      block: selectedBlock,
      gram: selectedGram,
      startDate,
      endDate,
      status: workshopStatusfilter,
      vle: selectedVleId,
      offset: String(offset),
    });
  }, [
    selectedDistrict,
    selectedBlock,
    selectedGram,
    startDate,
    endDate,
    workshopStatusfilter,
    selectedVleId,
    offset,
  ]);
  useEffect(() => {
    // If filters are already valid from URL, auto-fetch
    if (canSubmit) {
      fetchData({ offsetOverride: offset });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<RBIWorkshopReportRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingBlock, setLoadingBlock] = useState(false);
  const [loadingGram, setLoadingGram] = useState(false);
  const [error, setError] = useState("");

  const [blockList, setBlockList] = useState<BlockItem[]>([]);
  const [gramList, setGramList] = useState<GramItem[]>([]);
  const [filtertype, setfiltertype] = useState("Descending");

  // Optional session_id support (no UI input currently)
  // const [sessionId, setSessionId] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null,
  );

  const { mutateAsync: getVLE } = useGetVLEParams();
  const [vleList, setVleList] = useState<any[]>([]);
  // Requirement: district+block+gram required; date optional but must be valid pair if used
  // const hasValidDates = isValidDateRange(startDate, endDate);
  const hasVle = Boolean(selectedVleId);

  // any one location field selected
  const hasAnyLocation = Boolean(
    selectedDistrict || selectedBlock || selectedGram,
  );

  // full location selected
  const hasFullLocation = Boolean(
    selectedDistrict && selectedBlock && selectedGram,
  );

  const canSubmit =
    // VLE ONLY (no location fields touched)
    (hasVle && !hasAnyLocation) ||
    // FULL location ONLY (no VLE)
    (!hasVle && hasFullLocation);

  /* ---------------- Load districts ---------------- */
  const isInitialDistrictLoad = useRef(true);
  const isInitialBlockLoad = useRef(true);
  useEffect(() => {
    (async () => {
      setDistLoad(true);
      try {
        let statuses: string[] = [];

        if (UserType === "rbi_sub_admin") {
          // ✅ No API call
          statuses = ["Pending", "Rescheduled"];
        } else {
          // ✅ Call API for other users
          const res = await getWorkshopStatuses();
          statuses = res?.data ?? [];
        }

        setStatusList(statuses);
        const VLEres = await getVLE({ get_by: "All" });
        setVleList(VLEres?.data ?? []);
        const res = await getDistricts();
        const list = res?.list ?? [];
        const names = Array.isArray(list)
          ? list
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map(String)
              .filter(Boolean)
          : [];
        setDistrictList(names);
        setDistLoad(false);
      } catch (e) {
        setDistLoad(false);
        console.error("Failed to load districts:", e);
        setDistrictList([]);
      } finally {
        setDistLoad(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Load blocks when district changes ---------------- */
  useEffect(() => {
    if (!selectedDistrict) {
      if (!isInitialDistrictLoad.current) {
        setBlockList([]);
        setGramList([]);
        setSelectedBlock("");
        setSelectedGram("");
      }
      return;
    }

    if (selectedDistrict === "All Districts") {
      setSelectedBlock("All Blocks");
      setSelectedGram("All Gram Panchayats");
      return;
    }

    (async () => {
      try {
        setLoadingBlock(true);

        // 🔑 reset ONLY if user changed district
        if (!isInitialDistrictLoad.current) {
          setBlockList([]);
          setGramList([]);
          setSelectedBlock("");
          setSelectedGram("");
        }

        const res = await getBlocks({ district: selectedDistrict });
        setBlockList((res?.list ?? []) as BlockItem[]);
      } catch (e) {
        console.error("Failed to load blocks:", e);
        setBlockList([]);
      } finally {
        setLoadingBlock(false);
        isInitialDistrictLoad.current = false;
      }
    })();
  }, [selectedDistrict, getBlocks]);

  /* ---------------- Load grams when block changes ---------------- */
  useEffect(() => {
    if (!selectedBlock) {
      if (!isInitialBlockLoad.current) {
        setGramList([]);
        setSelectedGram("");
      }
      return;
    }

    if (selectedBlock === "All Blocks") {
      setSelectedGram("All Gram Panchayats");
      return;
    }

    (async () => {
      try {
        setLoadingGram(true);

        // 🔑 reset ONLY if user changed block
        if (!isInitialBlockLoad.current) {
          setGramList([]);
          setSelectedGram("");
        }

        const res = await getGrams({
          block_panchayat_name: selectedBlock,
        });
        setGramList((res?.list ?? []) as GramItem[]);
      } catch (e) {
        console.error("Failed to load grams:", e);
        setGramList([]);
      } finally {
        setLoadingGram(false);
        isInitialBlockLoad.current = false;
      }
    })();
  }, [selectedBlock, getGrams]);

  /* ---------------- Fetch data ---------------- */
  const fetchData = async (opts?: {
    reset?: boolean;
    offsetOverride?: number;
    filterTypeOverride?: string;
  }) => {
    if (!canSubmit) {
      setError("Please select District, Block Panchayat, and Gram Panchayat.");
      return;
    }

    const nextOffset = opts?.offsetOverride ?? (opts?.reset ? 0 : offset);

    try {
      setLoading(true);
      setError("");

      const payload: any = {
        district: selectedDistrict,
        vle_id: selectedVleId,
        workshop_status: workshopStatusfilter,
        block_panchayat: selectedBlock,
        gram_panchayat: selectedGram,
        offset: nextOffset,
        start_date: startDate, // backend expects keys; empty string ok if optional
        end_date: endDate,
        filter_type: opts?.filterTypeOverride ?? filtertype,
      };

      const res = await fetchView(payload);

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

  /* ---------------- Download Citizen Excel ---------------- */
  const handleDownload = async () => {
    if (!canSubmit) {
      toast.error(
        "Please select District, Block Panchayat, and Gram Panchayat.",
      );
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        district: selectedDistrict,
        block_panchayat: selectedBlock,
        gram_panchayat: selectedGram,
        vle_id: selectedVleId,
        workshop_status: workshopStatusfilter,
        filter_type: filtertype,
      };

      const s = normalizeDate(startDate);
      const e = normalizeDate(endDate);
      if (s && e) {
        payload.start_date = s;
        payload.end_date = e;
      }
      // if (sessionId) payload.session_id = sessionId;

      const res = await downloadWorkshop(payload);

      const url =
        typeof res?.data === "string" && res.data.trim() ? res.data.trim() : "";
      const ok = isSuccess(res);

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
    return `Showing ${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} of ${total}`;
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
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* ================= ROW 1 ================= */}

              {/* District */}
              <div>
                <label className="text-sm text-gray-600">
                  District (required)
                </label>
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedDistrict}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedDistrict(value);
                    if (value) {
                      setSelectedVleId("");
                      setRows([]);
                    }
                  }}
                >
                  <option value="">
                    {distLoad ? "Loading..." : "Select District"}
                  </option>
                  <option value="All Districts">All Districts</option>
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
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedBlock(value);

                    // 🔴 Clear VLE if block selected
                    if (value) {
                      setSelectedVleId("");
                      setRows([]);
                    }
                  }}
                  disabled={!selectedDistrict || loadingBlock}
                >
                  <option value="">
                    {loadingBlock ? "Loading blocks..." : "Select block"}
                  </option>
                  <option value="All Blocks">All Blocks</option>
                  {blockList.map((b) => (
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
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedGram(value);

                    // 🔴 Clear VLE if gram selected
                    if (value) {
                      setSelectedVleId("");
                      setRows([]);
                    }
                  }}
                  disabled={!selectedBlock || loadingGram}
                >
                  <option value="">
                    {loadingGram
                      ? "Loading grams..."
                      : "Select gram panchayats"}
                  </option>
                  <option value="All Gram Panchayats">
                    All Gram panchayats
                  </option>
                  {gramList.map((g) => (
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
                  Start Date (optional)
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setStartDate(value);
                    if (value) {
                      setSelectedVleId("");
                      setRows([]);
                    }
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm text-gray-600">
                  End Date (optional)
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEndDate(value);
                    if (value) {
                      setSelectedVleId("");
                      setRows([]);
                    }
                  }}
                />
              </div>

              {/* ================= ROW 2 ================= */}

              {/* Status */}
              <div>
                <label className="text-sm text-gray-600">
                  Status (optional)
                </label>
                <select
                  value={workshopStatusfilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWorkshopStatusFilter(value);
                    if (value) {
                      setSelectedVleId("");
                      setRows([]);
                    }
                  }}
                  className="border rounded-md h-10 px-3 w-full"
                >
                  <option value="">Select Status</option>
                  {statusList.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* VLE ID */}
              <div>
                <label className="text-sm text-gray-600">
                  VLE Name (required)
                </label>
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedVleId}
                  onChange={(e) => {
                    const vleId = e.target.value;

                    setSelectedVleId(vleId);
                    if (vleId) {
                      setSelectedDistrict("");
                      setSelectedBlock("");
                      setSelectedGram("");
                      setStartDate("");
                      setEndDate("");
                      setWorkshopStatusFilter("");
                      setRows([]);
                    }
                  }}
                  disabled={!vleList.length}
                >
                  <option value="">
                    {distLoad ? "Loading..." : "Select VLE"}
                  </option>
                  {vleList.map((vle) => (
                    <option key={vle.id} value={vle.id}>
                      {vle.id} - {vle.first_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View */}
              <div>
                <Button
                  className="w-full h-10"
                  onClick={() => fetchData({ reset: true })}
                  disabled={loading || !canSubmit}
                >
                  {loading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    "View"
                  )}
                </Button>
              </div>

              {/* Download */}
              <div>
                <Button
                  className="w-full h-10"
                  onClick={handleDownload}
                  disabled={loading || !canSubmit}
                >
                  {loading ? "Downloading..." : "Download Excel"}
                </Button>
              </div>

              {/* Clear */}
              {/* <div>
                <Button
                  className="w-full h-10"
                  variant="outline"
                  onClick={() => {
                    setSelectedDistrict("");
                    setSelectedBlock("");
                    setSelectedGram("");
                    setStartDate("");
                    setEndDate("");
                    setVleList([]);
                    setWorkshopStatusFilter("");
                    setRows([]);
                    setTotal(0);
                    setOffset(0);
                    setError("");
                    setSessionId("");
                  }}
                >
                  Clear
                </Button>
              </div> */}
            </div>
          </div>

          {/* Messages */}
          {!canSubmit && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded font-semibold text-amber-900">
              Please select either a VLE ID <b>or</b> District, Block Panchayat,
              Gram Panchayat
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
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Workshop ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      Workshop Date
                      {/* Up Arrow */}
                      {/* Up Arrow */}
                      <button
                        onClick={() => {
                          const next =
                            filtertype === "Ascending"
                              ? "Descending"
                              : "Ascending";

                          setfiltertype(next);
                          fetchData({
                            filterTypeOverride: next,
                          });
                        }}
                        className={`text-xs ${
                          filtertype === "Ascending"
                            ? "text-blue-600"
                            : "text-blue-600"
                        }`}
                      >
                        {filtertype === "Ascending" ? "▲" : "▼"}
                      </button>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Workshop Time
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Workshop Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Mobile Number
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    VLE Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Workshop Reject Reason
                  </th>
                  {/* <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Aproved Date
                  </th>
                  
                   */}
                  {/* <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Approver Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop ID
                  </th> */}
                  {/* <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Center Name
                  </th> */}
                  {/* <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Center Address
                  </th> */}
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Participants Count
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Workshop Block Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    Workshop Gram Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
                    View
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      className="py-6 text-center text-gray-500"
                      colSpan={TABLE_COLS}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      className="py-6 text-center text-gray-500"
                      colSpan={TABLE_COLS}
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr
                      key={`${r.workshop_id ?? i}`}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{r.workshop_id ?? "-"}</td>

                      <td className="px-4 py-3">
                        {r.workshop_date_format ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {r.workshop_from_time ?? "-"} -{" "}
                        {r.workshop_to_time ?? "-"}
                      </td>

                      <td className="px-4 py-3">{r.workshop_status ?? "-"}</td>
                      <td className="px-4 py-3">{r.mobile_number ?? "-"}</td>
                      <td className="px-4 py-3">
                        {(r as any).vle_name ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <ExpandableText
                          text={(r as any).workshop_rejected_reason}
                          maxChars={140}
                        />
                      </td>
                      {/* <td className="px-4 py-3">
                        {r.workshop_checklist ?? "-"}
                      </td> */}
                      {/* <td className="px-4 py-3">
                        {r.workshop_approved_date ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <ExpandableText
                          text={r.workshop_rejected_reason}
                          maxChars={140}
                        />
                      </td>

                      <td className="px-4 py-3">{r.vle_name ?? "-"}</td> */}
                      {/* <td className="px-4 py-3">{r.approver_name ?? "-"}</td> */}

                      {/* <td className="px-4 py-3">{r.workshop_id ?? "-"}</td> */}
                      {/* <td className="px-4 py-3">
                        {r.workshop_center_name ?? "-"}
                      </td> */}
                      {/* <td className="px-4 py-3">
                        {r.workshop_center_address ?? "-"}
                      </td> */}

                      <td className="px-4 py-3">
                        {r.participants_count ?? "0"}
                      </td>
                      <td className="px-4 py-3">
                        {r.workshop_block_panchayat ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        {r.workshop_gram_panchayat ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedWorkshopId(r.workshop_id);
                            setOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <RBIViewSheet
            open={open}
            workshopId={selectedWorkshopId}
            openClose={() => setOpen(false)}
          />
        </div>
      </div>
    </Layout>
  );
}
