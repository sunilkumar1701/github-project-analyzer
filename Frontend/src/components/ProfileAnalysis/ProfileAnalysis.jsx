import { useEffect, useState } from "react";
import "./ProfileAnalysis.css";

import { Users, UserRound, FolderGit2, Clock3, Link2 } from "lucide-react";

import { getProfileAnalysis } from "../../services/githubService";

const ProfileAnalysis = ({ username, onLoaded, refreshKey }) => {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        console.log("🔄 Refetching ProfileAnalysis");
        const data = await getProfileAnalysis(username);
        console.log("✅ ProfileAnalysis Loaded");
        setAnalysis(data);
        onLoaded?.();
      } catch (error) {
        console.error("Error fetching profile analysis:", error);
      }
    };

    fetchAnalysis();
  }, [username, refreshKey]);

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";

    const now = new Date();
    const updated = new Date(dateString);

    const seconds = Math.floor((now - updated) / 1000);

    if (seconds < 60) {
      return `${seconds} sec ago`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
      return `${days} day ago`;
    }

    const months = Math.floor(days / 30);

    if (months < 12) {
      return `${months} month ago`;
    }

    const years = Math.floor(months / 12);

    return `${years} year ago`;
  };

  if (!analysis) {
    return <div className="profile-analysis">Loading...</div>;
  }

  return (
    <div className="profile-analysis">
      {/* Followers */}

      <div className="analysis-card">
        <div className="analysis-header">
          <Users size={18} color="#8B5CF6" />

          <span className="analysis-title">Followers</span>
        </div>

        <h2 className="analysis-count">{analysis.followers}</h2>
      </div>

      {/* Following */}

      <div className="analysis-card">
        <div className="analysis-header">
          <UserRound size={18} color="#A855F7" />

          <span className="analysis-title">Following</span>
        </div>

        <h2 className="analysis-count">{analysis.following}</h2>
      </div>

      {/* Public Repo + Recent Repo */}

      <div className="analysis-card repo-card">
        {/* LEFT */}

        <div className="repo-left">
          <div className="analysis-header">
            <FolderGit2 size={18} color="#F59E0B" />

            <span className="analysis-title">Public Repos</span>
          </div>

          <h2 className="analysis-count">{analysis.public_repos}</h2>
        </div>

        {/* DIVIDER */}

        <div className="repo-divider"></div>

        {/* RIGHT */}

        <div className="repo-right">
          <div className="analysis-header">
            <Clock3 size={16} color="#60A5FA" />

            <span className="analysis-title recent-title">
              Recent Active Repo
            </span>
          </div>

          <a
            href={analysis.recent_repo?.html_url}
            target="_blank"
            rel="noreferrer"
            className="repo-link"
          >
            <Link2 size={14} color="#94A3B8" />

            <span>{analysis.recent_repo?.name}</span>
          </a>

          <div className="repo-time">
            Updated {getRelativeTime(analysis.recent_repo?.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAnalysis;
