import "./TechnologyStack.css";
import { useState, useEffect } from "react";
import { getTechnologyStackAnalysis } from "../../services/githubService";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#FACC15", "#3B82F6", "#FB923C", "#A855F7", "#22C55E"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div
        style={{
          background: "#0F172A",
          border: "1px solid rgba(139,92,246,0.35)",
          borderRadius: "10px",
          padding: "10px 12px",
          color: "#FFFFFF",
          boxShadow: "0 0 20px rgba(139,92,246,0.25)",
          minWidth: "120px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: data.color,
            }}
          />

          <span
            style={{
              fontWeight: 600,
            }}
          >
            {data.name}
          </span>
        </div>

        <div
          style={{
            color: "#CBD5E1",
            fontSize: "12px",
          }}
        >
          Usage: {data.value}%
        </div>
      </div>
    );
  }

  return null;
};

const TechnologyStack = ({ username,onLoaded,refreshKey }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const [mounted, setMounted] = useState(false);

  const [technologyData, setTechnologyData] = useState([]);

  const [totalLanguages, setTotalLanguages] = useState(0);

  useEffect(() => {
    const fetchTechnologyStack = async () => {
      try {
        console.log("🔄 Refetching TechnologyStack");
        const data = await getTechnologyStackAnalysis(username);

        const formattedData = data.top_languages.map((item, index) => ({
          ...item,
          color: COLORS[index % COLORS.length],
        }));

        setTechnologyData(formattedData);

        setTotalLanguages(data.total_languages);
        console.log("✅ TechnologyStack Loaded");
        onLoaded?.();
      } catch (error) {
        console.error("Technology Stack Error:", error);
      }
    };

    setMounted(true);

    fetchTechnologyStack();
  }, [username,refreshKey]);

  const isCompact = window.innerWidth < 1300;

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="technology-card">
      <h3 className="technology-title" title="Top Languages">
        Top Languages
      </h3>

      <div className="technology-wrapper">
        <div className="chart-section">
          {technologyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={<CustomTooltip />}
                  position={{
                    x: 0,
                    y: -45,
                  }}
                  wrapperStyle={{
                    zIndex: 9999,
                  }}
                />

                <Pie
                  data={technologyData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={isCompact ? 18 : 36}
                  outerRadius={isCompact ? 30 : 58}
                  paddingAngle={2}
                  activeIndex={activeIndex}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {technologyData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="#fff"
                      strokeWidth={activeIndex === index ? 2 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="tech-loading">Loading...</div>
          )}

          <div className="chart-center">{totalLanguages}</div>
        </div>

        <div className="language-list">
          {technologyData.map((language) => (
            <div key={language.name} className="language-item">
              <div className="language-left">
                <span
                  className="language-dot"
                  style={{
                    background: language.color,
                  }}
                />

                <span>{language.name}</span>
              </div>

              <span className="language-value">{language.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechnologyStack;
