import App from "./app/app";
import React, { StrictMode } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
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
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>next-ove</title>
      </Helmet>
      <BrowserRouter
        basename={(import.meta as unknown as ImportMeta).env.BASE_URL}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
