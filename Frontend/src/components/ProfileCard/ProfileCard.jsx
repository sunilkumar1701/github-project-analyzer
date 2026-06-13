import { useEffect, useState } from "react";
import "./ProfileCard.css";
import { getProfile } from "../../services/githubService";

const ProfileCard = ({ username, onLoaded, refreshKey }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log(
      "🔄 Refetching ProfileCard"
    );
        console.log("Profile Username:", username);
        const data = await getProfile(username);
        console.log(
      "✅ ProfileCard Loaded"
    );
        setProfile(data);
        onLoaded?.();
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [username,refreshKey]);

  if (!profile) {
    return <div className="module-card profile-card">Loading Profile...</div>;
  }

  const getWebsiteLabel = (url) => {
    if (!url) return "";

    try {
      const hostname = new URL(url.startsWith("http") ? url : `https://${url}`)
        .hostname;

      return hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <div className="module-card profile-card">
      {/* LEFT SIDE */}
      <div className="profile-left">
        <img
          src={profile.avatar_url}
          alt={profile.name}
          className="profile-avatar"
        />

        <div className="profile-details">
          <h2>{profile.name || profile.login}</h2>

          <p className="username">@{profile.login}</p>

          <div className="profile-meta">
            {profile.location && (
              <div className="meta-item">
                <svg
                  className="meta-icon"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 0a5 5 0 0 0-5 5c0 3.75 5 11 5 11s5-7.25 5-11a5 5 0 0 0-5-5Zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" />
                </svg>

                <span>{profile.location}</span>
              </div>
            )}

            {profile.blog && (
              <a
                href={
                  profile.blog.startsWith("http")
                    ? profile.blog
                    : `https://${profile.blog}`
                }
                target="_blank"
                rel="noreferrer"
                className="meta-item website-link"
              >
                <svg
                  className="meta-icon"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M7.775 3.275a3.25 3.25 0 0 1 4.596 4.596l-1.944 1.944a3.25 3.25 0 0 1-4.596 0 .75.75 0 0 1 1.06-1.06 1.75 1.75 0 0 0 2.475 0L11.31 6.81a1.75 1.75 0 1 0-2.475-2.475L7.775 5.395a.75.75 0 1 1-1.06-1.06l1.06-1.06Z" />
                  <path d="M8.225 12.725a3.25 3.25 0 0 1-4.596-4.596l1.944-1.944a3.25 3.25 0 0 1 4.596 0 .75.75 0 0 1-1.06 1.06 1.75 1.75 0 0 0-2.475 0L4.69 9.19a1.75 1.75 0 1 0 2.475 2.475l1.06-1.06a.75.75 0 1 1 1.06 1.06l-1.06 1.06Z" />
                </svg>

                <span>{getWebsiteLabel(profile.blog)}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      {/* RIGHT SIDE */}
      <div className="profile-right">
        <div className="score-info">
          <div className="score-label">
            <span className="crown">👑</span>

            <div>
              <p className="score-heading">Developer</p>
              <p className="score-heading">Score</p>
            </div>
          </div>

          <div className="expert-badge">Advanced</div>
        </div>

        <div className="gauge-wrapper">
          <svg className="score-gauge" viewBox="0 0 200 120">
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
            </defs>

            <path d="M30 100 A70 70 0 0 1 170 100" className="gauge-track" />

            <path d="M30 100 A70 70 0 0 1 170 100" className="gauge-progress" />
          </svg>

          <div className="score-center">
            <h2>85</h2>
            <span>/100</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
