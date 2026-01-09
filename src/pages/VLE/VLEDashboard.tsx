import { useEffect, useMemo, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import BarChartComponent from "../../app/components/shared/BarChart";
import SchoolCardStatus from "./shared/SchoolCardStatus";
import { Loader } from "lucide-react";
import {
  useGetgenderWiseDonutParams,
  useGetlocationWiseBarChartParams,
  useGetVLEDashboard,
} from "../../app/core/api/Admin";
import type { GetCityCountRes, GetGenderCountRes } from "../../app/lib/types";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";

/* ---------- TYPES ---------- */

export interface WorkshopStatusCount {
  Completed: number;
  Approved: number;
  Rejected: number;
  Cancelled: number;
  SendingForApproval: number;
}

export interface VLEDashboardResponse {
  result: string;
  message: string;
  data: {
    total_citizens_count: number;
    gender_wise_count: {
      Male: number;
      Female: number;
    };
    total_sessions_count: number;
    workshop_approved_status_count: number;
    bar_graph: WorkshopStatusCount;
  };
}

const VLEDashboard = () => {
  const { mutateAsync: getVLEDashboard } = useGetVLEDashboard();
  const { mutateAsync: getGenderWise } = useGetgenderWiseDonutParams();
  const { mutateAsync: getLocationWise } = useGetlocationWiseBarChartParams();

  const [genderData, setGenderData] = useState<GetGenderCountRes["list"]>([]);
  const [cityData, setCityData] = useState<GetCityCountRes["list"]>([]);

  const [dashboardData, setDashboardData] = useState<
    VLEDashboardResponse["data"] | null
  >(null);
  const [loading, setLoading] = useState(true);

  /* ---------- API CALL ON PAGE LOAD ---------- */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [dashboardRes, genderRes, cityRes] = await Promise.all([
          getVLEDashboard(),
          getGenderWise(),
          getLocationWise(),
        ]);

        if (dashboardRes?.result === "Success") {
          setDashboardData(dashboardRes.data);
        }

        if (genderRes?.result === "success") {
          setGenderData(genderRes.list);
        }

        if (cityRes?.result === "success") {
          setCityData(cityRes.list);
        }
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);
  const genderChartData = useMemo(() => {
    return genderData.map((item) => ({
      name: item.gender,
      value: Number(item.total),
    }));
  }, [genderData]);
  const cityChartData = useMemo(() => {
    return cityData.map((item) => ({
      city: item.city,
      Citizen_Count: Number(item.total),
    }));
  }, [cityData]);

  /* ---------- BAR CHART DATA ---------- */
  const sessionStatusData = useMemo(() => {
    if (!dashboardData) return [];

    return Object.entries(dashboardData.bar_graph).map(([status, count]) => ({
      status,
      count,
    }));
  }, [dashboardData]);

  /* ---------- LOADING STATE ---------- */
  if (loading) {
    return (
      <Layout headerTitle="VLE Dashboard">
        <div className="flex justify-center items-center h-[70vh]">
          <Loader className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      </Layout>
    );
  }

  /* ---------- UI ---------- */
  return (
    <Layout headerTitle="VLE Dashboard">
      <div className="p-6 space-y-6">
        {/* ---------- STAT CARDS ---------- */}
        <div className="flex flex-wrap gap-6">
          <SchoolCardStatus
            title="Total Citizens"
            total={dashboardData?.total_citizens_count ?? 0}
          />

          <SchoolCardStatus
            title="Approved Sessions"
            total={dashboardData?.workshop_approved_status_count ?? 0}
          />

          <SchoolCardStatus
            title="Total Sessions"
            total={dashboardData?.total_sessions_count ?? 0}
          />
        </div>

        {/* ---------- BAR CHART ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* -------- BAR CHART CARD (3 parts) -------- */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Session Status Overview
            </h3>

            <div className="h-[300px]">
              <BarChartComponent
                data={sessionStatusData}
                dataKey="count"
                categoryKey="status"
                height={300}
                fillColor="#4f718aff"
              />
            </div>
          </div>

          {/* -------- DONUT CHART CARD (1 part) -------- */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-8">
              Gender Distribution
            </h4>

            <DonutChartComponent data={genderChartData} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            City-wise Citizen Count
          </h3>

          <div className="h-[300px]">
            <BarChartComponent
              data={cityChartData}
              dataKey="Citizen_Count"
              categoryKey="city"
              height={300}
              fillColor="#22c55e"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VLEDashboard;
