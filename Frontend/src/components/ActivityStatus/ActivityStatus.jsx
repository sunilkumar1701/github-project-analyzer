import "./ActivityStatus.css";

import { Activity } from "lucide-react";

import { useEffect, useState } from "react";

import { getActivityStatus } from "../../services/githubService";

const ActivityStatus = ({ username,onLoaded,refreshKey }) => {
  const [activityData, setActivityData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityStatus();
  }, [username,refreshKey]);

  const fetchActivityStatus = async () => {
    try {
      setLoading(true);
      console.log("🔄 Refetching ActivityStatus");

      const data = await getActivityStatus(username);

      setActivityData(data);
      console.log("✅ ActivityStatus Loaded");
      onLoaded?.();
    } catch (error) {
      console.error("Activity Status Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActive = (dateString) => {
    if (!dateString) return "Unknown";

    const now = new Date();

    const lastDate = new Date(dateString);

    const diffMs = now - lastDate;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    }

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }

    return `${diffDays} days ago`;
  };

  const getStatusClass = () => {
    switch (activityData?.status) {
      case "Highly Active":
        return "highly-active";

      case "Moderate":
        return "moderate-active";

      case "Low":
        return "low-active";

      default:
        return "inactive";
    }
  };

  if (loading) {
    return (
      <div className="status-card">
        <h3 className="status-title">Activity Status</h3>

        <div className="status-loading">Loading...</div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="status-card">
        <h3 className="status-title">Activity Status</h3>

        <div className="status-loading">No Data</div>
      </div>
    );
  }

  return (
    <div className="status-card">
      <h3 className="status-title">Activity Status</h3>

      <div className="status-row">
        <div className={`status-icon-wrapper ${getStatusClass()}`}>
          <Activity size={18} className={`status-icon ${getStatusClass()}`} />
        </div>

        <span className={`status-text ${getStatusClass()}`}>
          {activityData.status}
        </span>

        <span className="status-last-active">
          {formatLastActive(activityData.lastActive)}
        </span>
      </div>

      <div className="status-divider"></div>

      <div className="status-streak">
        <span className="status-streak-label">Streak</span>

        <span className="status-fire">🔥</span>

        <span className="status-streak-value">{activityData.streak} days</span>
      </div>
    </div>
  );
};

export default ActivityStatus;
