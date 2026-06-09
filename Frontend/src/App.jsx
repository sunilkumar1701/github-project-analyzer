import "./App.css";
import { useEffect, useState } from "react";

import { getGithubUsername } from "./services/githubService";

import ProfileCard from "./components/ProfileCard/ProfileCard";
import ProfileAnalysis from "./components/ProfileAnalysis/ProfileAnalysis";
import RepositoryAnalysis from "./components/RepositoryAnalysis/RepositoryAnalysis";
import TechnologyStack from "./components/TechnologyStack/TechnologyStack";
import ActivityAnalysis from "./components/ActivityAnalysis/ActivityAnalysis";
import RepositoryQuality from "./components/RepositoryQuality/RepositoryQuality";
import PortfolioReadiness from "./components/PortfolioReadiness/PortfolioReadiness";
import OpenSourceImpact from "./components/OpenSourceImpact/OpenSourceImpact";
import MostStarredRepo from "./components/MostStarredRepo/MostStarredRepo";
import MostForkedRepo from "./components/MostForkedRepo/MostForkedRepo";
import ActivityStatus from "./components/ActivityStatus/ActivityStatus";
import ActionButtons from "./components/ActionButtons/ActionButtons";

function App() {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const githubUsername =
          await getGithubUsername();

        console.log(
          "Detected GitHub Username:",
          githubUsername
        );

        setUsername(githubUsername);
      } catch (error) {
        console.error(
          "Username Detection Error:",
          error
        );
      }
    };

    loadUsername();
  }, []);

  if (!username) {
    return (
      <div
        className="dashboard"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        Loading GitHub User...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="full-row">
        <ProfileCard username={username} />
      </div>

      <div className="full-row">
        <ProfileAnalysis username={username} />
      </div>

      <div className="full-row">
        <RepositoryAnalysis username={username} />
      </div>

      <div
        className="row"
        style={{
          gridTemplateColumns: "4fr 6fr",
        }}
      >
        <TechnologyStack username={username} />
        <ActivityAnalysis username={username} />
      </div>

      <div className="row"style={{
          gridTemplateColumns: "4fr 6fr",
        }}>
        <RepositoryQuality username={username} />
        <PortfolioReadiness username={username} />
      </div>

      <div className="row">
        <OpenSourceImpact username={username} />
        <MostStarredRepo username={username} />
      </div>

      <div className="row">
        <ActivityStatus username={username} />
        <MostForkedRepo username={username} />
      </div>

      <div className="full-row">
        <ActionButtons />
      </div>
    </div>
  );
}

export default App;