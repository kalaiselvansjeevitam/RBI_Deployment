/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import Layout from "../../app/components/Layout/Layout";

import {
  useGetDistrictParams,
  useGetallStatusCountersParams,
  useGetgenderWiseDonutParams,
} from "../../app/core/api/Admin";

import DonutChartSubAdminComponent from "./Shared/Donutsubadmin";

/* -------------------- TYPES -------------------- */
type DistrictRow = {
  id?: string | number;
  district?: string;
  name?: string;
  district_name?: string;
};

type CardCounts = {
  total_workshops: string;
  pending_count: string;
  completed_count: string;
  approved_count: string;
  cancelled_count: string;
  rejected_count: string;
  total_location_managers: string;
};

type GenderCount = {
  gender: string;
  total: string;
};

/* -------------------- HELPERS -------------------- */
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

function normalizeDistrictName(d: any): string {
  return String(d?.district ?? d?.name ?? d?.district_name ?? d ?? "").trim();
}

/**
 * Supports:
 * 1) { list: [{ gender: "Male", total: "10" }, ...] }
 * 2) { list: [{ Male: "10", Female: "12", Other: "1" }] }
 * 3) { Male: "10", Female: "12", Other: "1" }
 */
function toGenderCounts(res: any): GenderCount[] {
  const list = Array.isArray(res?.list) ? res.list : null;

  // Case 1: list rows with gender/total
  if (
    Array.isArray(list) &&
    list.length &&
    (list[0]?.gender || list[0]?.name)
  ) {
    return list
      .map((g: any) => ({
        gender: String(g?.gender ?? g?.name ?? "").trim(),
        total: String(g?.total ?? g?.value ?? g?.count ?? "0"),
      }))
      .filter((x) => x.gender);
  }

  // Case 2: list[0] object-map
  if (Array.isArray(list) && list.length && typeof list[0] === "object") {
    const obj = list[0] ?? {};
    return Object.entries(obj)
      .map(([k, v]) => ({ gender: String(k).trim(), total: String(v ?? "0") }))
      .filter((x) => x.gender);
  }

  // Case 3: res object-map
  if (res && typeof res === "object" && !Array.isArray(res)) {
    return Object.entries(res)
      .map(([k, v]) => ({ gender: String(k).trim(), total: String(v ?? "0") }))
      .filter((x) => x.gender);
  }

  return [];
}

/* -------------------- UI COMPONENT -------------------- */
const DashboardSubAdmin = () => {
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getCardsApi } = useGetallStatusCountersParams();
  const { mutateAsync: getGenderCountsApi } = useGetgenderWiseDonutParams();

  const [district, setDistrict] = useState<string>("");
  // const [districtList, setDistrictList] = useState<string[]>([]);

  const [cards, setCards] = useState<CardCounts | null>(null);
  const [genderCounts, setGenderCounts] = useState<GenderCount[]>([]);

  const [loading, setLoading] = useState(true);

  const statCards = useMemo(() => {
    if (!cards) return [];
    return [
      { title: "Total Workshops", value: String(cards.total_workshops ?? "0") },
      { title: "Pending", value: String(cards.pending_count ?? "0") },
      { title: "Completed", value: String(cards.completed_count ?? "0") },
      { title: "Approved", value: String(cards.approved_count ?? "0") },
      { title: "Rejected", value: String(cards.rejected_count ?? "0") },
      { title: "Cancelled", value: String(cards.cancelled_count ?? "0") },
      {
        title: "Location Managers",
        value: String(cards.total_location_managers ?? "0"),
      },
    ];
  }, [cards]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);

        const [districtRes, cardRes, genderRes] = await Promise.all([
          getDistricts(),
          getCardsApi(),
          getGenderCountsApi(),
        ]);

        if (!alive) return;

        // Districts (kept in state in case you want to show district later)
        const rawDistricts: DistrictRow[] = districtRes?.list ?? [];
        const names = Array.isArray(rawDistricts)
          ? rawDistricts.map(normalizeDistrictName).filter(Boolean)
          : [];

        // setDistrictList(names);
        setDistrict(names[0] ?? "");

        // Cards
        setCards(cardRes?.list?.[0] ?? null);

        // Gender donut (robust mapping; don't over-gate)
        const ok = isOk(genderRes) || Array.isArray(genderRes?.list);
        if (!ok) {
          console.warn("Gender response not ok:", genderRes);
          setGenderCounts([]);
        } else {
          const mapped = toGenderCounts(genderRes);
          setGenderCounts(mapped);
          if (!mapped.length) console.warn("Gender list empty:", genderRes);
        }
      } catch (e) {
        console.error("SubAdmin dashboard load failed:", e);
        Swal.fire("Error", "Failed to load dashboard data", "error");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [getDistricts, getCardsApi, getGenderCountsApi]);

  return (
    <Layout headerTitle="Sub Admin Dashboard">
      <div className="px-6 mt-6 space-y-8">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* 🔹 SECTION 1: TOP SUMMARY (Cards) */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Overall Summary</h2>

              {cards ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statCards.map((c) => (
                    <Card key={c.title} title={c.title} value={c.value} />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  No summary data available.
                </div>
              )}
            </div>

            {/* 🔹 SECTION 2: GENDER DONUT */}
            <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Gender-wise Distribution
                </h2>

                {/* district kept in state; not shown unless you want */}
                {district ? (
                  <span className="text-xs text-gray-500">
                    District: {district}
                  </span>
                ) : null}
              </div>

              <div className="bg-white rounded-xl p-4 shadow h-[260px]">
                <DonutChartSubAdminComponent data={genderCounts} />
              </div>

              {!genderCounts?.length && (
                <div className="mt-3 text-xs text-gray-500">
                  No gender data available.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

/* -------------------- CARD COMPONENT -------------------- */
const Card = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-gradient-to-br from-sky-300 to-blue-400 rounded-2xl shadow p-5 text-center">
    <p className="text-sm font-semibold text-white/90">{title}</p>
    <p className="text-2xl font-bold mt-2 text-white">
      {toNumberSafe(value, 0)}
    </p>
  </div>
);

export default DashboardSubAdmin;
