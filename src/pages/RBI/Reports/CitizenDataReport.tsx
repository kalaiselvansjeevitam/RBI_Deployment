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
  useGetVLEParams,
} from "../../../app/core/api/Admin";
import {
  getWorkshopList,
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

export default function CitizenDataReport() {
  const navigate = useNavigate();
  const { mutateAsync: fetchView } = useViewCitizenDataByDistrictReport();
  const { mutateAsync: download } = useDownloadCitizenDataByDistrictReport();
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getVLE } = useGetVLEParams();
  const { mutateAsync: fetchWorkshopsApi } = getWorkshopList();

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [distLoad, setdistLoad] = useState(false);
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
  const [vleList, setVleList] = useState<any[]>([]);
  const [selectedVleId, setSelectedVleId] = useState("");

  const hasVle = Boolean(selectedVleId);

  // any one location field selected
  const hasAnyLocation = Boolean(
    selectedDistrict || selectedBlock || selectedGram,
  );

  // full location selected
  const hasFullLocation = Boolean(
    selectedDistrict && selectedBlock && selectedGram,
  );

  const hasDates = Boolean(startDate && endDate);

  const canSubmit =
    // VLE ONLY (no location fields touched)
    (hasVle && !hasAnyLocation) ||
    // FULL location ONLY (no VLE)
    (hasDates && !hasVle && hasFullLocation);

  /* ---------------- Load districts ---------------- */
  useEffect(() => {
    (async () => {
      setdistLoad(true);
      try {
        const res = await getDistricts();
        const VLEres = await getVLE({ get_by: "All" });
        setVleList(VLEres?.data ?? []);
        const list = res?.list ?? [];
        const names = Array.isArray(list)
          ? list
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map(String)
              .filter(Boolean)
          : [];
        setDistrictList(names);
        setdistLoad(false);
      } catch (e) {
        console.error("Failed to load districts:", e);
        setDistrictList([]);
        setdistLoad(false);
      } finally {
        setdistLoad(false);
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
    if (selectedDistrict == "All Districts") {
      setSelectedBlock("All Blocks");
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
    if (selectedBlock == "All Blocks") {
      setGramList([]);
      setSelectedGram("All Gram Panchayats");
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
        const res = await fetchWorkshopsApi();
        setWorkshopList(res.data ?? []);
      } catch (e) {
        console.error("Failed to load workshops:", e);
        setWorkshopList([]);
      } finally {
        setLoadingWorkshops(false);
      }
    };

    fetchWorkshops();
  }, []);

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
        vle_id: selectedVleId,
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
        vle_id: selectedVleId,
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
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* District */}
              <div className="md:col-span-3">
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
              <div className="md:col-span-3">
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
              <div className="md:col-span-3">
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

              {/* Workshop */}
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">
                  Workshop ID (optional)
                </label>
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={workshopId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setWorkshopId(value);
                    setSelectedVleId("");
                    setRows([]);
                  }}
                  disabled={loadingWorkshops}
                >
                  <option value="">
                    {loadingWorkshops
                      ? "Loading workshops..."
                      : "All Workshops"}
                  </option>
                  {workshopList.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.id}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">
                  Start Date (required)
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
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">
                  End Date (required)
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

              {/* VLE ID */}
              <div className="md:col-span-3">
                <label className="text-sm text-gray-600">
                  VLE Name (required)
                </label>

                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={selectedVleId}
                  onChange={(e) => {
                    const vleId = e.target.value;

                    setSelectedVleId(vleId);

                    // 🔴 Clear location fields when VLE is selected
                    if (vleId) {
                      setSelectedDistrict("");
                      setSelectedBlock("");
                      setSelectedGram("");
                      setStartDate("");
                      setEndDate("");
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

              {/* View Button */}
              <div className="md:col-span-2">
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

              {/* Download Button */}
              <div className="md:col-span-2">
                <Button
                  className="w-full h-10"
                  onClick={handleDownload}
                  disabled={loading || !canSubmit}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Downloading
                    </span>
                  ) : (
                    "Download Excel"
                  )}
                </Button>
              </div>

              {/* Clear Button */}
              {/* <div className="md:col-span-2">
                <Button
                  className="w-full h-10"
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
              </div> */}
            </div>
          </div>

          {/* Messages */}
          {!canSubmit && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded font-semibold text-amber-900">
              Please select either a VLE ID <b>or</b> District, Block Panchayat,
              Gram Panchayat and Both start and end Dates.
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
                  <th className="px-4 py-3 text-left font-medium text-gray-700 whitespace-nowrap">
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
