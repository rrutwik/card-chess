import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Sentry (~200 KB) is loaded after first paint so it doesn't delay rendering (Core Web Vitals).
async function initSentry() {
  const Sentry = await import("@sentry/react");
  Sentry.init({
    dsn: "https://482f39d386d0c8e7ff027f4b2d8d620e@o4507185345527808.ingest.us.sentry.io/4510429685678080",
    sendDefaultPii: true,
    enableLogs: true,
    // Tracing
    tracesSampleRate: 0.1, // Capture 10% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.consoleLoggingIntegration({ levels: ['error', 'warn', 'info', 'log', 'debug'] }),
      Sentry.browserApiErrorsIntegration(),
      Sentry.browserSessionIntegration(),
    ],
  });
}

const scheduleSentry = () => {
  initSentry().catch(() => {
    /* monitoring must never break the app */
  });
};
if (typeof window.requestIdleCallback === "function") {
  window.requestIdleCallback(scheduleSentry, { timeout: 4000 });
} else {
  window.setTimeout(scheduleSentry, 1500);
}
