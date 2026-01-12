import Layout from "../../../app/components/Layout/Layout";
import TableComponent, {
  type Column,
} from "../../../app/components/shared/TableComponent";
import { Loader } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import {
  useGetDistrictParams,
  useGetgetWorkshopList,
  useGetupdateWorkshopStatusByAdmin,
  useGetVleParams,
  useGetWorkShopParams,
} from "../../../app/core/api/Admin";
import type { Workshop } from "../../../app/lib/types";
import { useEffect, useState } from "react";
import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../../app/core/constants/coreUrl";

export const ViewManageSession = () => {
  const [loader, setLoader] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const { mutateAsync: getSchoolDashboradData } = useGetgetWorkshopList();
  const [schoolSheetData, setSchoolSheetData] = useState<Workshop[]>([]);
  const [statusList, setStatusList] = useState<string[]>([]);
  const [districtList, setDistrictList] = useState<any[]>([]);
  const [vleList, setVleList] = useState<any[]>([]);

  const { mutateAsync: getWorkshopStatuses } = useGetWorkShopParams();
  const { mutateAsync: getDistricts } = useGetDistrictParams();
  const { mutateAsync: getVles } = useGetVleParams();

  const clearFilters = () => {
    setDistrictFilter("");
    setWorkshopStatusFilter("");
    setVleIdFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [statusRes, districtRes, vleRes] = await Promise.all([
          getWorkshopStatuses(),
          getDistricts(),
          getVles({
            get_by: "vle",
          }),
        ]);

        setStatusList(statusRes?.data ?? []);
        setDistrictList(districtRes?.list ?? []);
        setVleList(vleRes?.data ?? []);
      } catch (error) {
        console.error("Dropdown API error:", error);
      }
    };

    loadDropdownData();
  }, []);

  const [totalCount, setTotalCount] = useState(0);
  const [districtfilter, setDistrictFilter] = useState<string>(""); // mandatory
  const [workshopStatusfilter, setWorkshopStatusFilter] = useState<string>("");
  const [vleIdfilter, setVleIdFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const formatDate = (date?: Date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  };
  const { mutateAsync: updateWorkshopStatus } =
    useGetupdateWorkshopStatusByAdmin();
  const handleApproveWorkshop = async (workshopId: number) => {
    try {
      const res = await updateWorkshopStatus({
        workshop_id: workshopId,
        workshop_status: "Approved",
        rejected_reason: "",
      });

      // ✅ success message from backend
      Swal.fire(
        "Success",
        res?.message || "Workshop approved successfully",
        "success",
      );

      fetchData(); // refresh table
    } catch (error: any) {
      // ✅ backend error message
      const message =
        error?.response?.data?.message || error?.message || "Approval failed";

      Swal.fire("Error", message, "error");
    }
  };

  const handleRejectWorkshop = async (workshopId: number) => {
    const { value: reason } = await Swal.fire({
      title: "Reject Workshop",
      input: "text",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter reason",
      showCancelButton: true,
      inputValidator: (value) =>
        !value ? "Rejection reason is required" : null,
    });

    if (!reason) return;

    try {
      const res = await updateWorkshopStatus({
        workshop_id: workshopId,
        workshop_status: "Rejected",
        rejected_reason: reason,
      });

      // ✅ success message from backend
      Swal.fire("Error", res?.message || "Workshop Rejected", "error");

      fetchData(); // refresh table
    } catch (error: any) {
      // ✅ backend error message
      const message =
        error?.response?.data?.message || error?.message || "Rejection failed";

      Swal.fire("Error", message, "error");
    }
  };

  const getOffsetForPage = (page: number): number => {
    return page * itemsPerPage;
  };
  const fetchData = async () => {
    if (!districtfilter) {
      Swal.fire("Validation Error", "District is mandatory", "warning");
      return;
    }
    const isOnlyOneDateSelected =
      (startDate && !endDate) || (!startDate && endDate);

    if (isOnlyOneDateSelected) {
      Swal.fire(
        "Validation Error",
        "Please select both Start Date and End Date",
        "warning",
      );
      return;
    }

    try {
      setLoader(true);
      const offset = getOffsetForPage(currentPage).toString();

      const result = await getSchoolDashboradData({
        offset,
        work_shop_status: workshopStatusfilter || "",
        vle_id: vleIdfilter || "",
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        district: districtfilter,
      });

      const sourceData = result?.data ?? [];
      const total_count = result?.count ?? 0;

      const transformed = sourceData.map((item: Workshop) => ({
        ...item,
      }));

      setSchoolSheetData(transformed);
      setTotalCount(total_count);
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message, "error");
    } finally {
      setLoader(false);
    }
  };

  const navigate = useNavigate();

  const handleViewTestimony = (workshopId: string) => {
    // Navigate to the testimony page and pass workshop_id
    navigate(`${ROUTE_URL.testimonyByWorkshop}?workshop_id=${workshopId}`);
  };
  const tableContents: Column[] = [
    { key: "workshop_id", label: "Workshop ID", align: "center" },
    { key: "workshop_name", label: "Workshop Name", align: "center" },
    { key: "workshop_date", label: "Date", align: "left" },
    {
      key: "time",
      label: "Time",
      align: "center",
      render: (_: any, row: Workshop) =>
        `${row.workshop_from_time} - ${row.workshop_to_time}`,
    },
    { key: "workshop_status", label: "Workshop Status", align: "left" },
    { key: "workshop_centre", label: "Workshop Center", align: "left" },
    { key: "workshop_district", label: "Workshop District", align: "left" },
    { key: "workshop_pincode", label: "Workshop Pincode", align: "left" },
    { key: "vle_id", label: "VLE ID", align: "center" },
    { key: "vle_mobile_number", label: "VLE Mobile Number", align: "center" },
    { key: "vle_name", label: "VLE Name", align: "center" },
    {
      key: "view_testimony",
      label: "View Testimony",
      align: "center",
      render: (_: any, row: Workshop) => (
        <button
          onClick={() => handleViewTestimony(row.workshop_id)}
          className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm"
        >
          View
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_: any, row: Workshop) => (
        <div className="flex justify-center gap-2">
          {row.workshop_status !== "Approved" && (
            <button
              onClick={() => handleApproveWorkshop(Number(row.workshop_id))}
              className="bg-green-600 text-white px-2 py-1 rounded-md text-xs"
            >
              Approve
            </button>
          )}

          {row.workshop_status !== "Rejected" && (
            <button
              onClick={() => handleRejectWorkshop(Number(row.workshop_id))}
              className="bg-red-600 text-white px-2 py-1 rounded-md text-xs"
            >
              Reject
            </button>
          )}
        </div>
      ),
    },
  ];
  useEffect(() => {
    if (districtfilter) {
      fetchData();
    }
  }, [currentPage]);

  const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
    <button
      onClick={onClick}
      ref={ref}
      className="border border-gray-700 rounded-md p-1 text-sm w-[140px] text-left"
    >
      {value || "Select Date"}
    </button>
  ));

  return (
    <Layout headerTitle="View Workshop">
      <div className="flex justify-between items-center flex-wrap gap-4 text-sm mt-3 px-4 pt-3">
        {/* Left-aligned count */}
        <div className="text-gray-600 font-bold">Total Count: {totalCount}</div>
      </div>
      <div className="flex justify-center items-center gap-4 mx-auto">
        <label className="flex items-center space-x-2 font-bold">
          <span>From:</span>
          <ReactDatePicker
            dateFormat={"dd/MM/yyyy"}
            selected={startDate}
            onChange={(date: any) => setStartDate(date || undefined)}
            placeholderText="Select Start Date"
            className="border border-gray-700 rounded-md p-1 text-sm w-[140px]"
            popperClassName="z-50"
            customInput={<CustomInput />}
          />
        </label>

        <label className="flex items-center space-x-2 font-bold">
          <span>To:</span>
          <ReactDatePicker
            dateFormat={"dd/MM/yyyy"}
            selected={endDate}
            onChange={(date: any) => setEndDate(date || undefined)}
            placeholderText="Select End Date"
            className="border border-gray-700 rounded-md p-1 text-sm w-[140px]"
            minDate={startDate}
            popperClassName="z-50"
            customInput={<CustomInput />}
          />
        </label>

        <label className="flex items-center space-x-2 font-bold">
          <span>Status:</span>
          <select
            value={workshopStatusfilter}
            onChange={(e) => setWorkshopStatusFilter(e.target.value)}
            className="border border-gray-700 rounded-md p-1 text-sm w-[150px]"
          >
            <option value="">Select Status</option>
            {statusList.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center space-x-2 font-bold">
          <span>District:</span>
          <select
            value={districtfilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="border border-gray-700 rounded-md p-1 text-sm w-[150px]"
          >
            <option value="">Select District</option>
            {districtList.map((d: any) => (
              <option key={d.id} value={d.district}>
                {d.district}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center space-x-2 font-bold">
          <span>VLE:</span>
          <select
            value={vleIdfilter}
            onChange={(e) => setVleIdFilter(e.target.value)}
            className="border border-gray-700 rounded-md p-1 text-sm w-[150px]"
          >
            <option value="">Select VLE</option>
            {vleList.map((v: any) => (
              <option key={v.unique_user_id} value={v.unique_user_id}>
                {v.name}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={() => {
            setCurrentPage(0);
            fetchData();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="bg-gray-400 text-white px-4 py-2 rounded-md text-sm"
        >
          Clear Filters
        </button>
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
    </Layout>
  );
};
export default ViewManageSession;
