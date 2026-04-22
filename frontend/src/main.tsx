import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RoleProvider } from "./context/role-context";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RoleProvider>
      <App />
    </RoleProvider>
  </React.StrictMode>,
);

