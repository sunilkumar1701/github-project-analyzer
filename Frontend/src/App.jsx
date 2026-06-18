import "./App.css";

import {
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

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

import { useDashboardContext } from "./context/DashboardContext";

function App() {
  const { dashboardData } = useDashboardContext();

  const dashboardRef = useRef(null);
  const mountedRef = useRef(true);

  const TOTAL_MODULES = 10;

  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedModules, setLoadedModules] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleModuleLoaded = useCallback(() => {
    setLoadedModules((prev) =>
      prev < TOTAL_MODULES ? prev + 1 : prev
    );
  }, []);

  const handleReanalyze = useCallback(() => {
    console.log("🔄 Reanalyzing dashboard");

    setLoadedModules(0);

    setRefreshKey((prev) => prev + 1);
  }, []);

  const isDashboardLoading =
    loadedModules < TOTAL_MODULES;

  useEffect(() => {
    mountedRef.current = true;

    const loadUsername = async () => {
      try {
        setIsLoading(true);

        const githubUsername = await getGithubUsername();

        if (!mountedRef.current) return;

        if (!githubUsername) {
          throw new Error(
            "Unable to detect GitHub username."
          );
        }

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

        if (mountedRef.current) {
          setUsername(null);
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadUsername();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (isLoading) {
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

  if (!username) {
    return (
      <div
        className="dashboard"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          color: "#ef4444",
        }}
      >
        Failed to detect GitHub username.
      </div>
    );
  }

  return (
    <div className="dashboard" ref={dashboardRef}>
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
          gridTemplateColumns: "4fr 6fr",
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
          gridTemplateColumns: "4fr 6fr",
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
          gridTemplateColumns: "3fr 3fr 4fr",
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
          isLoading={isLoading || isDashboardLoading}
          dashboardRef={dashboardRef}
          onReanalyze={handleReanalyze}
          username={username}
          dashboardData={dashboardData}
        />
      </div>
    </div>
  );
}

export default App;