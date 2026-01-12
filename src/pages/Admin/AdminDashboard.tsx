import { useEffect, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import BarChartComponent from "../../app/components/shared/BarChart";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";
import {
  useGetadminDashboardValuesParams,
  useGetgenderWiseDonutParams,
  useGetlocationWiseBarChartParams,
} from "../../app/core/api/Admin";
import { Loader } from "lucide-react";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const { mutateAsync: getLocationWise } = useGetlocationWiseBarChartParams();
  const { mutateAsync: getDashboardCard } = useGetadminDashboardValuesParams();
  const { mutateAsync: getGenderWise } = useGetgenderWiseDonutParams();

  const [statCards, setStatCards] = useState<any[]>([]);
  const [districtGraphData, setDistrictGraphData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [genderDonutData, setGenderDonutData] = useState<
    { name: string; value: number }[]
  >([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [cardRes, locationRes, genderRes] = await Promise.all([
        getDashboardCard(),
        getLocationWise(),
        getGenderWise(),
      ]);

      /* ---------- DASHBOARD CARDS ---------- */
      const cardData = cardRes?.list?.[0];

      setStatCards([
        {
          title: "Workshops Registered",
          value: Number(cardData?.total_work ?? 0),
        },
        {
          title: "Total Citizens",
          value: Number(cardData?.total_citizens ?? 0),
        },
        {
          title: "Pending Workshops",
          value: Number(cardData?.total_pending ?? 0),
        },
        {
          title: "Approved Workshops",
          value: Number(cardData?.total_approved ?? 0),
        },
        {
          title: "Rejected Workshops",
          value: Number(cardData?.total_rejected ?? 0),
        },
      ]);

      /* ---------- BAR CHART ---------- */
      setDistrictGraphData(locationRes?.list ?? []);

      /* ---------- DONUT CHART ---------- */
      const genderData =
        genderRes?.list?.map((g: any) => ({
          name: g.gender,
          value: Number(g.total),
        })) ?? [];

      setGenderDonutData(genderData);
    } catch (error) {
      Swal.fire("Error", "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <Layout headerTitle="Admin Dashboard">
      <div className="p-6 space-y-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl shadow p-5 text-center"
                >
                  <p className="text-sm font-semibold text-gray-600">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  District-wise Workshops
                </h3>
                <BarChartComponent
                  data={districtGraphData}
                  dataKey="total"
                  categoryKey="district"
                  height={300}
                />
              </div>

              <div className="lg:col-span-1 bg-white rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Gender-wise Distribution
                </h3>
                <DonutChartComponent data={genderDonutData} />
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
export default AdminDashboard;
