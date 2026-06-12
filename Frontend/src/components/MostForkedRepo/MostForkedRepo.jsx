import "./MostForkedRepo.css";

import {
  useEffect,
  useState,
} from "react";

import {
  FaCodeBranch,
} from "react-icons/fa";

import {
  getMostForkedRepository,
} from "../../services/githubService";

const MostForkedRepo = ({
  username,
}) => {

  const [repo, setRepo] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchRepository();
  }, [username]);

  const fetchRepository =
    async () => {
      try {

        setLoading(true);

        const data =
          await getMostForkedRepository(
            username
          );

        setRepo(data);

      } catch (error) {

        console.error(
          "Most Forked Repo Error:",
          error
        );

      } finally {

        setLoading(false);

      }
    };

  if (loading) {
    return (
      <div className="mfr-card">
        <h3 className="mfr-title">
          Most Forked Repository
        </h3>

        <div className="mfr-loading">
          Loading...
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="mfr-card">
        <h3 className="mfr-title">
          Most Forked Repository
        </h3>

        <div className="mfr-loading">
          No Repository Found
        </div>
      </div>
    );
  }

  return (
    <div className="mfr-card">
      <h3 className="mfr-title">
        Most Forked Repository
      </h3>

      <div className="mfr-content">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mfr-repo-name"
        >
          <FaCodeBranch className="mfr-repo-icon" />

          <span>
            {repo.name}
          </span>
        </a>

        <div className="mfr-forks">
          <FaCodeBranch className="mfr-fork-icon" />

          <span>
            {repo.forks}
          </span>
        </div>

        <div className="mfr-language">
          <span className="mfr-dot"></span>

          <span>
            {repo.language ||
              "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MostForkedRepo;