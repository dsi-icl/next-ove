import App from "./app/app";
import React, { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

interface ImportMeta {
  env: {
    BASE_URL: string
  };
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
      <BrowserRouter
        basename={(import.meta as unknown as ImportMeta).env.BASE_URL}>
        <App />
      </BrowserRouter>
  </StrictMode>
);
