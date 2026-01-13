import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DonutChartProps = {
  data: {
    total: string;
    gender: string;
  }[];
  height?: number;
};

const COLORS = ["#3b82f6", "#ec4899", "#22c55e", "#f59e0b"];

const DonutChartSubAdminComponent = ({
  data,
  height = 240,
}: DonutChartProps) => {
  // 🔴 CRITICAL FIX: convert total to number
  const chartData = data.map((item) => ({
    gender: item.gender,
    total: Number(item.total),
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total" // ✅ number
            nameKey="gender" // ✅ label
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChartSubAdminComponent;
