import { useEffect, useState } from "react";
import "./RepositoryAnalysis.css";

import {
  FolderGit2,
  Star,
  GitFork,
  Trophy,
  Link2,
} from "lucide-react";

import { getRepositoryAnalysis } from "../../services/githubService";

const RepositoryAnalysis = ({ username }) => {
  const [repositoryStats, setRepositoryStats] =
    useState(null);

  useEffect(() => {
    const fetchRepositoryAnalysis =
      async () => {
        try {
          const data =
            await getRepositoryAnalysis(
              username
            );

          setRepositoryStats(data);
        } catch (error) {
          console.error(
            "Repository Analysis Error:",
            error
          );
        }
      };

    fetchRepositoryAnalysis();
  }, [username]);

  if (!repositoryStats) {
    return (
      <div className="repository-analysis">
        Loading...
      </div>
    );
  }

  return (
    <div className="repository-analysis">
      {/* Repositories */}

      <div className="repo-analysis-card">
        <div className="repo-analysis-header">
          <FolderGit2
            size={18}
            color="#60A5FA"
          />

          <span>Repositories</span>
        </div>

        <h2>
          {repositoryStats.total_repos}
        </h2>
      </div>

      {/* Total Stars */}

      <div className="repo-analysis-card">
        <div className="repo-analysis-header">
          <Star
            size={18}
            color="#FACC15"
          />

          <span>Total Stars</span>
        </div>

        <h2>
          {repositoryStats.total_stars}
        </h2>
      </div>

      {/* Total Forks */}

      <div className="repo-analysis-card">
        <div className="repo-analysis-header">
          <GitFork
            size={18}
            color="#A855F7"
          />

          <span>Total Forks</span>
        </div>

        <h2>
          {repositoryStats.total_forks}
        </h2>
      </div>

      {/* Top Repository */}

      <div className="repo-analysis-card top-repo-card">
        <div className="repo-analysis-header">
  <Trophy
    size={18}
    color="#F59E0B"
  />

  <span>Top Repository</span>

  <div className="tooltip-container">
    ⓘ

    <div className="repo-tooltip">
      <strong>Top Repository</strong>

      <br />

      • Highest stars

      <br />

      • If tied → Highest forks

      <br />

      • If still tied → Most recently updated
    </div>
  </div>
</div>

        <a
          href={
            repositoryStats.top_repo
              ?.html_url
          }
          target="_blank"
          rel="noreferrer"
          className="top-repo-link"
        >
          <Link2
            size={14}
            color="#94A3B8"
          />

          <span className="top-repo-name">
            {
              repositoryStats.top_repo
                ?.name
            }
          </span>
        </a>

        <div className="top-repo-stats">
          <div className="repo-stat-item">
            <Star
              size={14}
              color="#FACC15"
            />

            <span>
              {
                repositoryStats.top_repo
                  ?.stars
              }
            </span>
          </div>

          <div className="repo-stat-item">
            <GitFork
              size={14}
              color="#CBD5E1"
            />

            <span>
              {
                repositoryStats.top_repo
                  ?.forks
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryAnalysis;