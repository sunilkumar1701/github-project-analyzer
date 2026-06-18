import "./RepositoryQuality.css";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { useEffect, useState } from "react";
import { useDashboardContext } from "../../context/DashboardContext";
import { getRepositoryQualityAnalysis } from "../../services/githubService";

const RepositoryQuality = ({ username, onLoaded, refreshKey }) => {
  const [qualityData, setQualityData] = useState(null);
  const { updateDashboardData } = useDashboardContext();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepositoryQuality();
  }, [username, refreshKey]);

  const fetchRepositoryQuality = async () => {
    try {
      setLoading(true);
      console.log("🔄 Refetching RepositoryQuality");

      const data = await getRepositoryQualityAnalysis(username);

      const metrics = [
        {
          name: "README",
          value: data.metrics.readme,
          count: data.counts.readme,
          description:
            "Checks whether the repository contains a README file with basic project information.",
        },

        {
          name: "Description",
          value: data.metrics.description,
          count: data.counts.description,
          description:
            "Checks whether the repository has a meaningful description in the GitHub About section.",
        },

        {
          name: "Documentation",
          value: data.metrics.documentation,
          count: data.counts.documentation,
          description:
            "Checks whether the README contains more than 100 words and provides meaningful project documentation.",
        },

        {
          name: "Topics",
          value: data.metrics.topics,
          count: data.counts.topics,
          description:
            "Checks whether the repository uses GitHub Topics for categorization and discoverability.",
        },
      ];

      setQualityData({
        score: data.score,

        totalRepos: data.total_repos,

        label:
          data.score >= 90
            ? "Excellent"
            : data.score >= 70
              ? "Good"
              : data.score >= 50
                ? "Average"
                : "Poor",

        metrics,
      });
      console.log("✅ RepositoryQuality Loaded");
      updateDashboardData("repositoryQuality", {
  score: data.score,

  totalRepos: data.total_repos,

  label:
    data.score >= 90
      ? "Excellent"
      : data.score >= 70
      ? "Good"
      : data.score >= 50
      ? "Average"
      : "Poor",

  metrics: [
    {
      name: "README",
      score: data.metrics.readme,
      count: data.counts.readme,
    },
    {
      name: "Description",
      score: data.metrics.description,
      count: data.counts.description,
    },
    {
      name: "Documentation",
      score: data.metrics.documentation,
      count: data.counts.documentation,
    },
    {
      name: "Topics",
      score: data.metrics.topics,
      count: data.counts.topics,
    },
  ],
});
      onLoaded?.();
    } catch (error) {
      console.error("Repository Quality Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !qualityData) {
    return (
      <div className="rq-card">
        <h3 className="rq-title">Repository Quality</h3>

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
  const scoreColor =
    qualityData.score >= 90
      ? "#22c55e" // green
      : qualityData.score >= 70
        ? "#3b82f6" // blue
        : qualityData.score >= 50
          ? "#f59e0b" // orange
          : "#ef4444"; // red
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
      <h3 className="rq-title">Repository Quality</h3>

      <div className="rq-content">
        <div className="rq-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
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
                <Cell fill={scoreColor} />

                <Cell fill="rgba(255,255,255,0.08)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="rq-center-text">
            <div
              className="rq-score"
              style={{
                color: scoreColor,
              }}
            >
              {qualityData.score}%
            </div>

            <div
              className="rq-label"
              style={{
                color: scoreColor,
              }}
            >
              {qualityData.label}
            </div>
          </div>
        </div>

        <div className="rq-metrics">
          {qualityData.metrics.map((item) => (
            <div key={item.name} className="rq-row">
              <div className="rq-metric-wrapper">
                <span className="rq-metric-name">{item.name}</span>

                <div className="rq-tooltip-container">
                  ⓘ
                  <div className="rq-tooltip">
                    <strong>{item.name}</strong>
                    <br />
                    <br />
                    {item.description}
                    <br />
                    <br />
                    Found in{" "}
                    <strong>
                      {item.count}/{qualityData.totalRepos}
                    </strong>{" "}
                    repositories.
                  </div>
                </div>
              </div>

              <span className="rq-metric-value">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepositoryQuality;
