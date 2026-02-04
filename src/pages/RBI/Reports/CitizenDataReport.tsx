/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  useDownloadCitizenDataByDistrictReport,
  useViewCitizenDataByDistrictReport,
  type CitizenRow,
} from "../../../app/core/api/RBIReports";

const PAGE_SIZE = 10;

type WorkshopItem = {
  id: number | string;
  date?: string;
  center_name?: string;
};

function safeText(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

export default function CitizenDataReport() {
  const navigate = useNavigate();
  const { mutateAsync: fetchView } = useViewCitizenDataByDistrictReport();
  const { mutateAsync: download } = useDownloadCitizenDataByDistrictReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [rows, setRows] = useState<CitizenRow[]>([]);
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

  const [workshopList, setWorkshopList] = useState<WorkshopItem[]>([]);
  const [loadingWorkshops, setLoadingWorkshops] = useState(false);
  const [workshopId, setWorkshopId] = useState<string>("");

  const canSubmit = Boolean(
    selectedDistrict && startDate && endDate && selectedBlock && selectedGram,
  );

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

  /* ---------------- Load blocks when district changes ---------------- */
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
  }, [selectedDistrict, getBlocks]);

  /* ---------------- Load grams when block changes ---------------- */
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
  }, [selectedBlock, getGrams]);

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        setLoadingWorkshops(true);

        const res: any = null;

        const list: WorkshopItem[] = Array.isArray(res?.data) ? res.data : [];
        setWorkshopList(list);
      } catch (e) {
        console.error("Failed to load workshops:", e);
        setWorkshopList([]);
      } finally {
        setLoadingWorkshops(false);
      }
    };

    fetchWorkshops();
  }, []);

  const workshopOptions = useMemo(() => {
    return workshopList
      .map((w) => safeText(w.id))
      .map((s) => s.trim())
      .filter(Boolean);
  }, [workshopList]);

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

      const payload: any = {
        district: selectedDistrict,
        block_panchayat: selectedBlock,
        gram_panchayat: selectedGram,
        start_date: startDate,
        end_date: endDate,
        offset: nextOffset,
      };

      if (workshopId) payload.work_shop_id = workshopId;

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

  /* ---------------- Download ---------------- */
  const handleDownload = async () => {
    if (!canSubmit) {
      toast.error("Please select district, start date, and end date");
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        district: selectedDistrict,
        block_panchayat: selectedBlock,
        gram_panchayat: selectedGram,
        start_date: startDate,
        end_date: endDate,
      };

      // ✅ optional workshop_id (kept as session_id)
      if (workshopId) payload.work_shop_id = workshopId;

      const res = await download(payload);

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
    <Layout headerTitle="District-wise Citizen Data Report">
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              District-wise Citizens Report
            </h2>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

              <div>
                <label className="text-sm text-gray-600">
                  Workshop ID (optional)
                </label>

                {/* Searchable dropdown without new libs */}
                <input
                  className="border rounded-md h-10 px-3 w-full"
                  list="workshop-options"
                  placeholder={
                    loadingWorkshops
                      ? "Loading workshops..."
                      : "Search / select workshop id"
                  }
                  value={workshopId}
                  onChange={(e) => {
                    const v = e.target.value;
                    // Optional: keep numeric-only input
                    if (/^\d*$/.test(v)) setWorkshopId(v);
                  }}
                  disabled={loadingWorkshops}
                />

                <datalist id="workshop-options">
                  {workshopOptions.map((id) => (
                    <option key={id} value={id} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => fetchData({ reset: true })}
                disabled={loading || !canSubmit}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : "View"}
              </Button>

              <Button onClick={handleDownload} disabled={loading || !canSubmit}>
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
                  setWorkshopId("");
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
                    District
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Block Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Gram Panchayat
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Citizen Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Center Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Centre Address
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Workshop Date
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
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-center text-gray-500" colSpan={12}>
                      <span className="inline-flex items-center gap-2">
                        <Loader className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-6 text-center text-gray-500">
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
                      <td className="px-4 py-3">{r.citizen_name}</td>
                      <td className="px-4 py-3">{r.centre_name}</td>
                      <td className="px-4 py-3">{r.centre_address}</td>
                      <td className="px-4 py-3">{r.workshop_date}</td>
                      <td className="px-4 py-3">{r.mobile_number}</td>
                      <td className="px-4 py-3">{r.gender}</td>
                      <td className="px-4 py-3">{r.age}</td>
                      <td className="px-4 py-3">{r.date}</td>
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
