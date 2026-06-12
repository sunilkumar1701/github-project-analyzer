import "./MostStarredRepo.css";

import {
  useEffect,
  useState,
} from "react";

import {
  FaStar,
  FaCodeBranch,
} from "react-icons/fa";

import {
  getMostStarredRepository,
} from "../../services/githubService";

const MostStarredRepo = ({
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
          await getMostStarredRepository(
            username
          );

        setRepo(data);
      } catch (error) {
        console.error(
          "Most Starred Repo Error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="msr-card">
        <h3 className="msr-title">
          Most Starred Repository
        </h3>

        <div className="msr-loading">
          Loading...
        </div>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="msr-card">
        <h3 className="msr-title">
          Most Starred Repository
        </h3>

        <div className="msr-loading">
          No Repository Found
        </div>
      </div>
    );
  }

  return (
    <div className="msr-card">
      <h3 className="msr-title">
        Most Starred Repository
      </h3>

      <div className="msr-content">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="msr-repo-name"
        >
          <FaCodeBranch className="msr-repo-icon" />

          <span>
            {repo.name}
          </span>
        </a>

        <div className="msr-stars">
          <FaStar className="msr-star-icon" />

          <span>
            {repo.stars}
          </span>
        </div>

        <div className="msr-language">
          <span className="msr-dot"></span>

          <span>
            {repo.language || "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MostStarredRepo;