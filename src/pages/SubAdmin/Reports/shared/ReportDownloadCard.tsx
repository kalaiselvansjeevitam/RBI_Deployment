/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../../../../app/components/ui/button";

type ApiRes = {
  result?: any;
  status?: any;
  message?: any;
  data?: any;
  // sometimes APIs return different keys
  url?: any;
  link?: any;
};

type Props = {
  title: string;
  description?: string;
  filtersSlot?: React.ReactNode;
  onGenerate: () => Promise<ApiRes>;
};

function extractUrl(res: ApiRes): string {
  // Most common: data is a string
  if (typeof res?.data === "string" && res.data.trim()) return res.data.trim();

  // Sometimes: data is an object with url/link
  if (res?.data && typeof res.data === "object") {
    const d = res.data as any;
    if (typeof d.url === "string" && d.url.trim()) return d.url.trim();
    if (typeof d.link === "string" && d.link.trim()) return d.link.trim();
    if (typeof d.data === "string" && d.data.trim()) return d.data.trim();
  }

  // Sometimes: url/link at top-level
  if (typeof res?.url === "string" && res.url.trim()) return res.url.trim();
  if (typeof res?.link === "string" && res.link.trim()) return res.link.trim();

  return "";
}

function isSuccess(res: ApiRes): boolean {
  const v = String(res?.result ?? res?.status ?? "")
    .trim()
    .toLowerCase();
  return v === "success";
}

function isNoData(res: ApiRes): boolean {
  // if backend returns an empty list/object, interpret as no data
  if (Array.isArray(res?.data) && res.data.length === 0) return true;

  const msg = String(res?.message ?? "")
    .trim()
    .toLowerCase();

  if (!msg) return false;

  return (
    msg.includes("no data") ||
    msg.includes("data not found") ||
    msg.includes("no records") ||
    msg.includes("record not found") ||
    msg.includes("not found") ||
    msg.includes("empty")
  );
}

export default function SubReportDownloadCard({
  title,
  description,
  filtersSlot,
  onGenerate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const handleGenerate = async () => {
    try {
      setDownloadUrl("");
      setLoading(true);

      const res = await onGenerate();
      const url = extractUrl(res);

      if (isSuccess(res)) {
        // Success but no URL: likely empty dataset for selected filters
        if (!url) {
          if (isNoData(res)) {
            toast.info("No data available for the selected filters.");
          } else {
            toast.error("Report generated but no download link was provided");
          }
          return;
        }

        setDownloadUrl(url);
        toast.success("Report generated successfully");
        return;
      }

      // Non-success (often still 200 OK)
      const msg = String(res?.message ?? "").trim();
      toast.error(msg || "Failed to generate report");
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
    toast.success("Report downloaded");
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      {filtersSlot && <div className="mt-4">{filtersSlot}</div>}

      <div className="mt-5 flex items-center gap-3">
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Generating
            </span>
          ) : (
            "Generate Report"
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!downloadUrl}
        >
          Download Excel
        </Button>
      </div>

      {downloadUrl && (
        <div className="mt-4 text-sm">
          <div className="text-gray-600">Download link:</div>
          <a
            className="text-blue-600 break-all underline"
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
          >
            {downloadUrl}
          </a>
        </div>
      )}
    </div>
  );
}
