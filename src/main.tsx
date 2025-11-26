import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import * as Sentry from "@sentry/react";
Sentry.init({
  dsn: "https://482f39d386d0c8e7ff027f4b2d8d620e@o4507185345527808.ingest.us.sentry.io/4510429685678080",
  sendDefaultPii: true,
  enableLogs: true,
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
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

createRoot(document.getElementById("root")!).render(<App />);
