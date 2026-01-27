import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import TableComponent, {
  type Column,
} from "../../../app/components/shared/TableComponent";
// import { Button } from "../../../app/components/ui/button";
import { Loader } from "lucide-react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import React from "react";
import {
  useGetupdateWorkshopStatus,
  useGetWorkshopByFilters,
  useGetWorkshopByFiltersByDate,
} from "../../../app/core/api/Admin";
import SchoolSheet from "./Shared/SchoolSheet";
import { Button } from "../../../app/components/ui/button";
import type { WorkshopByFiltersData } from "../../../app/lib/types";

export const ViewWorkshop = () => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [loader, setLoader] = useState(false);
  //   const [open, setOpen] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);
  //   const [loaderside, setLoaderSide] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const { mutateAsync: getSchoolDashboradData } = useGetWorkshopByFilters();
  //   const { mutateAsync: getSchoolPaymentDetails } = useGetSchoolPaymentDetails();
  const { mutateAsync: getSchoolDetailsByDate } =
    useGetWorkshopByFiltersByDate();
  const [submitTrigger, setSubmitTrigger] = useState(0);
  //   const [studentSheetData, setStudentSheetData] = useState<any[]>([]);
  const [schoolSheetData, setSchoolSheetData] = useState<
    WorkshopByFiltersData[]
  >([]);
  const [totalCount, setTotalCount] = useState(0);
  const [workingStatus, setWorkingStatus] = useState<string>("");
  const getOffsetForPage = (page: number): number => {
    return page * itemsPerPage;
  };
  const [open, setOpen] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(
    null,
  );
  // const [selectedWorkshop, setSelectedWorkshop] =
  //   useState<WorkshopByFiltersData | null>(null);

  const fetchData = async () => {
    try {
      setLoader(true);
      const offset = getOffsetForPage(currentPage).toString();
      const result = await getSchoolDashboradData({ offset, get_by: "all" });
      const sourceData = result?.list ?? [];
      const total_count = result?.total ?? 0;
      const transformed = sourceData.map((item: WorkshopByFiltersData) => ({
        id: item.id || "-",
        workshop_name: item.workshop_name || "-",
        date: item.date || "-",
        from_time: item.from_time || "-",
        to_time: item.to_time || "-",
        vle_name: item.vle_name || "-",
        work_shop_status: item.work_shop_status || "-",
        district: item.district || "-",
        block_panchayat: item.block_panchayat || "-",
        gram_panchayat: item.gram_panchayat || "-",
        gram_panchayat_code: item.gram_panchayat_code || "-",
        location: item.location || "-",
        checklist: item.checklist || "",
        total_citizens: item.total_citizens || "0",
        videos_count: item.videos_count || "0",
        images_count: item.images_count || "0",
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

  const fetchDataByDate = async () => {
    if (!startDate || !endDate) return;
    try {
      setLoader(true);
      const formatDate = (date: Date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const offset = getOffsetForPage(currentPage).toString();
      const response = await getSchoolDetailsByDate({
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        offset,
        work_shop_status: workingStatus,
      });

      const rawData = response?.list ?? [];
      const count = response?.total ?? 0;
      if (response?.result.toLowerCase() == "success") {
        Swal.fire("Success", response?.message, "success");
      } else {
        Swal.fire("Error", response?.message, "error");
      }
      const transformed = rawData.map((item: WorkshopByFiltersData) => ({
        id: item.id || "-",
        workshop_name: item.workshop_name || "-",
        date: item.date || "-",
        from_time: item.from_time || "-",
        to_time: item.to_time || "-",
        vle_name: item.vle_name || "-",
        work_shop_status: item.work_shop_status || "-",
        district: item.district || "-",
        block_panchayat: item.block_panchayat || "-",
        gram_panchayat: item.gram_panchayat || "-",
        gram_panchayat_code: item.gram_panchayat_code || "-",
        location: item.location || "-",
        checklist: item.checklist || "",
        total_citizens: item.total_citizens || "0",
        videos_count: item.videos_count || "0",
        images_count: item.images_count || "0",
        fullData: item,
      }));
      setSchoolSheetData(transformed);
      setTotalCount(count);
    } catch (error: any) {
      Swal.fire("Error", error?.response?.data?.message, "error");
      console.error("API call failed:", error);
    } finally {
      setLoader(false);
    }
  };
  const [shouldReload, setShouldReload] = useState(false);
  // const handleSheetClose = (updated = false) => {
  //   setOpen(false);

  //   if (updated) {
  //     setShouldReload(true);
  //   }
  // };
  useEffect(() => {
    if (!shouldReload) return;

    if (filterApplied) {
      fetchDataByDate();
    } else {
      fetchData();
    }

    setShouldReload(false);
  }, [shouldReload]);

  useEffect(() => {
    if (filterApplied) {
      fetchDataByDate();
    } else {
      fetchData();
    }
  }, [currentPage, filterApplied, submitTrigger]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setFilterApplied(false);
    }
  }, [startDate, endDate]);
  const STATUS_OPTIONS = ["Completed", "Cancelled"];

  const StatusUpdater = ({ row }: { row: WorkshopByFiltersData }) => {
    const [loading, setLoading] = useState(false);

    const { mutateAsync: updateWorkshopStatus } = useGetupdateWorkshopStatus();
    const isApproved = row.work_shop_status?.toLowerCase() === "approved";

    const openStatusPopup = async () => {
      const { value } = await Swal.fire({
        title: "Update Status",
        html: `
  <div style="
    display:flex;
    flex-direction:column;
    gap:10px;
    font-size:13px;
    color:#111827;
    text-align:left;
  ">

    <label style="font-weight:600;font-size:12px">
      Status <span style="color:#dc2626">*</span>
    </label>

    <select
      id="status"
      class="swal2-input"
      style="height:32px;font-size:13px;color:#111827;border:1px solid #9ca3af"
    >
      <option value="">Select Status</option>
      ${STATUS_OPTIONS.map((s) => `<option value="${s}">${s}</option>`).join(
        "",
      )}
    </select>

    <label style="font-weight:600;font-size:12px;margin-top:6px">
      Feedback Notes <span style="color:#dc2626">*</span>
    </label>

    <textarea
      id="notes"
      class="swal2-textarea"
      style="font-size:13px;min-height:70px;color:#111827;border:1px solid #9ca3af"
      placeholder="Enter notes"
    ></textarea>

  </div>
`,

        showCancelButton: true,
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
        focusConfirm: false,
        customClass: {
          popup: "rounded-lg",
          title: "text-sm font-semibold",
          confirmButton:
            "px-3 py-1 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md ml-2",

          cancelButton:
            "px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md mr-2",
        },
        buttonsStyling: false,
        preConfirm: () => {
          const status = (
            document.getElementById("status") as HTMLSelectElement
          )?.value;

          const notes = (
            document.getElementById("notes") as HTMLTextAreaElement
          )?.value;

          if (!status) {
            Swal.showValidationMessage("Please select a status");
            return;
          }

          if (!notes || !notes.trim()) {
            Swal.showValidationMessage("Notes are required");
            return;
          }

          return { status, notes };
        },
      });

      if (!value) return;

      await saveStatus(value.status, value.notes);
    };

    const saveStatus = async (status: string, notes: string) => {
      try {
        setLoading(true);

        const res = await updateWorkshopStatus({
          work_shop_id: row.id,
          status,
          notes, // ✅ notes passed here
        });

        if (res?.result?.toLowerCase() === "success") {
          Swal.fire("Success", res.message, "success");

          // update UI instantly
          row.work_shop_status = status;
        } else {
          Swal.fire("Error", res.message, "error");
        }
      } catch (error: any) {
        Swal.fire(
          "Error",
          error?.response?.data?.message || "Failed to update status",
          "error",
        );
        console.error("Update failed", error);
      } finally {
        setLoading(false);
      }
    };

    return (
      <button
        disabled={loading || isApproved}
        onClick={openStatusPopup}
        className={`px-3 py-1 text-xs font-semibold rounded-md
      ${
        isApproved
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }
      disabled:opacity-50`}
        title={
          isApproved ? "Approved sessions cannot be updated" : "Update Status"
        }
      >
        Update
      </button>
    );
  };

  const tableContents: Column[] = [
    { key: "id", label: "ID", align: "center" },
    { key: "workshop_name", label: "Workshop Name", align: "center" },
    { key: "date", label: "Date", align: "left" },
    {
      key: "time",
      label: "Time",
      align: "center",
      render: (_value, row) => `${row.from_time} - ${row.to_time}`,
    },
    { key: "vle_name", label: "VLE Name", align: "center" },
    { key: "work_shop_status", label: "Workshop Status", align: "center" },
    { key: "location", label: "Location", align: "center" },
    { key: "district", label: "District", align: "center" },
    { key: "block_panchayat", label: "Block Panchayat", align: "center" },
    {
      key: "gram_panchayat_",
      label: "Gram Panchayat",
      align: "center",
      render: (_value, row) =>
        `${row.gram_panchayat_code} - ${row.gram_panchayat}`,
    },
    {
      key: "view",
      label: "View",
      align: "center",
      render: (_value, row) => (
        <Button
          size="sm"
          onClick={() => {
            setSelectedWorkshopId(row.id);
            setOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
    {
      key: "status",
      label: "Update Status",
      align: "center",
      render: (_v, r) => <StatusUpdater row={r} />,
    },
  ];

  const handleOkClick = () => {
    if (!startDate || !endDate) {
      Swal.fire("Error", "Please select both start and end dates", "warning");
      return;
    }
    if (!workingStatus) {
      Swal.fire("Error", "Please select Status Filter", "warning");
      return;
    }
    if (startDate > endDate) {
      Swal.fire(
        "Error",
        "Please select end date is greater than start date",
        "warning",
      );
      return;
    }
    setFilterApplied(true);
    setCurrentPage(0);
    setSubmitTrigger((prev) => prev + 1);
  };

  const CustomInput = React.forwardRef(({ value, onClick }: any, ref: any) => (
    <button
      onClick={onClick}
      ref={ref}
      className="border border-gray-700 rounded-md p-1 text-sm w-[140px] text-left"
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
  const PROJECT_START_DATE = new Date(2025, 11, 1); // Dec = 11
  const PROJECT_END_DATE = new Date(2026, 2, 31); // Mar = 2

  return (
    <Layout headerTitle="View Workshop">
      <div className="flex justify-between items-center flex-wrap gap-4 text-sm mt-3 px-4 pt-3">
        {/* Left-aligned count */}
        <div className="text-gray-600 font-bold">Total Count: {totalCount}</div>

        {/* Centered filters (use margin auto for center alignment) */}
        <div className="flex justify-center items-center gap-4 mx-auto">
          <label className="flex items-center space-x-2 font-bold">
            <span>From:</span>
            <ReactDatePicker
              dateFormat={"dd/MM/yyyy"}
              selected={startDate}
              onChange={(date: any) =>
                setStartDate(normalizeDate(date || undefined))
              }
              placeholderText="Select Start Date"
              minDate={PROJECT_START_DATE}
              maxDate={PROJECT_END_DATE}
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
              onChange={(date: any) =>
                setEndDate(normalizeDate(date || undefined))
              }
              minDate={startDate || PROJECT_START_DATE}
              maxDate={PROJECT_END_DATE}
              placeholderText="Select End Date"
              className="border border-gray-700 rounded-md p-1 text-sm w-[140px]"
              popperClassName="z-50"
              customInput={<CustomInput />}
            />
          </label>

          <label className="flex items-center space-x-2 font-bold">
            <span>Status:</span>
            <select
              value={workingStatus}
              onChange={(e) => setWorkingStatus(e.target.value)}
              className="border border-gray-700 rounded-md p-1 text-sm w-[150px]"
            >
              <option value="">Select Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
              {/* <option value="PendingforApproval">Pending for Approval</option> */}
            </select>
          </label>

          <button
            onClick={handleOkClick}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
          >
            Submit
          </button>
        </div>
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

      <SchoolSheet
        open={open}
        workshopId={selectedWorkshopId}
        openClose={() => setOpen(false)}
      />
    </Layout>
  );
};
