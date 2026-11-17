
import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ActivityChartPoint = {
  time: string;
  migrationCompleted: number;
  decodedCompleted: number;
};

interface MigrationActivityChartProps {
  data: ActivityChartPoint[];
  isLoading?: boolean;
}

export function MigrationActivityChart({
  data,
  isLoading = false,
}: MigrationActivityChartProps) {
  const gradientId = useId().replace(/:/g, "");

  console.log("MigrationActivityChart data:", data);

  return (
    <div className="w-full rounded-xl border border-slate-700 bg-[#122033] p-3 text-white">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          Migration & Decoded Completed
        </h3>
      </div>

      <div className="relative h-[200px] w-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#122033]/70">
            <span className="animate-pulse text-sm text-slate-300">
              Loading chart...
            </span>
          </div>
        )}

        {!isLoading && data?.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No activity data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 12,
                right: 15,
                left: -10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id={`${gradientId}-migration`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#00a6ff"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#00a6ff"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id={`${gradientId}-decoded`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#00e58b"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="#00e58b"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#334155"
                strokeOpacity={0.4}
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#cbd5e1", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#18283d",
                  border: "1px solid #475569",
                  borderRadius: 8,
                  color: "#fff",
                }}
                formatter={(value, name) => [
                  Number(value).toLocaleString(),
                  String(name),
                ]}
              />

              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 11 }}
              />

              <Area
                type="monotone"
                dataKey="migrationCompleted"
                name="Migration Completed"
                stroke="#00a6ff"
                strokeWidth={2.5}
                fill={`url(#${gradientId}-migration)`}
                dot={{
                  r: 3,
                  fill: "#00a6ff",
                  strokeWidth: 0,
                }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={800}
              />

              <Area
                type="monotone"
                dataKey="decodedCompleted"
                name="Decoded Completed"
                stroke="#00e58b"
                strokeWidth={2.5}
                fill={`url(#${gradientId}-decoded)`}
                dot={{
                  r: 3,
                  fill: "#00e58b",
                  strokeWidth: 0,
                }}
                activeDot={{ r: 5 }}
                isAnimationActive
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
