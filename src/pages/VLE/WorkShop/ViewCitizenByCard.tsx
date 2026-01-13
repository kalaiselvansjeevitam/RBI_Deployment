import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import TableComponent, {
  type Column,
} from "../../../app/components/shared/TableComponent";
import { useGetViewCitizenByCard } from "../../../app/core/api/Admin";
import Layout from "../../../app/components/Layout/Layout";
import { useSearchParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const itemsPerPage = 10;

const ViewCitizenByCard = () => {
  const [searchParams] = useSearchParams();
  const workshopId = searchParams.get("workshop_id");
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const { mutateAsync: getViewCitizenByCard } = useGetViewCitizenByCard();
  const fetchCitizens = async () => {
    if (!workshopId) return;

    try {
      setLoading(true);

      const offset = currentPage * itemsPerPage;

      const response = await getViewCitizenByCard({
        work_shop_id: workshopId,
        offset,
        getBy: "limit",
      });

      const list = response?.list ?? [];
      const count = response?.total ?? 0;

      setData(list);
      setTotalCount(count);
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message, "error");
      console.error("Failed to fetch citizens", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [workshopId, currentPage]);

  const columns: Column[] = [
    { key: "id", label: "ID", align: "center" },
    { key: "name", label: "Name", align: "left" },
    { key: "mobile_number", label: "Phone", align: "center" },
    { key: "email_id", label: "Email", align: "left" },
    { key: "qualification", label: "Qualification", align: "left" },
    { key: "gender", label: "Gender", align: "center" },
    { key: "age", label: "Age", align: "left" },
    { key: "father_name", label: "Father Name", align: "left" },
    { key: "mother_name", label: "Mother Name", align: "left" },
    { key: "address", label: "Address", align: "left" },
    { key: "created_at", label: "Registered On", align: "center" },
  ];

  const navigate = useNavigate();
  return (
    <Layout headerTitle="View Citizen Details">
      <div className="mb-4 flex items-center justify-between">
        {/* Total count */}
        <div className="text-gray-600 font-bold">Total Count: {totalCount}</div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 text-sm font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          ← Back
        </button>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <TableComponent
            columns={columns}
            data={data}
            itemsPerPage={itemsPerPage}
            totalItems={totalCount}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </Layout>
  );
};
export default ViewCitizenByCard;
