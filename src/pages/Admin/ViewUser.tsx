import { useEffect, useState } from "react";
import Layout from "../../app/components/Layout/Layout";
import TableComponent, {
  type Column,
} from "../../app/components/shared/TableComponent";
import { Loader } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import { useGetDeleteUser, useGetgetallusers } from "../../app/core/api/Admin";
import type { AllUser } from "../../app/lib/types";
import UserEditSheet from "./shared/UserEdit";
import ChangePasswordSheet from "./shared/ChangePasswordSheet";

export const ViewUser = () => {
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const { mutateAsync: getSchoolDashboradData } = useGetgetallusers();
  const [schoolSheetData, setSchoolSheetData] = useState<AllUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const getOffsetForPage = (page: number): number => {
    return page * itemsPerPage;
  };
  const [passwordUser, setPasswordUser] = useState<AllUser | null>(null);
  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const { mutateAsync: deleteUser } = useGetDeleteUser();
  const handleEditUser = (row: any) => {
    setSelectedUser(row.fullData);
    setSheetOpen(true);
  };
  const handleChangePassword = (row: AllUser) => {
    setPasswordUser(row);
    setPasswordSheetOpen(true);
  };

  const handleDeleteUser = async (row: any) => {
    const userId = row.fullData?.unique_user_id;
    if (!userId) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingUserId(userId);

      await deleteUser({ delete_user_id: userId });

      Swal.fire({
        title: "Deleted",
        text: "User deleted successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData();
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.response?.data?.message || "Failed to delete user",
        icon: "error",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const fetchData = async () => {
    try {
      setLoader(true);
      const offset = getOffsetForPage(currentPage).toString();
      const result = await getSchoolDashboradData({ offset });
      const sourceData = result?.data ?? [];
      const total_count = result?.count ?? 0;
      const transformed = sourceData.map((item: AllUser) => ({
        unique_user_id: item.unique_user_id || "-",
        csc_user_id: item.csc_user_id || "-",
        name: item.name || "-",
        username: item.username || "-",
        mobile_number: item.mobile_number || "-",
        email_id: item.email_id || "-",
        address: item.address || "-",
        district_name: item.district_name || "",
        sub_district_name: item.sub_district_name || "-",
        specilization: item.specilization || "-",
        degree: item.degree || "-",
        district: item.district || "-",
        state: item.state || "-",
        pincode: item.pincode || "-",
        last_log_in: item.last_log_in || "-",
        last_log_out: item.last_log_out || "-",
        created_at: item.created_at || "-",
        last_login_via: item.last_login_via || "-",
        user_type: item.user_type || "-",
        salutations: item.salutations || "-",
        fullData: item,
      }));

      setSchoolSheetData(transformed);
      setTotalCount(total_count);
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message, "error");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoader(false);
    }
  };
  const tableContents: Column[] = [
    // { key: "unique_user_id", label: "User ID", align: "center" },
    { key: "csc_user_id", label: "CSC User ID", align: "center" },
    { key: "name", label: "Name", align: "left" },
    // { key: "created_at", label: "Created at", align: "left" },
    { key: "username", label: "Username", align: "center" },
    { key: "mobile_number", label: "Mobile Number", align: "center" },
    { key: "email_id", label: "Email ID", align: "left" },
    { key: "address", label: "Address", align: "left" },
    { key: "degree", label: "Degree", align: "left" },
    { key: "specilization", label: "Specilization", align: "left" },
    { key: "district_name", label: "District", align: "center" },
    { key: "sub_district_name", label: "Sub District", align: "center" },
    { key: "state", label: "State", align: "center" },
    { key: "pincode", label: "Pincode", align: "center" },
    {
      key: "action",
      label: "Action",
      align: "center",
      render: (_value, row) => (
        <div className="flex justify-center gap-2">
          {/* UPDATE */}
          <button
            onClick={() => handleEditUser(row)}
            className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Update
          </button>

          {/* DELETE */}
          <button
            onClick={() => handleDeleteUser(row)}
            disabled={deletingUserId === row.fullData?.unique_user_id}
            className={`px-3 py-1 text-xs font-semibold rounded-md text-white flex items-center gap-1 cursor-pointer
    ${
      deletingUserId === row.fullData?.unique_user_id
        ? "bg-red-400 cursor-not-allowed"
        : "bg-red-600 hover:bg-red-700"
    }
  `}
          >
            {deletingUserId === row.fullData?.unique_user_id ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                Deleting
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      ),
    },
    {
      key: "change_password",
      label: "Change Password",
      align: "center",
      render: (_value, row) => (
        <button
          onClick={() => handleChangePassword(row)}
          className="px-3 py-1 text-xs font-semibold rounded-md bg-cyan-800 text-white hover:bg-cyan-600 cursor-pointer"
        >
          Change Password
        </button>
      ),
    },
  ];
  useEffect(() => {
    fetchData();
  }, [currentPage]);

  return (
    <Layout headerTitle="View Workshop">
      <div className="flex justify-between items-center flex-wrap gap-4 text-sm mt-3 px-4 pt-3">
        {/* Left-aligned count */}
        <div className="text-gray-600 font-bold">Total Count: {totalCount}</div>
      </div>

      <div className="mt-3">
        {loader ? (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : (
          <TableComponent
            columns={tableContents}
            data={schoolSheetData}
            itemsPerPage={itemsPerPage}
            totalItems={totalCount}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
      <UserEditSheet
        open={sheetOpen}
        user={selectedUser}
        onClose={(updated) => {
          setSheetOpen(false);
          setSelectedUser(null);
          if (updated) fetchData();
        }}
      />
      <ChangePasswordSheet
        open={passwordSheetOpen}
        user={passwordUser}
        onClose={() => {
          setPasswordSheetOpen(false);
          setPasswordUser(null);
        }}
      />
    </Layout>
  );
};
