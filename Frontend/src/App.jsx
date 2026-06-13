import "./App.css";
import { useEffect, useState, useRef } from "react";

import { getGithubUsername } from "./services/githubService";

import ProfileCard from "./components/ProfileCard/ProfileCard";
import ProfileAnalysis from "./components/ProfileAnalysis/ProfileAnalysis";
import RepositoryAnalysis from "./components/RepositoryAnalysis/RepositoryAnalysis";
import TechnologyStack from "./components/TechnologyStack/TechnologyStack";
import ActivityAnalysis from "./components/ActivityAnalysis/ActivityAnalysis";
import RepositoryQuality from "./components/RepositoryQuality/RepositoryQuality";
import PortfolioReadiness from "./components/PortfolioReadiness/PortfolioReadiness";
import MostStarredRepo from "./components/MostStarredRepo/MostStarredRepo";
import MostForkedRepo from "./components/MostForkedRepo/MostForkedRepo";
import ActivityStatus from "./components/ActivityStatus/ActivityStatus";
import ActionButtons from "./components/ActionButtons/ActionButtons";

function App() {
  const [username, setUsername] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const dashboardRef = useRef(null);

  /* ==========================
     MODULE LOADING TRACKER
  ========================== */

  const TOTAL_MODULES = 10;

  const [loadedModules, setLoadedModules] =
    useState(0);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const handleModuleLoaded =
    () => {
      setLoadedModules(
        (prev) => prev + 1
      );
    };
const handleReanalyze = () => {
  console.clear();

  console.log(
    "================================="
  );

  console.log(
    "🔄 REANALYZE BUTTON CLICKED"
  );

  console.log(
    "================================="
  );

  setLoadedModules(0);

  setRefreshKey(
    (prev) => prev + 1
  );
};

  const isDashboardLoading =
    loadedModules < TOTAL_MODULES;

  /* ==========================
     LOAD USERNAME
  ========================== */

  useEffect(() => {
    const loadUsername =
      async () => {
        try {
          const githubUsername =
            await getGithubUsername();

          console.log(
            "Detected GitHub Username:",
            githubUsername
          );

          setUsername(
            githubUsername
          );
        } catch (error) {
          console.error(
            "Username Detection Error:",
            error
          );
        } finally {
          setIsLoading(false);
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
          justifyContent:
            "center",
          alignItems:
            "center",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        Loading GitHub User...
      </div>
    );
  }

  return (
    <div
      className="dashboard"
      ref={dashboardRef}
    >
      <div className="full-row">
        <ProfileCard
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />
      </div>

      <div className="full-row">
        <ProfileAnalysis
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />
      </div>

      <div className="full-row">
        <RepositoryAnalysis
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />
      </div>

      <div
        className="row"
        style={{
          gridTemplateColumns:
            "4fr 6fr",
        }}
      >
        <TechnologyStack
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />

        <ActivityAnalysis
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />
      </div>

      <div
        className="row"
        style={{
          gridTemplateColumns:
            "4fr 6fr",
        }}
      >
        <RepositoryQuality
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />

        <PortfolioReadiness
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />
      </div>

      <div
        className="row"
        style={{
          gridTemplateColumns:
            "3fr 3fr 4fr",
        }}
      >
        <MostStarredRepo
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />

        <MostForkedRepo
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />

        <ActivityStatus
          username={username}
          refreshKey={refreshKey}
          onLoaded={handleModuleLoaded}
        />
      </div>

      <div className="full-row">
        <ActionButtons
          isLoading={
            isLoading ||
            isDashboardLoading
          }
          dashboardRef={dashboardRef}
          onReanalyze={
            handleReanalyze
          }
        />
      </div>
    </div>
  );
}

export default App;