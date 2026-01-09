import Layout from "../../app/components/Layout/Layout";
// import { useState } from "react";
import BarChartComponent from "../../app/components/shared/BarChart";
import DonutChartComponent from "../../app/components/shared/DonutChartComponent";

/* ---------- DUMMY DATA (replace later) ---------- */

const statCards = [
  { title: "Workshops Registered", value: 24 },
  { title: "Total Citizens", value: 312 },
  { title: "Pending Workshops", value: 6 },
  { title: "Approved Workshops", value: 15 },
  { title: "Rejected Workshops", value: 3 },
];

const districtGraphData = [
  { district: "Chennai", count: 10 },
  { district: "Coimbatore", count: 8 },
  { district: "Madurai", count: 6 },
];

const genderGraphData = [
  { name: "Male", value: 180 },
  { name: "Female", value: 132 },
];

const AdminDashboard = () => {
  // const [district, setDistrict] = useState("");

  return (
    <Layout headerTitle="Admin Dashboard">
      <div className="p-6 space-y-6">
        {/* ---------- DISTRICT DROPDOWN ---------- */}
        {/* <div className="flex justify-end">
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="border rounded-md px-4 py-2 text-sm"
          >
            <option value="">All Districts</option>
            <option value="Chennai">Chennai</option>
            <option value="Coimbatore">Coimbatore</option>
            <option value="Madurai">Madurai</option>
          </select>
        </div> */}

        {/* ---------- STAT CARDS ---------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow p-5 text-center"
            >
              <p className="font-bold text-sm text-black-500">{card.title}</p>
              <p className="text-2xl font-semibold text-black-700 mt-2">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* ---------- GRAPHS ---------- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* District-wise Graph */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold text-black-700 mb-4">
              District-wise Workshops
            </h3>

            <div className="h-[300px]">
              <BarChartComponent
                data={districtGraphData}
                dataKey="count"
                categoryKey="district"
                height={300}
                fillColor="#6366f1"
              />
            </div>
          </div>

          {/* Gender-wise Graph */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow p-6 ">
            <h3 className="text-lg font-semibold text-black-700 mb-4">
              Gender-wise Distribution
            </h3>

            <DonutChartComponent data={genderGraphData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
