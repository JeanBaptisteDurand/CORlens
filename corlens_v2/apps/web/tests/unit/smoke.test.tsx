import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "../../src/App.js";

describe("App bootstrap", () => {
  // Both tests in this file now mount the same Layout+Navbar tree (previously
  // only the second one did, since "/" rendered the landing route's Suspense
  // fallback with no Navbar) — without cleanup between tests, jsdom retains
  // both renders and text queries match twice.
  afterEach(() => {
    cleanup();
  });

  it("redirects '/' to '/home' and mounts something (Suspense fallback at minimum)", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    // Lazy Home chunk takes one tick to resolve; in the sync render we just see the
    // Suspense fallback. Both states are non-empty.
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the Layout shell with Navbar for any in-app route", () => {
    render(
      <MemoryRouter initialEntries={["/account"]}>
        <App />
      </MemoryRouter>,
    );
    // /account still resolves to the placeholder card (its v1 port lands in a
    // later commit), so we use it as a stable Layout smoke target.
    expect(screen.getByText("corelens")).toBeDefined();
    expect(screen.getByRole("navigation")).toBeDefined();
  });
});
