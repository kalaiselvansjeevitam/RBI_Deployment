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
// import { useNavigate } from "react-router-dom";
// import { ROUTE_URL } from "../../../app/core/constants/coreUrl";
import AdminViewSheet from "./shared/AdminViewSheet";
import { Button } from "../../../app/components/ui/button";

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
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null,
  );

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
  const [open, setOpen] = useState(false);
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
      Swal.fire("Success", res?.message || "Workshop Rejected", "success");

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

  // const navigate = useNavigate();

  // const handleViewTestimony = (workshopId: string) => {
  //   // Navigate to the testimony page and pass workshop_id
  //   navigate(`${ROUTE_URL.testimonyByWorkshop}?workshop_id=${workshopId}`);
  // };
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
      key: "view",
      label: "View",
      align: "center",
      render: (_value, row: Workshop) => (
        <Button
          size="sm"
          onClick={() => {
            setSelectedWorkshopId(row.workshop_id);
            setOpen(true);
          }}
        >
          View
        </Button>
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
      className={`border border-gray-700 rounded-md px-3 py-2 text-sm w-[180px] text-left
        ${value ? "text-black font-bold" : "text-gray-400 font-normal"}
      `}
    >
      {value || "Select Date"}
    </button>
  ));
  const normalizeDate = (date: Date | null) => {
    if (!date) return undefined;
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  return (
    <Layout headerTitle="View Session">
      <div className="mt-4 px-4 space-y-4 w-full">
        {/* Row 1: All Filters */}
        <div className="flex items-end justify-between w-full pl-10">
          <div className="flex flex-col w-[180px] text-black">
            <span className="text-sm font-semibold text-black-900 mb-1">
              From
            </span>
            <ReactDatePicker
              selected={startDate}
              onChange={(date: any) =>
                setStartDate(normalizeDate(date || undefined))
              }
              dateFormat="dd/MM/yyyy"
              customInput={<CustomInput />}
              popperClassName="z-50"
            />
          </div>

          <div className="flex flex-col w-[180px]">
            <span className="text-sm font-semibold text-black-900 mb-1">
              To
            </span>
            <ReactDatePicker
              selected={endDate}
              onChange={(date: any) =>
                setEndDate(normalizeDate(date || undefined))
              }
              dateFormat="dd/MM/yyyy"
              minDate={startDate}
              customInput={<CustomInput />}
              popperClassName="z-50"
            />
          </div>

          <div className="flex flex-col w-[200px]">
            <span className="text-sm font-semibold mb-1">Status</span>
            <select
              value={workshopStatusfilter}
              onChange={(e) => setWorkshopStatusFilter(e.target.value)}
              className={`border border-gray-700 rounded-md px-2 py-2 text-sm
          ${workshopStatusfilter ? "text-black-900 font-bold" : "text-black-100"}
        `}
            >
              <option value="">Select Status</option>
              {statusList.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-[200px]">
            <span className="text-sm font-semibold mb-1">District</span>
            <select
              value={districtfilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className={`border border-gray-700 rounded-md px-2 py-2 text-sm
          ${districtfilter ? "text-black-900 font-bold" : "text-black-100"}
        `}
            >
              <option value="">Select District</option>
              {districtList.map((d: any) => (
                <option key={d.id} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col w-[220px]">
            <span className="text-sm font-semibold mb-1">VLE</span>
            <select
              value={vleIdfilter}
              onChange={(e) => setVleIdFilter(e.target.value)}
              className={`border border-gray-700 rounded-md px-2 py-2 text-sm
          ${vleIdfilter ? "text-black-900 font-bold" : "text-black-100"}
        `}
            >
              <option value="">Select VLE</option>
              {vleList.map((v: any) => (
                <option key={v.unique_user_id} value={v.unique_user_id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Buttons only */}
        <div className="flex justify-end gap-4 w-full">
          <button
            onClick={() => {
              setCurrentPage(0);
              fetchData();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-semibold"
          >
            Apply
          </button>

          <button
            onClick={clearFilters}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-md text-sm font-semibold"
          >
            Clear
          </button>
        </div>
      </div>
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
      <AdminViewSheet
        open={open}
        workshopId={selectedWorkshopId}
        openClose={() => setOpen(false)}
      />
    </Layout>
  );
};
export default ViewManageSession;
