import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface BarChartComponentProps {
  data: any[];
  dataKey: string;
  categoryKey: string;
  layout?: "horizontal" | "vertical";
  height?: number | string;
  fillColor?: string;
  xAxisProps?: React.ComponentProps<typeof XAxis>;
  yAxisProps?: React.ComponentProps<typeof YAxis>;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

const BarChartComponentWorkshop: React.FC<BarChartComponentProps> = ({
  data,
  dataKey,
  categoryKey,
  layout = "horizontal",
  height = 200,
  fillColor = "#8884d8",
  xAxisProps = {},
  yAxisProps = {},
  margin = { top: 20, right: 20, bottom: 40, left: 20 },
}) => {
  const isVertical = layout === "vertical";
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="w-full flex items-center justify-center" style={{ height }}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout={layout} margin={margin}>
            {isVertical ? (
              <>
                <XAxis type="number" {...xAxisProps} />
                <YAxis
                  dataKey={categoryKey}
                  type="category"
                  width={yAxisProps?.width || 120}
                  {...yAxisProps}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={categoryKey}
                  interval={0}
                  tick={{ fontSize: 15 }}
                  {...xAxisProps}
                />
                <YAxis width={yAxisProps?.width || 75} {...yAxisProps} />
              </>
            )}

            <CartesianGrid strokeDasharray="3 3" />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;

                const { date, id, total, workshop_name } = payload[0].payload;

                return (
                  <div className="bg-white border rounded-md shadow px-3 py-2 text-sm">
                    <p>
                      <strong>Date :</strong> {date}
                    </p>
                    <p>
                      <strong>Workshop ID :</strong> {id}
                    </p>
                    <p>
                      <strong>Total :</strong> {total}
                    </p>
                    <p>
                      <strong>Workshop Name :</strong> {workshop_name}
                    </p>
                  </div>
                );
              }}
            />

            <Bar dataKey={dataKey} fill={fillColor} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-sm">No data found</p>
      )}
    </div>
  );
};

export default BarChartComponentWorkshop;
