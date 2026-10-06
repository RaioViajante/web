/**
 * One sound preference for every RaioViajante site.
 *
 * localStorage is per origin, so the preference lives in a cookie on
 * `.raioviajante.com`. The legacy `rv-sound` localStorage value written by
 * the root and dump toggles is migrated on first read.
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
}

/** Reads the preference; the first read moves a legacy localStorage value into the cookie. */
export function readPreference(
  env: PreferenceEnvironment = browserEnvironment(),
): boolean {
  const stored = parsePreference(env.getCookie());
  if (stored !== null) return stored;
  const legacy = env.getLegacy();
  if (legacy === "on" || legacy === "off") {
    writePreference(legacy === "on", env);
    env.clearLegacy();
    return legacy === "on";
  }
  return false;
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
