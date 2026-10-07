/**
 * One sound preference for every RaioViajante site.
 *
 * localStorage is per origin, so the preference lives in a cookie on
 * `.raioviajante.com`. Reading is side-effect free. A legacy `rv-sound`
 * localStorage value (written by older root and dump toggles) is honored on
 * that origin until the visitor next switches sound, which writes the cookie
 * and removes the legacy value.
 */
export const SOUND_COOKIE = "rv-sound";
const ONE_YEAR = 60 * 60 * 24 * 365;

export interface PreferenceEnvironment {
  hostname: string;
  protocol: string;
  getCookie(): string;
  setCookie(value: string): void;
  getLegacy(): string | null;
  clearLegacy(): void;
}

export function cookieDomain(hostname: string) {
  return hostname === "raioviajante.com" ||
    hostname.endsWith(".raioviajante.com")
    ? ".raioviajante.com"
    : null;
}

export function serializePreference(
  enabled: boolean,
  hostname: string,
  protocol: string,
) {
  const domain = cookieDomain(hostname);
  return [
    `${SOUND_COOKIE}=${enabled ? "on" : "off"}`,
    "Path=/",
    `Max-Age=${ONE_YEAR}`,
    "SameSite=Lax",
    ...(domain ? [`Domain=${domain}`] : []),
    ...(protocol === "https:" ? ["Secure"] : []),
  ].join("; ");
}

export function parsePreference(cookie: string): boolean | null {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SOUND_COOKIE}=(on|off)`));
  return match ? match[1] === "on" : null;
}

export function writePreference(
  enabled: boolean,
  env: PreferenceEnvironment = browserEnvironment(),
) {
  env.setCookie(serializePreference(enabled, env.hostname, env.protocol));
  env.clearLegacy();
}

/** Reads the preference without writing anything; a cookie wins over a legacy localStorage value. */
export function readPreference(
  env: PreferenceEnvironment = browserEnvironment(),
): boolean {
  const stored = parsePreference(env.getCookie());
  if (stored !== null) return stored;
  const legacy = env.getLegacy();
  return legacy === "on";
}

export function browserEnvironment(): PreferenceEnvironment {
  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    getCookie: () => document.cookie,
    setCookie: (value) => {
      document.cookie = value;
    },
    getLegacy: () => {
      try {
        return window.localStorage.getItem(SOUND_COOKIE);
      } catch {
        return null;
      }
    },
    clearLegacy: () => {
      try {
        window.localStorage.removeItem(SOUND_COOKIE);
      } catch {
        // storage unavailable: nothing to clear
      }
    },
  };
}
