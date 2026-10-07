import { spawn } from "node:child_process";

// The four built apps on their local ports, shared by the runtime verifiers.
// Running servers are reused; otherwise the built apps are started and
// `stop()` ends them (pnpm spawns the server as a child, so the whole process
// group is stopped). Exit code 2 from a verifier means "nothing was verified".
export const ports = { root: 3002, dump: 3001, docs: 4321, lab: 4322 };
const commands = {
  root: ["next", "start", "-p", "3002"],
  dump: ["next", "start", "-p", "3001"],
  docs: [
    "astro",
    "preview",
    "--ignore-lock",
    "--host",
    "127.0.0.1",
    "--port",
    "4321",
  ],
  lab: [
    "astro",
    "preview",
    "--ignore-lock",
    "--host",
    "127.0.0.1",
    "--port",
    "4322",
  ],
};
const up = (site) =>
  fetch(`http://127.0.0.1:${ports[site]}/`).then(
    (r) => r.ok,
    () => false,
  );

/** Starts what is not running. Returns `{ stop }`, or exits 2 if an app never comes up. */
export async function startServers(sites = Object.keys(ports)) {
  const started = [];
  const stop = () => {
    for (const child of started)
      try {
        process.kill(-child.pid);
      } catch {}
  };
  for (const site of sites) {
    if (await up(site)) continue;
    started.push(
      spawn("pnpm", ["exec", ...commands[site]], {
        cwd: new URL(`../apps/${site}/`, import.meta.url),
        stdio: "ignore",
        detached: true,
      }),
    );
  }
  for (const site of sites)
    for (let i = 0; !(await up(site)); i++) {
      if (i > 60) {
        console.error(`${site} did not start; build it first (pnpm -r build).`);
        stop();
        process.exit(2);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
  return { stop };
}
