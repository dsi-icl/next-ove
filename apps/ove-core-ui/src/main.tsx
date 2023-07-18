import App from "./app/app";
import { StrictMode } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import * as ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <StrictMode>
    <HelmetProvider>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Next-OVE Core</title>
      </Helmet>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);