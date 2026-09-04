import "./MostForkedRepo.css";

import { useEffect, useState, useCallback } from "react";

import { FaCodeBranch } from "react-icons/fa";

import { useDashboardContext } from "../../context/DashboardContext";
import { getMostForkedRepository } from "../../services/githubService";

const MostForkedRepo = ({ username, onLoaded, refreshKey }) => {
  const { updateDashboardData } = useDashboardContext();

  const [repo, setRepo] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const fetchRepository = useCallback(
    async (isMounted) => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Refetching MostForkedRepo");

        const data = await getMostForkedRepository(username);

        if (!isMounted.current) return;

        setRepo(data ?? null);

        updateDashboardData("mostForkedRepo", data ?? null);

        console.log("✅ MostForkedRepo Loaded");

        onLoaded?.();
      } catch (err) {
        console.error("Most Forked Repo Error:", err);

        if (!isMounted.current) return;

        setError("Failed to load repository.");
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [username, updateDashboardData, onLoaded],
  );

  useEffect(() => {
    if (!username) return;

    const isMounted = {
      current: true,
    };

    fetchRepository(isMounted);

    return () => {
      isMounted.current = false;
    };
  }, [username, refreshKey, fetchRepository]);

  if (loading) {
    return (
      <div className="mfr-card">
        <h3 className="mfr-title">Most Forked Repository</h3>
        <div className="mfr-content" style={{ gap: '12px', display: 'flex', flexDirection: 'column', marginTop: '12px' }}>
          <div className="skeleton skeleton-text" style={{ width: '80%', margin: 0 }}></div>
          <div className="skeleton skeleton-text" style={{ width: '40%', margin: 0 }}></div>
          <div className="skeleton skeleton-text short" style={{ margin: 0 }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mfr-card">
        <h3 className="mfr-title">Most Forked Repository</h3>

        <div className="mfr-loading">{error}</div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="mfr-card">
        <h3 className="mfr-title">Most Forked Repository</h3>

        <div className="mfr-loading">No Repository Found</div>
      </div>
    );
  }

  return (
    <div className="mfr-card">
      <h3 className="mfr-title">Most Forked Repository</h3>

      <div className="mfr-content">
        <a
          href={repo?.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mfr-repo-name"
        >
          <FaCodeBranch className="mfr-repo-icon" />

          <span>{repo?.name || "Unknown"}</span>
        </a>

        <div className="mfr-forks">
          <FaCodeBranch className="mfr-fork-icon" />

          <span>{repo?.forks ?? 0}</span>
        </div>

        <div className="mfr-language">
          <span className="mfr-dot"></span>

          <span>{repo?.language || "Unknown"}</span>
        </div>
      </div>
    </div>
  );
};

export default MostForkedRepo;
