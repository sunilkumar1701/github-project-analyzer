import "./App.css";

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
  return (
    <div className="dashboard">
      <div className="full-row">
        <ProfileCard />
      </div>

      <div className="full-row">
        <ProfileAnalysis />
      </div>

      <div className="full-row">
        <RepositoryAnalysis />
      </div>

      <div className="row">
        <TechnologyStack />
        <ActivityAnalysis />
      </div>

      <div className="row">
        <RepositoryQuality />
        <PortfolioReadiness />
      </div>

      <div className="row">
        <OpenSourceImpact />
        <MostStarredRepo />
      </div>

      <div className="row">
        <ActivityStatus />
        <MostForkedRepo />
      </div>

      <div className="full-row">
        <ActionButtons />
      </div>
    </div>
  );
}

export default App;
