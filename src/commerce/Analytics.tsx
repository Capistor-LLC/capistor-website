import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Enable only after turning off Enhanced Measurement in the GA4 stream.
const measurement =
  import.meta.env.VITE_GA_MANUAL_ONLY === "true"
    ? (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)
    : undefined;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};
const publicPath = (path: string) =>
  !/^\/(portal|admin|login|api)(\/|$)/.test(path);

export default function Analytics() {
  const location = useLocation();
  const [choice, setChoice] = useState<string | null>(() => {
    try {
      return typeof window === "undefined"
        ? null
        : localStorage.getItem("capistor-analytics-consent");
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const reset = () => setChoice(null);
    window.addEventListener("analytics:preferences", reset);
    return () => window.removeEventListener("analytics:preferences", reset);
  }, []);
  useEffect(() => {
    if (!measurement || !/^G-[A-Z0-9]+$/.test(measurement)) return;
    const permitted = choice === "granted" && publicPath(location.pathname);
    (window as unknown as Record<string, unknown>)[
      `ga-disable-${measurement}`
    ] = !permitted;
    if (!permitted) return;
    const w = window as AnalyticsWindow;
    if (!w.gtag) {
      w.dataLayer = w.dataLayer || [];
      // Google's gtag queue consumes arguments objects rather than event arrays.
      w.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
      w.gtag("js", new Date());
      w.gtag("config", measurement, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: window.location.origin + location.pathname,
        page_referrer: "",
      });
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurement}`;
      script.async = true;
      document.head.appendChild(script);
    }
    w.gtag("event", "page_view", {
      page_location: window.location.origin + location.pathname,
      page_path: location.pathname,
      page_title: document.title,
      page_referrer: "",
    });
  }, [choice, location.pathname]);
  function decide(value: string) {
    try {
      localStorage.setItem("capistor-analytics-consent", value);
    } catch {
      /* The preference still applies to the current visit. */
    }
    (window as unknown as Record<string, unknown>)[
      `ga-disable-${measurement}`
    ] = value !== "granted";
    setChoice(value);
  }
  if (!measurement || choice || !publicPath(location.pathname)) return null;
  return (
    <aside className="consent-banner" aria-label="Analytics preference">
      <p>
        Allow optional analytics to help improve these public pages? Project
        pages, files and payment details are excluded. Your choice won’t affect
        ordering.
      </p>
      <div className="actions">
        <button onClick={() => decide("granted")}>Allow analytics</button>
        <button onClick={() => decide("denied")}>No thanks</button>
      </div>
    </aside>
  );
}
