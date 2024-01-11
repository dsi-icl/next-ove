import App from "./app";
import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

describe("App", () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(baseElement).toBeTruthy();
  });

  it("should have a greeting as the title", () => {
    const { getByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(getByText(/Welcome ove-bridge-ui/gi)).toBeTruthy();
  });
});
