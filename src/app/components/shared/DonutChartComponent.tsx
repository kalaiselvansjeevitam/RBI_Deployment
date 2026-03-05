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
    name: string;
    value: number;
  }[];
  height?: number;
  colorMap?: Record<string, string>;
};

const DEFAULT_COLORS = ["#3b82f6", "#ec4899", "#22c55e", "#f59e0b"];

const DonutChartComponent = ({
  data,
  height = 220,
  colorMap = {},
}: DonutChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={
                colorMap[entry.name] ??
                DEFAULT_COLORS[index % DEFAULT_COLORS.length]
              }
            />
          ))}
        </Pie>

        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChartComponent;
