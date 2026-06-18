import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

import { DashboardProvider } from "./context/DashboardContext";

createRoot(document.getElementById("root")).render(
  <DashboardProvider>
    <App />
  </DashboardProvider>
);