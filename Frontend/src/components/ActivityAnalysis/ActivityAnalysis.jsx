import "./ActivityAnalysis.css";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const activityData = [
  { month: "Jun", commits: 20, pushes: 15, pulls: 8 },
  { month: "Jul", commits: 32, pushes: 22, pulls: 10 },
  { month: "Aug", commits: 45, pushes: 30, pulls: 12 },
  { month: "Sep", commits: 25, pushes: 18, pulls: 9 },
  { month: "Oct", commits: 60, pushes: 42, pulls: 15 },
  { month: "Nov", commits: 52, pushes: 38, pulls: 14 },
  { month: "Dec", commits: 40, pushes: 25, pulls: 11 },
  { month: "Jan", commits: 28, pushes: 18, pulls: 8 },
  { month: "Feb", commits: 60, pushes: 45, pulls: 16 },
  { month: "Mar", commits: 45, pushes: 32, pulls: 12 },
  { month: "Apr", commits: 52, pushes: 36, pulls: 14 },
  { month: "May", commits: 60, pushes: 48, pulls: 18 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="activity-tooltip">
      <div className="tooltip-title">{label}</div>

      {payload.map((item) => (
        <div key={item.dataKey} className="tooltip-row">
          <span
            style={{
              color: item.color,
            }}
          >
            {item.dataKey.charAt(0).toUpperCase() + item.dataKey.slice(1)}
          </span>

          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
};

const ActivityAnalysis = () => {
  return (
    <div className="activity-card">
      <div className="activity-title">Activity (Last 12 Months)</div>

      <div className="activity-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activityData}
            margin={{
              top: 5,
              right: 5,
              left: -40,
              bottom: -10,
            }}
          >
            <defs>
              <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="pushGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="pullGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />

            <XAxis
              dataKey="month"
              tick={{
                fill: "#94a3b8",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 60]}
              ticks={[0, 20, 40, 60]}
              tick={{
                fill: "#94a3b8",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="commits"
              stroke="#a855f7"
              strokeWidth={3}
              fill="url(#commitGradient)"
              dot={{
                r: 4,
                fill: "#a855f7",
                stroke: "#c084fc",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: "#a855f7",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />

            <Area
              type="monotone"
              dataKey="pushes"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#pushGradient)"
              dot={{
                r: 3,
                fill: "#3b82f6",
              }}
            />

            <Area
              type="monotone"
              dataKey="pulls"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#pullGradient)"
              dot={{
                r: 3,
                fill: "#10b981",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ActivityAnalysis;
