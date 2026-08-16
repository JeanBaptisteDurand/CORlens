import { useEffect, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { Navbar } from "./Navbar.js";

const ROUTE_TRANSITION_MS = 560;

type TransitionStage = "idle" | "exit" | "enter";

export function Layout(): JSX.Element {
  const location = useLocation();
  const outlet = useOutlet();
  const locationKey = `${location.pathname}${location.search}${location.hash}`;

  const [displayedOutlet, setDisplayedOutlet] = useState(outlet);
  const [displayedLocationKey, setDisplayedLocationKey] = useState(locationKey);
  const [transitionStage, setTransitionStage] = useState<TransitionStage>("idle");

  useEffect(() => {
    if (locationKey === displayedLocationKey) return;

    setTransitionStage("exit");
    const timeoutId = window.setTimeout(() => {
      setDisplayedOutlet(outlet);
      setDisplayedLocationKey(locationKey);
      setTransitionStage("enter");
    }, ROUTE_TRANSITION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [displayedLocationKey, locationKey, outlet]);

  useEffect(() => {
    if (transitionStage !== "enter") return;
    const timeoutId = window.setTimeout(() => setTransitionStage("idle"), ROUTE_TRANSITION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [transitionStage]);

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-slate-950">
      <Navbar />
      <main className="relative z-10 pt-14">
        <div
          className={[
            "route-transition",
            transitionStage === "idle" ? "" : `route-transition--${transitionStage}`,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {displayedOutlet}
        </div>
      </main>
    </div>
  );
}
