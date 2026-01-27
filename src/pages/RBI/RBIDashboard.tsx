/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
// import { Button } from "../../app/components/ui/button";

import BarChartComponent from "../../app/components/shared/BarChart";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";
import SchoolCardStatus from "../VLE/shared/SchoolCardStatus";

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

function isSuccess(x: any) {
  return (
    String(x?.result ?? "")
      .trim()
      .toLowerCase() === "success"
  );
}

function toDonutData(input: any): { name: string; value: number }[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    const maybe = input
      .map((x) => {
        const name = x?.name ?? x?.label ?? x?.gender ?? x?.status;
        const value = x?.value ?? x?.total ?? x?.count ?? x?.percentage;
        if (name == null || value == null) return null;
        return { name: String(name), value: Number(value) };
      })
      .filter(Boolean) as { name: string; value: number }[];

    if (maybe.length) return maybe;
  }

  if (Array.isArray(input?.list)) return toDonutData(input.list);

  if (typeof input === "object") {
    return Object.entries(input)
      .map(([k, v]) => ({ name: k, value: Number(v) }))
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
  const cardValue = (keys: string[], fallback = 0) => {
    for (const k of keys) {
      const v = cardsRaw?.[k];
      if (v != null && v !== "") return Number(v);
    }
    return fallback;
  };
  const cards = useMemo(() => {
    return [
      {
        title: "Total Workshop Scheduled",
        value: cardValue([
          "total_work_shop",
          "total_workshop",
          "total_planned",
          "planned",
        ]),
      },
      {
        title: "Total Workshop Completed",
        value: cardValue([
          "total_completed",
          "completed",
          "totalWorkshopCompleted",
          "total_workshop_completed",
        ]),
      },
      {
        title: "Under the Schedule",
        value: cardValue([
          "total_pending",
          "pending",
          "totalWorkshopPending",
          "total_workshop_pending",
        ]),
      },
      {
        title: "Total Workshop Approved",
        value: cardValue([
          "total_approved",
          "approved",
          "totalWorkshopApproved",
          "total_workshop_approved",
        ]),
      },
      {
        title: "Total Workshop Rejected",
        value: cardValue([
          "total_rejected",
          "rejected",
          "totalWorkshopRejected",
          "total_workshop_rejected",
        ]),
      },
      {
        title: "Total Workshop Cancelled",
        value: cardValue(["total_cancelled"]),
      },
    ];
  }, [cardsRaw]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [cardsRes, pRes, sRes, mRes, districtRes] = await Promise.all([
          getCards(),
          getPendingCompleted(),
          getScheduledCancelled(),
          getMaleFemale(),
          getDistricts(),
          getProgramsBar(),
          getTopVles({ offset: 0 }),
          getTopDistricts({ offset: 0 }),
        ]);

        if (isSuccess(cardsRes)) setCardsRaw(cardsRes.list?.[0] ?? null);

        if (isSuccess(pRes))
          setDonutPendingCompleted(toDonutData(pRes.list?.[0] ?? pRes.list));

        if (isSuccess(sRes))
          setDonutScheduledCancelled(toDonutData(sRes.list?.[0] ?? sRes.list));

        if (isSuccess(mRes))
          setDonutMaleFemale(toDonutData(mRes.list?.[0] ?? mRes.list));

        const districts = districtRes?.list ?? [];
        const names = Array.isArray(districts)
          ? districts
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map(String)
              .filter(Boolean)
          : [];

        setDistrictList(names);

        const first = names[0] ?? "";
        setSelectedDistrict(first);

        if (first) {
          const barRes = await getDistrictBar({ district: first });
          if (isSuccess(barRes)) {
            const row = barRes.list?.[0] ?? {};
            setDistrictBarData([
              { status: "Completed", count: Number(row.completed_count ?? 0) },
              { status: "Pending", count: Number(row.pending_count ?? 0) },
              { status: "Approved", count: Number(row.approved_count ?? 0) },
            ]);
          }
        }

        const monthRes = await getMonthBar({ month: selectedMonth });
        if (isSuccess(monthRes)) {
          const row = monthRes.list?.[0] ?? {};
          setMonthBarData([
            { status: "Pending", count: Number(row.pending_count ?? 0) },
            { status: "Approved", count: Number(row.approved_count ?? 0) },
            { status: "Completed", count: Number(row.completed_count ?? 0) },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    if (!district) return;

    const barRes = await getDistrictBar({ district });
    if (isSuccess(barRes)) {
      const row = barRes.list?.[0] ?? {};
      setDistrictBarData([
        { status: "Completed", count: Number(row.completed_count ?? 0) },
        { status: "Pending", count: Number(row.pending_count ?? 0) },
        { status: "Approved", count: Number(row.approved_count ?? 0) },
      ]);
    }
  };

  const onMonthChange = async (month: string) => {
    setSelectedMonth(month);
    if (!month) return;

    const res = await getMonthBar({ month });
    if (isSuccess(res)) {
      const row = res.list?.[0] ?? {};
      setMonthBarData([
        { status: "Pending", count: Number(row.pending_count ?? 0) },
        { status: "Approved", count: Number(row.approved_count ?? 0) },
        { status: "Completed", count: Number(row.completed_count ?? 0) },
      ]);
    }
  };

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
            <SchoolCardStatus
              key={c.title}
              title={c.title}
              total={c.value ?? 0}
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

            {/* <Button
              variant="outline"
              onClick={() => onMonthChange(selectedMonth)}
            >
              Refresh
            </Button> */}
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
