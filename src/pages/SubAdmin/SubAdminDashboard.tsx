import Layout from "../../app/components/Layout/Layout";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  useGetallStatusCountersParams,
  useGetDistrictParams,
  useGetdistrictWiseWorkshopBarGraphParams,
  useGetgenderWiseDonutParams,
} from "../../app/core/api/Admin";
import DonutChartSubAdminComponent from "./Shared/Donutsubadmin";
import { Loader } from "lucide-react";

/* -------------------- TYPES -------------------- */
type CardCounts = {
  total_workshops: string;
  pending_count: string;
  completed_count: string;
  approved_count: string;
  cancelled_count: string;
  rejected_count: string;
  total_location_managers: string;
};

type StatusCounts = {
  completed_count: string;
  pending_count: string;
  approved_count: string;
  rejected_count: string;
  cancelled_count: string;
};

type GenderCount = {
  gender: string;
  total: string;
};

const DashboardSubAdmin = () => {
  /* -------------------- STATE -------------------- */
  const [district, setDistrict] = useState("Amravati");
  const [districtList, setDistrictList] = useState<any[]>([]);

  const [cards, setCards] = useState<CardCounts | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null);
  const [genderCounts, setGenderCounts] = useState<GenderCount[]>([]);

  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingDistrictData, setLoadingDistrictData] = useState(false);

  /* -------------------- API HOOKS -------------------- */
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getCardsApi } = useGetallStatusCountersParams();
  const { mutateAsync: getStatusCountsApi } =
    useGetdistrictWiseWorkshopBarGraphParams();
  const { mutateAsync: getGenderCountsApi } = useGetgenderWiseDonutParams();

  /* -------------------- EFFECTS -------------------- */

  // 🔹 Initial load (districts + top cards)
  useEffect(() => {
    loadInitialData();
  }, []);

  // 🔹 Reload only district-based data
  useEffect(() => {
    if (district) {
      loadDistrictWiseData();
    }
  }, [district]);

  /* -------------------- FUNCTIONS -------------------- */

  const loadInitialData = async () => {
    try {
      setLoadingCards(true);

      const [districtRes, cardRes] = await Promise.all([
        getDistricts(),
        getCardsApi(),
      ]);

      const districts = districtRes?.list ?? [];
      setDistrictList(districts);

      if (districts.length > 0) {
        setDistrict(districts[0].district);
      }

      setCards(cardRes?.list?.[0] ?? null);
    } catch {
      Swal.fire("Error", "Failed to load dashboard data", "error");
    } finally {
      setLoadingCards(false);
    }
  };

  const loadDistrictWiseData = async () => {
    try {
      setLoadingDistrictData(true);

      const [statusRes, genderRes] = await Promise.all([
        getStatusCountsApi({ district }),
        getGenderCountsApi(),
      ]);

      setStatusCounts(statusRes?.list?.[0] ?? null);
      setGenderCounts(genderRes?.list ?? []);
    } catch {
      Swal.fire("Error", "Failed to load district data", "error");
    } finally {
      setLoadingDistrictData(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Layout headerTitle="Sub Admin Dashboard">
      <div className="px-6 mt-6 space-y-8">
        {/* 🔹 SECTION 1: TOP SUMMARY */}
        <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Overall Summary</h2>

          {loadingCards ? (
            <div className="flex justify-center py-6">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            cards && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  title="Total Workshops"
                  value={cards.total_workshops ?? 0}
                />
                <Card title="Pending" value={cards.pending_count ?? 0} />
                <Card title="Completed" value={cards.completed_count ?? 0} />
                <Card title="Approved" value={cards.approved_count ?? 0} />
                <Card title="Rejected" value={cards.rejected_count ?? 0} />
                <Card title="Cancelled" value={cards.cancelled_count ?? 0} />
                <Card
                  title="Location Managers"
                  value={cards.total_location_managers}
                />
              </div>
            )
          )}
        </div>

        {/* 🔹 SECTION 2: DISTRICT STATUS */}
        <div className="bg-gray-50 rounded-2xl p-6 shadow-sm relative min-h-[220px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">District-wise Status</h2>

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border rounded-md p-2 text-sm bg-white"
            >
              {districtList.map((d) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>

          {loadingDistrictData && <SectionLoader />}

          <div
            className={
              loadingDistrictData ? "opacity-40 pointer-events-none" : ""
            }
          >
            {statusCounts && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card
                  title="Completed"
                  value={statusCounts.completed_count ?? 0}
                />
                <Card title="Pending" value={statusCounts.pending_count ?? 0} />
                <Card
                  title="Approved"
                  value={statusCounts.approved_count ?? 0}
                />
                <Card
                  title="Rejected"
                  value={statusCounts.rejected_count ?? 0}
                />
                <Card
                  title="Cancelled"
                  value={statusCounts.cancelled_count ?? 0}
                />
              </div>
            )}
          </div>
        </div>

        {/* 🔹 SECTION 3: GENDER DONUT */}
        <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Gender-wise Distribution
          </h2>

          {loadingDistrictData ? (
            <div className="flex justify-center py-6">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 shadow h-[260px]">
              <DonutChartSubAdminComponent data={genderCounts} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

/* -------------------- CARD COMPONENT -------------------- */

const Card = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-white rounded-2xl shadow p-5 text-center">
    <p className="text-sm font-semibold text-gray-600">{title}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default DashboardSubAdmin;

const SectionLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl z-10">
    <Loader className="w-6 h-6 animate-spin text-blue-600" />
  </div>
);
