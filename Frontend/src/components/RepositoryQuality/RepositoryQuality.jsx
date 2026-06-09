import "./RepositoryQuality.css";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const metrics = [
  {
    name: "README",
    value: 5,
  },
  {
    name: "Description",
    value: 25,
  },
  {
    name: "Documentation",
    value: 0,
  },
  {
    name: "Topics",
    value: 20,
  },
];

const score = metrics.reduce(
  (sum, item) => sum + item.value,
  0
);

const qualityData = {
  score,

  label:
    score >= 90
      ? "Excellent"
      : score >= 70
      ? "Good"
      : score >= 50
      ? "Average"
      : "Poor",

  metrics,
};

const RepositoryQuality = () => {
  const chartData = [
    {
      name: "completed",
      value: qualityData.score,
    },
    {
      name: "remaining",
      value: 100 - qualityData.score,
    },
  ];

  return (
    <div className="rq-card">
      <h3 className="rq-title">
        Repository Quality
      </h3>

      <div className="rq-content">
        <div className="rq-chart-wrapper">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
  data={chartData}
  dataKey="value"
  cx="50%"
  cy="50%"
  innerRadius={24}
  outerRadius={34}
  startAngle={90}
  endAngle={-270}
  stroke="none"
>
                <Cell fill="#22c55e" />
                <Cell fill="rgba(255,255,255,0.08)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="rq-center-text">
            <div className="rq-score">
              {qualityData.score}%
            </div>

            <div className="rq-label">
              {qualityData.label}
            </div>
          </div>
        </div>

        <div className="rq-metrics">
          {qualityData.metrics.map(
            (item) => (
              <div
                key={item.name}
                className="rq-row"
              >
                <span className="rq-metric-name">
                  {item.name}
                </span>

                <span className="rq-metric-value">
                  {item.value}%
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RepositoryQuality;