import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

let started = false;

export async function startMockApi() {
  if (typeof window === "undefined" || started) return;
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
  started = true;
}
