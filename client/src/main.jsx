import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WineSurvey from "./WineSurvey.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WineSurvey />
  </StrictMode>
);
