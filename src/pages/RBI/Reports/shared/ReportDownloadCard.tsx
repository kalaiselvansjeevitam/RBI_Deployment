/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../../app/components/ui/button";

type ApiRes = {
  result?: any;
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
  const r = String(res?.result ?? "")
    .trim()
    .toLowerCase();
  return r === "success";
}

export default function ReportDownloadCard({
  title,
  description,
  filtersSlot,
  onGenerate,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");
  const [serverMsg, setServerMsg] = useState("");
  const [raw, setRaw] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      setError("");
      setServerMsg("");
      setDownloadUrl("");
      setRaw(null);
      setLoading(true);

      const res = await onGenerate();
      setRaw(res);

      const msg = String(res?.message ?? "").trim();
      if (msg) setServerMsg(msg);

      const url = extractUrl(res);

      // If backend says success but doesn't give a URL, show it clearly
      if (isSuccess(res)) {
        if (!url) {
          setError(
            msg ||
              "Report generated but server did not return a download link.",
          );
          return;
        }
        setDownloadUrl(url);
        return;
      }

      // Non-success (often still 200 OK)
      setError(msg || "Failed to generate report.");
    } catch (e: any) {
      setError(e?.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>

      {filtersSlot && <div className="mt-4">{filtersSlot}</div>}

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleGenerate} disabled={loading}>
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

      {serverMsg && (
        <div className="mt-4 text-sm text-gray-600">Server: {serverMsg}</div>
      )}

      {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      {/* Debug (safe): shows what server returned so you can spot wrong keys fast */}
      {raw && (
        <pre className="mt-4 text-xs bg-gray-100 p-3 rounded-lg overflow-auto">
          {JSON.stringify(raw, null, 2)}
        </pre>
      )}
    </div>
  );
}
