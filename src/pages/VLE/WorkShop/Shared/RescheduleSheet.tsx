import { Loader } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../../../app/components/ui/sheet";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import type {
  // BlockPanchayatRes,
  // District,
  // GetDistrictListRes,
  // GramPanchayatRes,
  WorkshopByFiltersData,
} from "../../../../app/lib/types";
import { Button } from "../../../../app/components/ui/button";
import { useGetReschedule } from "../../../../app/core/api/Admin";
// import {
//   useGetBlockPanchayat,
//   useGetDistrictParams,
//   useGetGramPanchayat,
// } from "../../../../app/core/api/Admin";

/* ---------- PROPS ---------- */

type StudentSheetProps = {
  open: boolean;
  workshop: WorkshopByFiltersData[]; // passed from parent
  openClose: (updated?: boolean) => void;
};

/* ---------- TYPES ---------- */

type RescheduleForm = {
  date: string;
  from_time: string;
  to_time: string;
  // district: string;
  // block_panchayat: string;
  // gram_panchayat: string;
  // gram_panchayat_code: string;
};

/* ---------- COMPONENT ---------- */

const RescheduleSheet = ({ open, workshop, openClose }: StudentSheetProps) => {
  const [loading] = useState(false);

  // 👉 take first workshop from array
  const selectedWorkshop = workshop?.[0] ?? null;

  const [rescheduleData, setRescheduleData] = useState<RescheduleForm | null>(
    null,
  );
  const { mutateAsync: getReschedule } = useGetReschedule();
  // const { mutateAsync: getGramPanchayat } = useGetGramPanchayat();
  // const [blockPanchayats, setBlockPanchayats] = useState<BlockPanchayatRes[]>(
  //   [],
  // );
  // const [gramPanchayats, setGramPanchayats] = useState<GramPanchayatRes[]>([]);
  // const [loadingdist, setLoadingdist] = useState(false);
  // const [loadingbp, setLoadingbp] = useState(false);
  // const [districts, setDistricts] = useState<District[]>([]);
  // const { mutateAsync: getDistricts } = useGetDistrictParams();

  // useEffect(() => {
  //   const fetchDistricts = async () => {
  //     try {
  //       const res: GetDistrictListRes = await getDistricts();
  //       if (res?.result === "success") {
  //         setDistricts(res.list);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch districts", error);
  //     }
  //   };

  //   fetchDistricts();
  // }, [getDistricts]);

  /* ---------- SET RESCHEDULE DATA ---------- */

  useEffect(() => {
    if (selectedWorkshop) {
      setRescheduleData({
        date: selectedWorkshop.date,
        from_time: selectedWorkshop.from_time,
        to_time: selectedWorkshop.to_time,
        // district: selectedWorkshop.district,
        // block_panchayat: selectedWorkshop.block_panchayat,
        // gram_panchayat: selectedWorkshop.gram_panchayat,
        // gram_panchayat_code: selectedWorkshop.gram_panchayat_code,
      });
    }
  }, [selectedWorkshop]);

  /* ---------- HELPERS ---------- */

  const handleChange = (key: keyof RescheduleForm, value: string) => {
    setRescheduleData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const isEditable =
    selectedWorkshop?.work_shop_status === "Pending" ||
    selectedWorkshop?.work_shop_status === "Rejected";

  /* ---------- SUBMIT ---------- */

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData || !selectedWorkshop) return;

    const payload = {
      workshop_id: selectedWorkshop.id,
      ...rescheduleData,
    };

    console.log("RESCHEDULE PAYLOAD", payload);

    try {
      const res = await getReschedule(payload); // ✅ await is important

      if (res?.result?.toLowerCase() === "success") {
        Swal.fire({
          title: "Success",
          text: res?.message || "Workshop rescheduled successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        // API responded but result is failure
        Swal.fire({
          title: "Failed",
          timer: 2500,
          showConfirmButton: false,
          text: res?.message || "Workshop reschedule failed",
          icon: "error",
        });
      }
    } catch (error: any) {
      // ✅ safely read API error message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while rescheduling";

      Swal.fire({
        timer: 3000,
        showConfirmButton: false,
        title: "Failed",
        text: errorMessage,
        icon: "error",
      });

      console.error("Reschedule Error:", error);
    }
  };

  // async function handleLocationChange(districtName: string): Promise<void> {
  //   setLoadingdist(true);
  //   // set district in form
  //   setRescheduleData((prev) =>
  //     prev
  //       ? {
  //           ...prev,
  //           district: districtName,
  //           block_panchayat: "",
  //           gram_panchayat: "",
  //           gram_panchayat_code: "",
  //         }
  //       : prev,
  //   );

  //   if (!districtName) {
  //     setBlockPanchayats([]);
  //     setLoadingdist(false);
  //     return;
  //   }

  //   try {
  //     const response = await getBlockPanchayat({
  //       district: districtName, // 👈 passing district name
  //     });

  //     if (response?.result === "success") {
  //       setBlockPanchayats(response.list);
  //     } else {
  //       setBlockPanchayats([]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch block panchayat", error);
  //     setBlockPanchayats([]);
  //   } finally {
  //     setLoadingdist(false);
  //   }
  // }
  // async function handleGramPanchayatChange(
  //   blockPanchayatName: string,
  // ): Promise<void> {
  //   setLoadingbp(true);

  //   // set selected block panchayat in form
  //   setRescheduleData((prev) =>
  //     prev
  //       ? {
  //           ...prev,
  //           block_panchayat: blockPanchayatName,
  //           gram_panchayat: "",
  //           gram_panchayat_code: "",
  //         }
  //       : prev,
  //   );

  //   if (!blockPanchayatName) {
  //     setGramPanchayats([]);
  //     setLoadingbp(false);
  //     return;
  //   }

  //   try {
  //     const response = await getGramPanchayat({
  //       block_panchayat_name: blockPanchayatName,
  //     });

  //     if (response?.result === "success") {
  //       setGramPanchayats(response.list);
  //     } else {
  //       setGramPanchayats([]);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch gram panchayat", error);
  //     setGramPanchayats([]);
  //   } finally {
  //     setLoadingbp(false);
  //   }
  // }
  // useEffect(() => {
  //   if (!rescheduleData) return;

  //   const preloadLocationData = async () => {
  //     try {
  //       // 1️⃣ Load block panchayats if district exists
  //       if (rescheduleData.district) {
  //         setLoadingdist(true);
  //         const blockRes = await getBlockPanchayat({
  //           district: rescheduleData.district,
  //         });

  //         if (blockRes?.result === "success") {
  //           setBlockPanchayats(blockRes.list);
  //         }
  //         setLoadingdist(false);
  //       }

  //       // 2️⃣ Load gram panchayats if block exists
  //       if (rescheduleData.block_panchayat) {
  //         setLoadingbp(true);
  //         const gramRes = await getGramPanchayat({
  //           block_panchayat_name: rescheduleData.block_panchayat,
  //         });

  //         if (gramRes?.result === "success") {
  //           setGramPanchayats(gramRes.list);
  //         }
  //         setLoadingbp(false);
  //       }
  //     } catch (error) {
  //       console.error("Failed to preload location data", error);
  //     }
  //   };

  //   preloadLocationData();
  // }, [rescheduleData?.district, rescheduleData?.block_panchayat]);

  /* ---------- UI ---------- */
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const getLastWorkingDate = () => {
    const year = new Date().getFullYear();
    return `${year}-03-31`;
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) openClose();
      }}
    >
      <SheetContent className="w-[420px] sm:w-[520px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-center text-xl font-bold">
            Reschedule Workshop
          </SheetTitle>
          <SheetDescription className="text-center text-sm">
            View and update workshop schedule
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex justify-center py-6">
            <Loader className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        )}

        {!loading && selectedWorkshop && rescheduleData && (
          <div className="p-4 space-y-5">
            {/* BASIC INFO */}
            <div className="border rounded-lg p-4 bg-white shadow">
              <InfoRow
                label="Workshop Name"
                value={selectedWorkshop.workshop_name}
              />
              <InfoRow
                label="Status"
                value={selectedWorkshop.work_shop_status}
              />
            </div>

            {/* RESCHEDULE FORM */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <h3 className="font-semibold text-sm text-gray-700">
                Reschedule Details
              </h3>

              <InputRow
                label="Date"
                type="date"
                value={rescheduleData.date}
                disabled={!isEditable}
                min={getTodayDate()}
                max={getLastWorkingDate()}
                onChange={(e) => handleChange("date", e.target.value)}
              />

              <InputRow
                label="From Time"
                type="time"
                value={rescheduleData.from_time}
                disabled={!isEditable}
                onChange={(e) => handleChange("from_time", e.target.value)}
              />

              <InputRow
                label="To Time"
                type="time"
                value={rescheduleData.to_time}
                disabled={!isEditable}
                onChange={(e) => handleChange("to_time", e.target.value)}
              />

              {/* <div>
                <label className="text-sm font-medium">
                  District <span className="text-red-500">*</span>
                </label>

                <select
                  value={rescheduleData.district}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  disabled={!isEditable}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select District</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>

                {loadingdist && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Fetching data...
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  Block Panchayat <span className="text-red-500">*</span>
                </label>

                <select
                  value={rescheduleData.block_panchayat}
                  onChange={(e) => handleGramPanchayatChange(e.target.value)}
                  disabled={!blockPanchayats.length || !isEditable}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select Block Panchayat</option>

                  {blockPanchayats.map((bp) => (
                    <option
                      key={bp.block_panchayat_name}
                      value={bp.block_panchayat_name}
                    >
                      {bp.block_panchayat_name}
                    </option>
                  ))}
                </select>

                {loadingbp && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Fetching data...
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">
                  Gram Panchayat <span className="text-red-500">*</span>
                </label>

                <select
                  value={rescheduleData.gram_panchayat}
                  disabled={!gramPanchayats.length || !isEditable}
                  onChange={(e) => {
                    const selectedGP = gramPanchayats.find(
                      (gp) => gp.gram_panchayat_name === e.target.value,
                    );

                    setRescheduleData((prev) =>
                      prev
                        ? {
                            ...prev,
                            gram_panchayat:
                              selectedGP?.gram_panchayat_name || "",
                            gram_panchayat_code:
                              selectedGP?.gram_panchayat_code || "",
                          }
                        : prev,
                    );
                  }}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select Gram Panchayat</option>

                  {gramPanchayats.map((gp) => (
                    <option
                      key={gp.gram_panchayat_name}
                      value={gp.gram_panchayat_name}
                    >
                      {gp.gram_panchayat_name}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>

            {isEditable && (
              <div className="flex justify-end">
                <Button
                  onClick={handleRescheduleSubmit}
                  className="hover:bg-blue-700"
                >
                  Reschedule
                </Button>
              </div>
            )}
          </div>
        )}

        {!loading && !selectedWorkshop && (
          <p className="text-center text-sm text-gray-500 py-6">
            No workshop data found
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ---------- REUSABLE COMPONENTS ---------- */

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between text-sm text-gray-700">
    <span className="font-medium">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const InputRow = ({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  min,
  max,
}: {
  label: string;
  value: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  type?: string;
  min?: string;
  max?: string;
}) => (
  <div className="flex flex-col gap-1 text-sm">
    <label className="font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      min={min}
      max={max}
      className={`border rounded-md px-3 py-1.5 ${
        disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
      }`}
    />
  </div>
);

export default RescheduleSheet;
