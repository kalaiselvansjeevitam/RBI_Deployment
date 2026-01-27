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
import {
  useGetupdateChecklist,
  useGetViewCitizenByCard,
  useGetWorkshopDetails,
} from "../../../../app/core/api/Admin";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  GetCitizenbyCardRes,
  WorkshopDetails,
} from "../../../../app/lib/types";
import { ROUTE_URL } from "../../../../app/core/constants/coreUrl";

/* ---------- PROPS ---------- */

type StudentSheetProps = {
  open: boolean;
  workshopId: string | null;
  openClose: (updated?: boolean) => void;
};

/* ---------- CONSTANTS ---------- */

const CHECKLIST_ITEMS = [
  "Banner",
  "Internet/Wifi/Hotspot",
  "Refreshment",
  "TV/Projector",
  "Chairs",
];

/* ---------- COMPONENT ---------- */

const SchoolSheet = ({ open, workshopId, openClose }: StudentSheetProps) => {
  const navigate = useNavigate();

  const [data, setData] = useState<WorkshopDetails[]>([]);
  const [loaderside, setLoaderside] = useState(false);

  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [savedChecklist, setSavedChecklist] = useState<string[]>([]);
  const [hasUpdated, setHasUpdated] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: getWorkshopById } = useGetWorkshopDetails();
  const { mutateAsync: getupdateChecklist } = useGetupdateChecklist();
  const { mutateAsync: getViewCitizenByCard } = useGetViewCitizenByCard();

  const workshop = data?.[0];

  /* ---------- FETCH WORKSHOP ---------- */

  const fetchWorkshop = async () => {
    try {
      setLoaderside(true);

      const res = await getWorkshopById({
        work_shop_id: workshopId ?? "",
      });

      if (res?.list) {
        // ✅ IMPORTANT FIX
        setData([res.list]);
      } else {
        setData([]);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch workshop details", "error");
      setData([]);
    } finally {
      setLoaderside(false);
    }
  };

  useEffect(() => {
    if (open && workshopId) {
      fetchWorkshop();
    }
  }, [open, workshopId]);

  /* ---------- EFFECTS ---------- */

  useEffect(() => {
    if (workshop?.checklist) {
      const list = workshop.checklist.split(",");
      setCheckedItems(list);
      setSavedChecklist(list);
    }
  }, [workshop?.checklist]);

  useEffect(() => {
    if (hasUpdated && workshopId) {
      fetchWorkshop();
      setHasUpdated(false);
    }
  }, [hasUpdated, workshopId]);

  /* ---------- HELPERS ---------- */

  const toggleChecklist = (item: string) => {
    setCheckedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const isChecklistChanged =
    checkedItems.sort().join(",") !== savedChecklist.sort().join(",");

  const isChecklistComplete = savedChecklist.length === CHECKLIST_ITEMS.length;

  /* ---------- SUBMIT CHECKLIST ---------- */

  const handleSubmitChecklist = async () => {
    try {
      setSubmitting(true);

      const payload = {
        work_shop_id: workshop.id,
        checklist: checkedItems.join(","),
      };

      const result = await getupdateChecklist(payload);

      await Swal.fire({
        title: "Success",
        text: result.message,
        icon: "success",
        timer: 1500,
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      setSavedChecklist(checkedItems);
      setHasUpdated(true);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.message || "Checklist update failed",
        icon: "error",
        timer: 1500,
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- SUBMIT STATUS ---------- */

  /* ---------- PDF ---------- */
  const downloadWorkshopWithCitizensPDF = async (workshop: WorkshopDetails) => {
    try {
      const citizenRes = await getViewCitizenByCard({
        work_shop_id: workshop.id,
        offset: 0,
        getBy: "all",
      });

      generateWorkshopPDF(workshop, citizenRes.list);
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.citizenRes.data.message || "Failed to Fetch Citizen Data",
        icon: "error",
        timer: 1000,
        allowOutsideClick: false,
        showConfirmButton: false,
      });
    }
  };
  const generateWorkshopPDF = (
    workshop: WorkshopDetails,
    citizens: GetCitizenbyCardRes["list"],
  ) => {
    const doc = new jsPDF();

    /* ---------------- PAGE 1 : WORKSHOP ---------------- */

    doc.setFontSize(16);
    doc.text("Workshop Details", 14, 15);

    autoTable(doc, {
      head: [["Field", "Value"]],
      body: [
        ["Workshop Name", workshop.workshop_name],
        ["Date", workshop.date],
        ["Time", `${workshop.from_time} - ${workshop.to_time}`],
        ["VLE Name", workshop.vle_name],
        ["Status", workshop.work_shop_status],
        ["Total Citizens", workshop.total_citizens],
        ["Checklist", workshop.checklist],
        ["Videos", workshop.videos_count],
        ["Images", workshop.images_count],
        ["Videos Count", workshop.videos_count],
        ["Image Count", workshop.images_count],
        ["VLE Mobile Number", workshop.vle_mobile_number],
      ],
      startY: 25,
    });

    /* ---------------- PAGE 2 : CITIZENS ---------------- */

    doc.addPage();
    doc.setFontSize(16);
    doc.text("Citizen Details", 14, 15);

    let y = 25;

    citizens.forEach((citizen, index) => {
      doc.setFontSize(12);
      doc.text(`Citizen ${index + 1}`, 14, y);
      y += 6;

      doc.setFontSize(10);
      const citizenText = `
Name: ${citizen.name}
Mobile Number: ${citizen.mobile_number}
Age: ${citizen.age}
Gender: ${citizen.gender}
Occupation: ${citizen.occupation_name}
Gram Panchayat: ${citizen.gram_panchayat}
Block Panchayat: ${citizen.block_panchayat}
District: ${citizen.district}
Registered On: ${citizen.created_at}
`;

      const wrappedText = doc.splitTextToSize(citizenText.trim(), 180);
      doc.text(wrappedText, 14, y);
      y += wrappedText.length * 5 + 8;

      // Add new page if content overflows
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`Workshop_${workshop.id}_Citizens.pdf`);
  };
  const handleViewCitizens = (workshopId: string) => {
    navigate(`${ROUTE_URL.viewCitizenByCard}?workshop_id=${workshopId}`);
  };
  const STATUS_STYLES: Record<string, string> = {
    Approved: "bg-green-100 text-green-700",
    Completed: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
    Cancelled: "bg-gray-300 text-gray-700",
    SendingForApproval: "bg-purple-100 text-purple-700",
  };

  /* ---------- UI ---------- */
  const isEditable =
    workshop?.work_shop_status === "Pending" ||
    workshop?.work_shop_status === "Rejected";

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          openClose(hasUpdated);
          setHasUpdated(false);
        }
      }}
    >
      <SheetContent className="w-[400px] sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-bold text-xl text-center">
            Workshop Details
          </SheetTitle>
          <SheetDescription className="text-center text-sm text-gray-500">
            Overview of workshop information
          </SheetDescription>

          {loaderside && (
            <div className="flex justify-center py-4">
              <Loader className="animate-spin w-6 h-6 text-blue-600" />
            </div>
          )}
        </SheetHeader>

        {!loaderside && data && data.length > 0 && (
          <div className="p-4">
            <div className="border rounded-xl shadow-md bg-white p-4 space-y-4">
              {/* STATUS */}
              <InfoRow
                label="Workshop Status"
                value={
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_STYLES[data[0].work_shop_status] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {data[0].work_shop_status}
                  </span>
                }
              />

              <InfoRow
                label="Total Citizens"
                value={
                  <div className="flex items-center gap-3">
                    <span>{data[0].total_citizens}</span>

                    <button
                      onClick={() => handleViewCitizens(data[0].id)}
                      className="px-3 py-1  text-xs px-3 py-0.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      View
                    </button>
                  </div>
                }
              />

              {!loaderside && workshop && (
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span className="font-medium">Testimony Media</span>

                  <div className="flex items-center gap-4">
                    <span>Videos: {data[0].videos_count}</span>
                    <span>Images: {data[0].images_count}</span>

                    <button
                      onClick={() =>
                        navigate(
                          `${ROUTE_URL.viewTestimony}?workshop_id=${workshopId}`,
                        )
                      }
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      View
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 border rounded-xl bg-gray-50 p-4 shadow-sm">
                <p className="font-semibold text-sm mb-3 text-gray-700">
                  Checklist
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {CHECKLIST_ITEMS.map((item) => (
                    <label
                      key={item}
                      className="flex items-center  text-sm cursor-pointer text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(item)}
                        disabled={!isEditable || isChecklistComplete}
                        onChange={() => toggleChecklist(item)}
                        className={`accent-blue-600 ${
                          isChecklistComplete
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      />

                      {item}
                    </label>
                  ))}
                </div>

                {isEditable && isChecklistChanged && !isChecklistComplete && (
                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={handleSubmitChecklist}
                      disabled={submitting}
                      className={`px-5 py-1.5 rounded-md text-sm font-semibold text-white transition ${
                        submitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {submitting ? "Saving..." : "Submit Checklist"}
                    </button>
                  </div>
                )}
                {isChecklistComplete && (
                  <p className="text-xs text-green-600 font-semibold mb-2 pt-2">
                    ✔ Checklist completed
                  </p>
                )}
                {!isEditable && (
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Checklist cannot be edited once the workshop is approved or
                    completed.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {workshop &&
          (workshop.work_shop_status === "Approved" ||
            workshop.work_shop_status === "Rejected") && (
            <div className="flex justify-end px-4 pt-2">
              <button
                onClick={() =>
                  workshop && downloadWorkshopWithCitizensPDF(workshop)
                }
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Download PDF
              </button>
            </div>
          )}

        {!loaderside && (!data || data.length === 0) && (
          <div className="p-4 text-center text-sm text-gray-500">
            No records found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ---------- INFO ROW ---------- */

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center text-sm text-gray-700">
    <span className="font-medium">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default SchoolSheet;
