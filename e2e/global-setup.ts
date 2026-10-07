import { startServers } from "../security/local-servers.mjs";

// Reuses servers that are already running and otherwise starts the built apps
// (exit code 2 with a clear message if a build is missing). Whatever this
// started is stopped again when the run ends.
export default async function globalSetup() {
  const { stop } = await startServers();
  return () => stop();
}
