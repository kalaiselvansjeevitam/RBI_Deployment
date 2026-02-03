/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";
import SchoolCardStatus from "../VLE/shared/SchoolCardStatus";

import {
  useGetMaleVsFemale,
  useGetRBIDashboardValues,
} from "../../app/core/api/RBIDashboard";

function isOk(res: any): boolean {
  const result = String(res?.result ?? "")
    .trim()
    .toLowerCase();
  const status = String(res?.status ?? "")
    .trim()
    .toLowerCase();
  return result === "success" || status === "success";
}

function toNumberSafe(v: any, fallback = 0): number {
  if (v == null) return fallback;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Supports:
 * 1) { list: [{ gender: "Male", total: "10" }, ...] }
 * 2) { list: [{ Male: "10", Female: "12", Other: "1" }] }
 * 3) { Male: "10", Female: "12", Other: "1" }
 */
function toGenderDonutData(res: any): { name: string; value: number }[] {
  const list = Array.isArray(res?.list) ? res.list : null;

  // Case 1: list of rows with gender/total
  if (
    Array.isArray(list) &&
    list.length &&
    (list[0]?.gender || list[0]?.name)
  ) {
    const mapped = list
      .map((g: any) => ({
        name: String(g?.gender ?? g?.name ?? "").trim(),
        value: toNumberSafe(g?.total ?? g?.value ?? g?.count, 0),
      }))
      .filter((x) => x.name);

    return mapped;
  }

  // Case 2: list[0] is an object map
  if (Array.isArray(list) && list.length && typeof list[0] === "object") {
    const obj = list[0] ?? {};
    const mapped = Object.entries(obj)
      .map(([k, v]) => ({
        name: String(k).trim(),
        value: toNumberSafe(v, NaN),
      }))
      .filter((x) => x.name && Number.isFinite(x.value));
    return mapped;
  }

  // Case 3: res itself is object map
  if (res && typeof res === "object" && !Array.isArray(res)) {
    const mapped = Object.entries(res)
      .map(([k, v]) => ({
        name: String(k).trim(),
        value: toNumberSafe(v, NaN),
      }))
      .filter((x) => x.name && Number.isFinite(x.value));
    return mapped;
  }

  return [];
}

export default function AdminDashboard() {
  const { mutateAsync: getCards } = useGetRBIDashboardValues();
  const { mutateAsync: getGender } = useGetMaleVsFemale();

  const [loading, setLoading] = useState(true);
  const [cardsRaw, setCardsRaw] = useState<any>(null);
  const [genderDonutData, setGenderDonutData] = useState<
    { name: string; value: number }[]
  >([]);

  const cards = useMemo(() => {
    if (!cardsRaw) return [];

    return [
      {
        title: "Total Workshop Scheduled",
        value: toNumberSafe(cardsRaw.total_work_shop),
      },
      {
        title: "Total Workshop Completed",
        value: toNumberSafe(cardsRaw.total_completed),
      },
      {
        title: "Under the Schedule",
        value: toNumberSafe(cardsRaw.total_pending),
      },
      {
        title: "Total Workshop Approved",
        value: toNumberSafe(cardsRaw.total_approved),
      },
      {
        title: "Total Workshop Rejected",
        value: toNumberSafe(cardsRaw.total_rejected),
      },
      {
        title: "Avg Approval Days",
        value: toNumberSafe(cardsRaw.avg_approval_days),
      },
      {
        title: "Total Workshop Cancelled",
        value: toNumberSafe(cardsRaw.total_cancelled),
      },
    ];
  }, [cardsRaw]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);

        const [cardsRes, genderRes] = await Promise.all([
          getCards(),
          getGender(),
        ]);

        if (!alive) return;

        // Cards
        if (isOk(cardsRes)) {
          setCardsRaw(cardsRes?.list?.[0] ?? null);
        } else {
          console.warn("Cards API not ok:", cardsRes);
          setCardsRaw(null);
        }

        // Gender donut
        if (isOk(genderRes) || Array.isArray(genderRes?.list)) {
          const donut = toGenderDonutData(genderRes);
          setGenderDonutData(donut);
          if (!donut.length) console.warn("Gender donut empty:", genderRes);
        } else {
          console.warn("Gender API not ok:", genderRes);
          setGenderDonutData([]);
        }
      } catch (err) {
        console.error("Admin dashboard load failed:", err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [getCards, getGender]);

  if (loading) {
    return (
      <Layout headerTitle="Admin Dashboard">
        <div className="flex justify-center items-center h-[70vh]">
          <Loader className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout headerTitle="Admin Dashboard">
      <div className="p-6 space-y-6">
        {/* Cards */}
        <div className="flex flex-wrap gap-6">
          {cards.map((c) => (
            <SchoolCardStatus key={c.title} title={c.title} total={c.value} />
          ))}
        </div>

        {/* Gender-wise Distribution */}
        <div className="max-w-md bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Gender-wise Distribution
          </h3>
          <DonutChartComponent data={genderDonutData} />
        </div>
      </div>
    </Layout>
  );
}
