import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App.js";
import "./app/app.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("web_root_missing");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
