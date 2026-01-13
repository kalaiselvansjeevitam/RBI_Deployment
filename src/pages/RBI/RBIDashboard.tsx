/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import { Button } from "../../app/components/ui/button";

import BarChartComponent from "../../app/components/shared/BarChart";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";
import SchoolCardStatus from "../VLE/shared/SchoolCardStatus";

import { useNavigate } from "react-router-dom";
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
import { ROUTE_URL } from "../../app/core/constants/coreUrl";

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

/**
 * Normalize donut responses into [{name, value}]
 * Backend may return:
 * - { Male: 10, Female: 12 }
 * - [{ name: "Male", value: 10 }, ...]
 * - { list: [{ gender: "Male", total: "10" }, ...] }
 */
function toDonutData(input: any): { name: string; value: number }[] {
  if (!input) return [];

  // If already array of {name,value}
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

  // If wrapped {list: [...]}
  if (Array.isArray(input?.list)) return toDonutData(input.list);

  // If object map
  if (typeof input === "object") {
    return Object.entries(input)
      .map(([k, v]) => ({ name: k, value: Number(v) }))
      .filter((x) => Number.isFinite(x.value));
  }

  return [];
}

/**
 * Normalize bar graph into [{status,count}] or [{month, pending,...}]
 * We'll keep it flexible.
 */
// function toStatusBarData(input: any): { status: string; count: number }[] {
//   if (!input) return [];

//   if (Array.isArray(input)) {
//     // assume [{ status, count }]
//     return input
//       .map((x) => ({
//         status: String(x?.status ?? x?.name ?? x?.label ?? ""),
//         count: Number(x?.count ?? x?.value ?? x?.total ?? 0),
//       }))
//       .filter((x) => x.status);
//   }

//   if (Array.isArray(input?.list)) return toStatusBarData(input.list);

//   if (typeof input === "object") {
//     // object map: { Completed: 10, Pending: 5 }
//     return Object.entries(input)
//       .map(([k, v]) => ({ status: k, count: Number(v) }))
//       .filter((x) => Number.isFinite(x.count));
//   }

//   return [];
// }

export default function RBIDashboard() {
  const navigate = useNavigate();
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

  const [programsBarData, setProgramsBarData] = useState<
    { status: string; count: number }[]
  >([]);

  const [topVles, setTopVles] = useState<
    {
      vle_name: string;
      district: string;
      completed: number;
      approved: number;
    }[]
  >([]);

  const [topDistricts, setTopDistricts] = useState<
    { district: string; completed: number; approved: number }[]
  >([]);

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

  // Load cards + donuts + districts (and auto first district bar)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [
          cardsRes,
          pRes,
          sRes,
          mRes,
          districtRes,
          programsRes,
          topVlesRes,
          topDistrictsRes,
        ] = await Promise.all([
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

        // Pending vs Completed: your backend likely returns list[0] with counts
        if (isSuccess(pRes))
          setDonutPendingCompleted(toDonutData(pRes.list?.[0] ?? pRes.list));

        // Scheduled vs Cancelled
        if (isSuccess(sRes))
          setDonutScheduledCancelled(toDonutData(sRes.list?.[0] ?? sRes.list));

        // Male vs Female
        if (isSuccess(mRes))
          setDonutMaleFemale(toDonutData(mRes.list?.[0] ?? mRes.list));

        if (isSuccess(programsRes)) {
          const list = Array.isArray(programsRes?.list) ? programsRes.list : [];
          setProgramsBarData(
            list
              .map((x: any) => ({
                status: String(x.workshop_name ?? ""),
                count: Number(x.total ?? 0),
              }))
              .filter((x) => x.status && x.count > 0),
          );
        } else {
          setProgramsBarData([]);
        }

        // Top 5 VLEs
        if (isSuccess(topVlesRes)) {
          const list = Array.isArray(topVlesRes?.list) ? topVlesRes.list : [];
          setTopVles(
            list.slice(0, 5).map((x: any) => ({
              vle_name: String(x.vle_name ?? ""),
              district: String(x.district ?? ""),
              completed: Number(x.completed_count ?? 0),
              approved: Number(x.approved_count ?? 0),
            })),
          );
        } else {
          setTopVles([]);
        }

        // Top 5 Districts
        if (isSuccess(topDistrictsRes)) {
          const list = Array.isArray(topDistrictsRes?.list)
            ? topDistrictsRes.list
            : [];
          setTopDistricts(
            list.slice(0, 5).map((x: any) => ({
              district: String(x.district ?? ""),
              completed: Number(x.completed_count ?? 0),
              approved: Number(x.approved_count ?? 0),
            })),
          );
        } else {
          setTopDistricts([]);
        }

        // District list: your existing API returns some structure.
        // We'll try to pull list of district names safely.
        const districts = districtRes?.list ?? [];

        const names: string[] = Array.isArray(districts)
          ? districts
              .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
              .map((x: any) => String(x))
              .filter(Boolean)
          : [];

        setDistrictList(names);

        // auto select first district (requirement)
        const first = names?.[0] ?? "";
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
          } else {
            setDistrictBarData([]);
          }
        }

        // month bar default
        const monthRes = await getMonthBar({ month: selectedMonth });
        if (isSuccess(monthRes)) {
          const row = monthRes.list?.[0] ?? {};
          setMonthBarData([
            { status: "Pending", count: Number(row.pending_count ?? 0) },
            { status: "Approved", count: Number(row.approved_count ?? 0) },
            { status: "Completed", count: Number(row.completed_count ?? 0) },
          ]);
        } else {
          setMonthBarData([]);
        }
      } catch (e) {
        console.error("RBI dashboard load failed:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Change district -> fetch district bar
  const onDistrictChange = async (district: string) => {
    setSelectedDistrict(district);
    if (!district) return;

    try {
      const barRes = await getDistrictBar({ district });
      if (isSuccess(barRes)) {
        const row = barRes.list?.[0] ?? {};
        setDistrictBarData([
          { status: "Completed", count: Number(row.completed_count ?? 0) },
          { status: "Pending", count: Number(row.pending_count ?? 0) },
          { status: "Approved", count: Number(row.approved_count ?? 0) },
        ]);
      } else {
        setDistrictBarData([]);
      }
    } catch (e) {
      console.error("District bar fetch failed:", e);
      setDistrictBarData([]);
    }
  };

  // Change month -> fetch month bar
  const onMonthChange = async (month: string) => {
    setSelectedMonth(month);
    if (!month) return;

    try {
      const res = await getMonthBar({ month });
      if (isSuccess(res)) {
        const row = res.list?.[0] ?? {};
        setMonthBarData([
          { status: "Pending", count: Number(row.pending_count ?? 0) },
          { status: "Approved", count: Number(row.approved_count ?? 0) },
          { status: "Completed", count: Number(row.completed_count ?? 0) },
        ]);
      } else {
        setMonthBarData([]);
      }
    } catch (e) {
      console.error("Month bar fetch failed:", e);
      setMonthBarData([]);
    }
  };

  /**
   * Cards mapping:
   * Backend keys may differ. We'll display the required titles using best-effort extraction.
   * Once you paste real response JSON for rbiDashboardValues, we’ll map exactly.
   */
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
        title: "Total Workshop Planned",
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
        title: "Total Workshop Pending",
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
        title: "< 50 attendees Workshop",
        value: cardValue([
          "workshops_less_than_50",
          "less_than_50",
          "lt_50",
          "under_50",
        ]),
      },
    ];
  }, [cardsRaw]);

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

        {/* Donuts row */}
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

        {/* District-wise bar graph */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-700">
              District-wise Completed / Pending / Approved
            </h3>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">District:</div>
              <select
                className="border rounded-md h-10 px-3"
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
              >
                {districtList.length === 0 ? (
                  <option value="">No districts</option>
                ) : (
                  districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="h-[320px]">
            <BarChartComponent
              data={districtBarData}
              dataKey="count"
              categoryKey="status"
              height={320}
              fillColor="#4f718aff"
            />
          </div>
        </div>

        {/* Month-wise bar graph */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-700">
              Month-wise Training Pending / Approved / Completed
            </h3>

            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">Month:</div>
              <select
                className="border rounded-md h-10 px-3"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => onMonthChange(selectedMonth)}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="h-[320px]">
            <BarChartComponent
              data={monthBarData}
              dataKey="count"
              categoryKey="status"
              height={320}
              fillColor="#22c55e"
            />
          </div>
        </div>
        {/* Programs conducted */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Programs Conducted
            </h3>
          </div>

          <div className="h-[320px]">
            <BarChartComponent
              data={programsBarData}
              dataKey="count"
              categoryKey="status"
              height={320}
              fillColor="#6366f1"
            />
          </div>

          {programsBarData.length === 0 && (
            <div className="text-sm text-gray-500 mt-2">No data found.</div>
          )}
        </div>

        {/* Top 5 VLEs */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Top 5 VLEs</h3>

            <Button
              className=" cursor-pointer"
              variant="outline"
              onClick={() => navigate(ROUTE_URL.rbiReportDistrictStatus)}
            >
              View More
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">S.No</th>
                  <th className="py-2 pr-4">VLE Name</th>
                  <th className="py-2 pr-4">District</th>
                  <th className="py-2 pr-4">Completed</th>
                  <th className="py-2 pr-4">Approved</th>
                </tr>
              </thead>
              <tbody>
                {topVles.length === 0 ? (
                  <tr>
                    <td className="py-4 text-gray-500" colSpan={5}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  topVles.map((r, idx) => (
                    <tr key={`${r.vle_name}-${idx}`} className="border-b">
                      <td className="py-2 pr-4">{idx + 1}</td>
                      <td className="py-2 pr-4">{r.vle_name}</td>
                      <td className="py-2 pr-4">{r.district}</td>
                      <td className="py-2 pr-4">{r.completed}</td>
                      <td className="py-2 pr-4">{r.approved}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 5 Districts */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Top 5 Districts
            </h3>

            <Button
              className=" cursor-pointer"
              variant="outline"
              onClick={() =>
                navigate(ROUTE_URL.rbiReportDistrictPendingComplete)
              }
            >
              View More
            </Button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">S.No</th>
                  <th className="py-2 pr-4">District</th>
                  <th className="py-2 pr-4">Completed</th>
                  <th className="py-2 pr-4">Approved</th>
                </tr>
              </thead>
              <tbody>
                {topDistricts.length === 0 ? (
                  <tr>
                    <td className="py-4 text-gray-500" colSpan={4}>
                      No data found.
                    </td>
                  </tr>
                ) : (
                  topDistricts.map((r, idx) => (
                    <tr key={`${r.district}-${idx}`} className="border-b">
                      <td className="py-2 pr-4">{idx + 1}</td>
                      <td className="py-2 pr-4">{r.district}</td>
                      <td className="py-2 pr-4">{r.completed}</td>
                      <td className="py-2 pr-4">{r.approved}</td>
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
