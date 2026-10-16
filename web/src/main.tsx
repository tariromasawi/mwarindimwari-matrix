import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MatrixApp } from "@/components/matrix/MatrixApp";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MatrixApp />
  </StrictMode>,
);
