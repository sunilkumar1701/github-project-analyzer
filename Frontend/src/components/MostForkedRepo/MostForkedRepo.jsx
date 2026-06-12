import "./MostForkedRepo.css";

import {
  FaStar,
  FaCodeBranch,
} from "react-icons/fa";

const MostForkedRepo = () => {
  const repo = {
    name: "linux",
    url: "https://github.com/torvalds/linux",
    forks: "24.2K",
    language: "C",
  };

  return (
    <div className="mfr-card">
      <h3 className="mfr-title">
        Most Forked Repository
      </h3>

      <div className="mfr-content">
        <a
          href={repo.url}
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
          <FaStar className="mfr-fork-icon" />

          <span>
            {repo.forks}
          </span>
        </div>

        <div className="mfr-language">
          <span className="mfr-dot"></span>

          <span>
            {repo.language}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MostForkedRepo;