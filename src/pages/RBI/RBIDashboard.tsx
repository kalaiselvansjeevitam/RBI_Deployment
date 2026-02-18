/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../app/components/Layout/Layout";

import BarChartComponent from "../../app/components/shared/BarChart";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";

import { useGetDistrictParams } from "../../app/core/api/Admin";
import {
  useGetDistrictWiseWorkshopBarGraph,
  useGetMaleVsFemale,
  useGetMonthWiseWorkshopBarGraph,
  useGetPendingVsCompleted,
  useGetProgramsConductedBarGraph,
  useGetRBIDashboardValues,
  useGetScheduledVsCancelled,
  useGetTop5Districts,
  useGetTop5Vles,
} from "../../app/core/api/RBIDashboard";
import CardStatus from "./Reports/shared/Cards";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function isSuccess(res: any): boolean {
  return (
    String(res?.result ?? "")
      .trim()
      .toLowerCase() === "success"
  );
}

function toNumberSafe(v: any, fallback = 0): number {
  if (v == null) return fallback;
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;

  const s = String(v).trim();
  if (!s) return fallback;

  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}

function toDonutData(input: any): { name: string; value: number }[] {
  if (!input) return [];

  // Typical responses: { list: [...] } or directly [...]
  const list = Array.isArray(input)
    ? input
    : Array.isArray(input?.list)
      ? input.list
      : null;

  if (Array.isArray(list)) {
    const mapped = list
      .map((x) => {
        const name = x?.name ?? x?.label ?? x?.gender ?? x?.status;
        const value = x?.value ?? x?.total ?? x?.count ?? x?.percentage;
        if (name == null || value == null) return null;
        return { name: String(name), value: toNumberSafe(value, 0) };
      })
      .filter(Boolean) as { name: string; value: number }[];

    if (mapped.length) return mapped;
  }

  // Some backends may return object maps like { Pending: "12", Completed: "1" }
  if (typeof input === "object" && input && !Array.isArray(input)) {
    return Object.entries(input)
      .map(([k, v]) => ({ name: String(k), value: toNumberSafe(v, NaN) }))
      .filter((x) => Number.isFinite(x.value));
  }

  return [];
}

export default function RBIDashboard() {
  const { mutateAsync: getDistricts } = useGetDistrictParams();

  const { mutateAsync: getCards } = useGetRBIDashboardValues();
  const { mutateAsync: getPendingCompleted } = useGetPendingVsCompleted();
  const { mutateAsync: getScheduledCancelled } = useGetScheduledVsCancelled();
  const { mutateAsync: getMaleFemale } = useGetMaleVsFemale();

  const { mutateAsync: getDistrictBar } = useGetDistrictWiseWorkshopBarGraph();
  const { mutateAsync: getMonthBar } = useGetMonthWiseWorkshopBarGraph();

  // Kept as existing calls (even if not rendered currently)
  const { mutateAsync: getProgramsBar } = useGetProgramsConductedBarGraph();
  const { mutateAsync: getTopVles } = useGetTop5Vles();
  const { mutateAsync: getTopDistricts } = useGetTop5Districts();

  const [loading, setLoading] = useState(true);

  const [districtList, setDistrictList] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const [selectedMonth, setSelectedMonth] = useState<string>("1");

  const [cardsRaw, setCardsRaw] = useState<any>(null);

  const [donutPendingCompleted, setDonutPendingCompleted] = useState<
    { name: string; value: number }[]
  >([]);
  const [donutScheduledCancelled, setDonutScheduledCancelled] = useState<
    { name: string; value: number }[]
  >([]);
  const [donutMaleFemale, setDonutMaleFemale] = useState<
    { name: string; value: number }[]
  >([]);

  const [districtBarData, setDistrictBarData] = useState<
    { status: string; count: number }[]
  >([]);
  const [monthBarData, setMonthBarData] = useState<
    { status: string; count: number }[]
  >([]);

  const cardValueInt = useCallback(
    (keys: string[], fallback = 0) => {
      for (const k of keys) {
        const v = cardsRaw?.[k];
        if (v != null && String(v).trim() !== "")
          return Math.trunc(toNumberSafe(v, fallback));
      }
      return fallback;
    },
    [cardsRaw],
  );

  const cardValueFloat = useCallback(
    (keys: string[], fallback = 0) => {
      for (const k of keys) {
        const v = cardsRaw?.[k];
        if (v != null && String(v).trim() !== "")
          return toNumberSafe(v, fallback);
      }
      return fallback;
    },
    [cardsRaw],
  );

  const cards = useMemo(() => {
    return [
      {
        title: "Total Workshop Scheduled",

        value: cardValueInt([
          "total_work_shop",
          "total_workshop",
          "total_planned",
          "planned",
        ]),
      },
      {
        title: "Total Workshop Pending for Approval",
        value: cardValueInt([
          "total_completed",
          "completed",
          "totalWorkshopCompleted",
          "total_workshop_completed",
        ]),
        from: "from-pink-400",
        to: "to-rose-500",
      },
      {
        title: "Under the Schedule\n(Total workshop pending)",
        value: cardValueInt([
          "total_pending",
          "pending",
          "totalWorkshopPending",
          "total_workshop_pending",
        ]),
        from: "from-amber-300",
        to: "to-orange-400",
      },
      {
        title: "Total Workshop Approved",
        value: cardValueInt([
          "total_approved",
          "approved",
          "totalWorkshopApproved",
          "total_workshop_approved",
        ]),
        from: "from-green-400",
        to: "to-green-500",
      },
      {
        title: "Total Workshop Rejected",
        value: cardValueInt([
          "total_rejected",
          "rejected",
          "totalWorkshopRejected",
          "total_workshop_rejected",
        ]),
        from: "from-red-400",
        to: "to-red-500",
      },
      {
        title: "Avg Approval Days",
        value: cardValueFloat(["avg_approval_days"], 0),
      },
      {
        title: "Gram Panchayat Covered Till Date",
        value: cardValueInt([
          "gram_panchayat_completed_approved_count",
          "gram_panchayat_covered_till_date",
          "gramPanchayatCompletedApprovedCount",
        ]),
      },
    ];
  }, [cardValueInt, cardValueFloat]);

  const loadDistrictBar = useCallback(
    async (district: string) => {
      if (!district) return;

      const barRes = await getDistrictBar({ district });
      if (!isSuccess(barRes)) return;

      const row = barRes?.list?.[0] ?? {};
      setDistrictBarData([
        { status: "Approved", count: toNumberSafe(row.approved_count, 0) },
        { status: "Rejected", count: toNumberSafe(row.rejected_count, 0) },
        {
          status: "Scheduled but Pending",
          count: toNumberSafe(row.pending_count, 0),
        },
      ]);
    },
    [getDistrictBar],
  );

  const loadMonthBar = useCallback(
    async (month: string) => {
      if (!month) return;

      const res = await getMonthBar({ month });
      if (!isSuccess(res)) return;

      const row = res?.list?.[0] ?? {};
      setMonthBarData([
        { status: "Approved", count: toNumberSafe(row.approved_count, 0) },
        { status: "Rejected", count: toNumberSafe(row.rejected_count, 0) },
        {
          status: "Scheduled but Pending",
          count: toNumberSafe(row.pending_count, 0),
        },
      ]);
    },
    [getMonthBar],
  );

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);

        // Keep same set of calls (even if some results aren't used in UI right now)
        const results = await Promise.allSettled([
          getCards(),
          getPendingCompleted(),
          getScheduledCancelled(),
          getMaleFemale(),
          getDistricts(),
          getProgramsBar(),
          getTopVles({ offset: 0 }),
          getTopDistricts({ offset: 0 }),
        ]);

        if (!alive) return;

        const [
          cardsRes,
          pRes,
          sRes,
          mRes,
          districtRes,
          // unused but kept (programs/top5)
          _programsRes,
          _topVlesRes,
          _topDistrictsRes,
        ] = results.map((r) => (r.status === "fulfilled" ? r.value : null));

        if (cardsRes && isSuccess(cardsRes))
          setCardsRaw(cardsRes?.list?.[0] ?? null);

        if (pRes && isSuccess(pRes))
          setDonutPendingCompleted(
            toDonutData(pRes?.list?.[0] ?? pRes?.list ?? pRes),
          );

        if (sRes && isSuccess(sRes))
          setDonutScheduledCancelled(
            toDonutData(sRes?.list?.[0] ?? sRes?.list ?? sRes),
          );

        if (mRes && isSuccess(mRes))
          setDonutMaleFemale(
            toDonutData(mRes?.list?.[0] ?? mRes?.list ?? mRes),
          );

        const districts = districtRes?.list ?? [];
        const names = Array.isArray(districts)
          ? districts
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map(String)
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        setDistrictList(names);

        // Preserve your behavior: auto-select first district
        const first = names[0] ?? "";
        setSelectedDistrict(first);

        // Initial bars
        if (first) await loadDistrictBar(first);
        await loadMonthBar(selectedMonth);
      } catch (err) {
        console.error("RBIDashboard load failed:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
    // Intentionally keep dependencies minimal and stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDistrictChange = useCallback(
    async (district: string) => {
      setSelectedDistrict(district);
      if (!district) return;
      try {
        await loadDistrictBar(district);
      } catch (err) {
        console.error("District bar load failed:", err);
      }
    },
    [loadDistrictBar],
  );

  const onMonthChange = useCallback(
    async (month: string) => {
      setSelectedMonth(month);
      if (!month) return;
      try {
        await loadMonthBar(month);
      } catch (err) {
        console.error("Month bar load failed:", err);
      }
    },
    [loadMonthBar],
  );

  if (loading) {
    return (
      <Layout headerTitle="RBI Dashboard">
        <div className="flex justify-center items-center h-[70vh]">
          <Loader className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="RBI Dashboard">
      <div className="p-6 space-y-6">
        {/* Cards */}
        <div className="flex flex-wrap gap-6">
          {cards.map((c) => (
            <CardStatus
              key={c.title}
              title={c.title}
              total={c.value ?? 0}
              from={c.from}
              to={c.to}
            />
          ))}
        </div>

        {/* Donuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Planned vs Completed %
            </h4>
            <DonutChartComponent data={donutPendingCompleted} />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Scheduled vs Cancelled %
            </h4>
            <DonutChartComponent data={donutScheduledCancelled} />
          </div>

          <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">
              Male vs Female %
            </h4>
            <DonutChartComponent data={donutMaleFemale} />
          </div>
        </div>

        {/* District filter */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex justify-between mb-4">
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
            >
              {districtList.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <BarChartComponent
            data={districtBarData}
            dataKey="count"
            categoryKey="status"
            height={320}
            fillColor="#4f718aff"
          />
        </div>

        {/* Month filter */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex gap-2 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <BarChartComponent
            data={monthBarData}
            dataKey="count"
            categoryKey="status"
            height={320}
            fillColor="#22c55e"
          />
        </div>
      </div>
    </Layout>
  );
}
