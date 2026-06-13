import "./PortfolioReadiness.css";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { useEffect, useState } from "react";

import { getPortfolioReadinessAnalysis } from "../../services/githubService";

const PortfolioReadiness = ({ username ,onLoaded,refreshKey}) => {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      fetchPortfolioReadiness();
    }
  }, [username,refreshKey]);

  const fetchPortfolioReadiness = async () => {
    try {
      setLoading(true);
      console.log("🔄 Refetching PortfolioReadiness");

      const response = await getPortfolioReadinessAnalysis(username);

      setData(response);
      console.log("✅ PortfolioReadiness Loaded");
      onLoaded?.();
    } catch (error) {
      console.error("Portfolio Readiness Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="pr-card">
        <h3 className="pr-title">Portfolio Readiness</h3>

        <div
          style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  const score = data.score;

  const checks = data.checks;

  const chartData = [
    {
      name: "completed",
      value: score,
    },
    {
      name: "remaining",
      value: 100 - score,
    },
  ];

  const label =
    score >= 90
      ? "Excellent"
      : score >= 70
        ? "Good"
        : score >= 50
          ? "Average"
          : "Poor";

  return (
    <div className="pr-card">
      <h3 className="pr-title">Portfolio Readiness</h3>

      <div className="pr-content">
        <div className="pr-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={38}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill="#22c55e" />

                <Cell fill="rgba(255,255,255,0.08)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pr-center-text">
            <div className="pr-score">{score}%</div>

            <div className="pr-label">{label}</div>
          </div>
        </div>

        <div className="pr-checks">
          {checks.map((item) => (
            <div key={item.name} className="pr-row">
              <div className="pr-left">
                <span
                  className={item.status ? "pr-dot success" : "pr-dot failed"}
                ></span>

                <span className="pr-text">{item.name}</span>
              </div>

              <span
                className={
                  item.status ? "pr-status success" : "pr-status failed"
                }
              >
                {item.status ? "✓" : "✕"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioReadiness;
