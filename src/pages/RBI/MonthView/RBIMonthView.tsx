/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loader } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../../../app/components/Layout/Layout";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import {
  useMonthAndDistrict,
  useMonthViewCardValues,
  type MonthDistrictRow,
} from "../../../app/core/api/RBIMonthView";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const PAGE_SIZE = 5;

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 bg-gradient-to-br from-white to-gray-50 shadow-xl min-w-[220px]">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-semibold text-gray-800 mt-2">{value}</div>
    </div>
  );
}

function isSuccess(res: any) {
  return (
    String(res?.result ?? "")
      .trim()
      .toLowerCase() === "success"
  );
}

function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function RBIMonthView() {
  const { mutateAsync: fetchCards } = useMonthViewCardValues();
  const { mutateAsync: fetchTable } = useMonthAndDistrict();

  const [month, setMonth] = useState<string>("");
  const [district, setDistrict] = useState<string>("");

  // When loading next page, we keep old rows visible
  const [loading, setLoading] = useState(false);

  const [cards, setCards] = useState({
    total_planned_sessions: 0,
    total_completed: 0,
    pending_approval: 0,
    rejected: 0,
  });

  const [rows, setRows] = useState<MonthDistrictRow[]>([]);
  const [offset, setOffset] = useState(0);
  const [totalRows, setTotalRows] = useState(0);

  const canFetch = Boolean(month);

  const load = async (opts?: {
    resetOffset?: boolean;
    offsetOverride?: number;
  }) => {
    if (!canFetch) return;

    const nextOffset = opts?.offsetOverride ?? (opts?.resetOffset ? 0 : offset);

    const districtValue = district.trim() ? district.trim() : undefined;

    try {
      setLoading(true);

      const [cardRes, tableRes] = await Promise.all([
        fetchCards({ month }),
        fetchTable({
          month,
          offset: nextOffset,
          district: districtValue,
        }),
      ]);

      // -------- Cards (API returns { list: [ { total, pending_count, ... } ] })
      if (isSuccess(cardRes)) {
        const row = cardRes?.list?.[0] ?? {};
        setCards({
          total_planned_sessions: safeNum(row.total ?? 0),
          total_completed: safeNum(row.completed_count ?? 0),
          pending_approval: safeNum(row.pending_count ?? 0),
          rejected: safeNum(row.rejected_count ?? 0),
        });
      } else {
        console.error("Card API error:", cardRes?.message, cardRes);
      }

      // -------- Table (API returns { total: "6", list: [...] })
      if (isSuccess(tableRes)) {
        const list = Array.isArray(tableRes?.list) ? tableRes.list : [];
        setTotalRows(safeNum(tableRes?.total ?? list.length));

        setRows(
          list.map((r: any) => ({
            district: String(r.district ?? ""),
            // backend calls this "total" (we show it as Scheduled)
            scheduled: safeNum(r.total ?? 0),
            completed: safeNum(r.completed_count ?? 0),
            approved: safeNum(r.approved_count ?? 0),
            rejected: safeNum(r.rejected_count ?? 0),
          })),
        );

        // Keep offset state in sync with what we fetched
        setOffset(nextOffset);
      } else {
        setRows([]);
        setTotalRows(0);
        console.error("Table API error:", tableRes?.message, tableRes);
      }
    } catch (e) {
      console.error("Month View load failed:", e);
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when month changes
  useEffect(() => {
    if (!month) return;
    load({ resetOffset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const monthLabel = useMemo(
    () => MONTHS.find((m) => m.value === month)?.label || "Month View",
    [month],
  );

  const canPrev = canFetch && !loading && offset > 0;
  const canNext = canFetch && !loading && offset + PAGE_SIZE < totalRows;

  return (
    <Layout headerTitle={`RBI Month View - ${monthLabel}`}>
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-sm text-gray-600">Month (required)</label>
              <select
                className="mt-1 w-full border rounded-md h-10 px-3"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">
                District (optional)
              </label>
              <Input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g., Amravati"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => load({ resetOffset: true })}
                disabled={!canFetch || loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Loading
                  </span>
                ) : (
                  "Apply Filters"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setDistrict("");
                  load({ resetOffset: true });
                }}
                disabled={!canFetch || loading}
              >
                Clear District
              </Button>
            </div>
          </div>

          {!canFetch && (
            <div className="mt-3 text-sm text-amber-600">
              Please select a month to view data.
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap gap-6">
          <StatCard
            title="Total Planned Sessions"
            value={cards.total_planned_sessions}
          />
          <StatCard title="Total Completed" value={cards.total_completed} />
          <StatCard title="Pending Approval" value={cards.pending_approval} />
          <StatCard title="Rejected" value={cards.rejected} />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              District-wise Sessions
            </h3>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  load({ offsetOverride: Math.max(0, offset - PAGE_SIZE) })
                }
                disabled={!canPrev}
              >
                Prev
              </Button>

              <Button
                variant="outline"
                onClick={() => load({ offsetOverride: offset + PAGE_SIZE })}
                disabled={!canNext}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">SR.No</th>
                  <th className="py-2 pr-4">District</th>
                  <th className="py-2 pr-4">Scheduled</th>
                  <th className="py-2 pr-4">Completed</th>
                  <th className="py-2 pr-4">Approved</th>
                  <th className="py-2 pr-4">Rejected</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td className="py-4 text-gray-500" colSpan={6}>
                      {canFetch
                        ? "No data found."
                        : "Select a month to load data."}
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={`${r.district}-${idx}`} className="border-b">
                      <td className="py-2 pr-4">{offset + idx + 1}</td>
                      <td className="py-2 pr-4">{r.district}</td>
                      <td className="py-2 pr-4">{r.scheduled}</td>
                      <td className="py-2 pr-4">{r.completed}</td>
                      <td className="py-2 pr-4">{r.approved}</td>
                      <td className="py-2 pr-4">{r.rejected}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
            <div>Offset: {offset}</div>
            <div>
              Total rows: {totalRows}
              {totalRows > 0 ? (
                <>
                  {" "}
                  • Showing {Math.min(totalRows, offset + 1)}–
                  {Math.min(totalRows, offset + rows.length)}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
