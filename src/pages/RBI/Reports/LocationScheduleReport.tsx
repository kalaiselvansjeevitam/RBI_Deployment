import { useEffect, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Input } from "../../../app/components/ui/input";
import { useDownloadLocationManagerWiseWorkshopReport } from "../../../app/core/api/RBIReports";
import ReportDownloadCard from "./shared/ReportDownloadCard";
import { useGetDistrictParams } from "../../../app/core/api/Admin";

export default function LocationScheduleReport() {
  const { mutateAsync } = useDownloadLocationManagerWiseWorkshopReport();

  const [district, setDistrict] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const canGenerate = Boolean(district);
  const { mutateAsync: getDistricts } = useGetDistrictParams();
        const [districtList, setDistrictList] = useState<string[]>([]);
      useEffect(() => {
        (async () => {
          try {
            const districtRes = await getDistricts();
            const districts =
              districtRes?.list ??
              [];
    
            const names: string[] = Array.isArray(districts)
              ? districts
                  .map((d: any) => d?.district ?? d?.name ?? d?.district_name ?? d)
                  .map((x: any) => String(x))
                  .filter(Boolean)
              : [];
    
            setDistrictList(names);
          } catch (e) {
            console.error("Failed to load districts:", e);
            setDistrictList([]);
          }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

  return (
    <Layout headerTitle="Location-wise Workshop Schedule Report">
      <div className="p-6">
        <ReportDownloadCard
          title="Download Location(Center)-Wise Workshop [Scheduled/Pending] Report"
          description="District is required. Date filters are optional."
          filtersSlot={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
              <label className="text-sm text-gray-600">
                District (required)
              </label>
              {districtList.length > 0 ? (
                <select
                  className="border rounded-md h-10 px-3 w-full"
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (e.target.value === "") {
                      // Add any reset logic here if needed
                      // For example, clearing the download link state in ReportDownloadCard
                    }
                  }}
                >
                  <option value="">All districts</option>
                  {districtList.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g., Springfield"
                />
              )}
            </div>

              <div>
                <label className="text-sm text-gray-600">
                  Start Date (optional)
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  End Date (optional)
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {!canGenerate && (
                <div className="md:col-span-3 text-sm text-amber-600">
                  Please enter district to generate this report.
                </div>
              )}
            </div>
          }
          onGenerate={async () => {
            if (!canGenerate) {
              return {
                result: "Error",
                message: "District is required",
                data: "",
              };
            }
            return mutateAsync({
              district,
              start_date: startDate || undefined,
              end_date: endDate || undefined,
            });
          }}
        />
      </div>
    </Layout>
  );
}
