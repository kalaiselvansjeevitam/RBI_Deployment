import { useNavigate } from "react-router-dom";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { ROUTE_URL } from "../../../app/core/constants/coreUrl";

const RBIReportsHome = () => {
  const navigate = useNavigate();

  const items = [
    {
      label: "District-wise Workshop Status",
      href: ROUTE_URL.rbiReportDistrictStatus,
    },
    {
      label: "Gender-wise Participation",
      href: ROUTE_URL.rbiReportGenderParticipation,
    },
    {
      label: "District-wise Citizen Data",
      href: ROUTE_URL.rbiReportCitizenData,
    },
    {
      label: "Location-wise Schedule",
      href: ROUTE_URL.rbiReportLocationSchedule,
    },
    {
      label: "Pending vs Complete / Approved vs Rejected",
      href: ROUTE_URL.rbiReportDistrictPendingComplete,
    },
    {
      label: "Workshops < 50 Attendees",
      href: ROUTE_URL.rbiReportWorkshopsLt50,
    },
  ];

  return (
    <Layout headerTitle="Reports">
      <div className="p-6 space-y-3">
        {items.map((it) => (
          <div
            key={it.href}
            className="bg-white rounded-2xl shadow p-4 flex justify-between items-center bg-gradient-to-br from-white to-gray-50 shadow-xl"
          >
            <div className="font-medium text-gray-700">{it.label}</div>
            <Button onClick={() => navigate(it.href)}>Open</Button>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default RBIReportsHome;
