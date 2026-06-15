import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const DashboardContext =
  createContext();

export const DashboardProvider = ({
  children,
}) => {
  const [
    dashboardData,
    setDashboardData,
  ] = useState({
    profileAnalysis: null,
    repositoryAnalysis: null,
    technologyStack: null,
    activityAnalysis: null,
    portfolioReadiness: null,
    repositoryQuality: null,
    mostStarredRepo: null,
    mostForkedRepo: null,
    activityStatus: null,
    developerScore: null,
  });

  const updateDashboardData = (
    key,
    value
  ) => {
    setDashboardData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    console.log(
      "Dashboard Context Updated:",
      dashboardData
    );
  }, [dashboardData]);

  return (
    <DashboardContext.Provider
      value={{
        dashboardData,
        updateDashboardData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext =
  () => useContext(
    DashboardContext
  );