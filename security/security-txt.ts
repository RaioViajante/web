import { siteOrigins, type Site } from "./headers.ts";

// RFC 9116 source of truth for every host's /.well-known/security.txt.
// Renew by moving `expires` forward (under one year), then run
// `node security/sync-vercel.mjs`. `pnpm security:check` fails inside the
// 30-day renewal window.
export const securityTxt = {
  contact: "mailto:mail@raioviajante.com",
  expires: "2027-10-01T00:00:00Z",
  preferredLanguages: "en, pt",
};

export const renewalWindowDays = 30;
export const maxValidityDays = 366;
export const securityTxtPath = "/.well-known/security.txt";

export function renderSecurityTxt(site: Site) {
  return [
    `Contact: ${securityTxt.contact}`,
    `Expires: ${securityTxt.expires}`,
    `Preferred-Languages: ${securityTxt.preferredLanguages}`,
    `Canonical: ${siteOrigins[site]}${securityTxtPath}`,
    "",
  ].join("\n");
}

// Returns problems; empty means the file is valid RFC 9116 and not near expiry.
export function checkSecurityTxt(
  site: Site,
  text: string,
  now = new Date(),
): string[] {
  const problems: string[] = [];
  if (text.charCodeAt(0) === 0xfeff) problems.push("BOM");
  if (text.includes("\r")) problems.push("expected LF line endings");
  if (!text.endsWith("\n")) problems.push("missing final newline");
  const fields = new Map<string, string[]>();
  for (const line of text.split("\n").slice(0, -1)) {
    const match = /^([A-Za-z][A-Za-z-]*): (\S.*)$/.exec(line);
    if (!match) problems.push(`malformed line: ${JSON.stringify(line)}`);
    else
      fields.set(match[1].toLowerCase(), [
        ...(fields.get(match[1].toLowerCase()) ?? []),
        match[2],
      ]);
  }
  for (const name of ["contact", "expires", "preferred-languages", "canonical"])
    if (!fields.has(name)) problems.push(`missing ${name}`);
  for (const name of ["expires", "preferred-languages"])
    if ((fields.get(name)?.length ?? 0) > 1) problems.push(`duplicate ${name}`);
  if (fields.get("contact")?.join() !== securityTxt.contact)
    problems.push("unexpected contact");
  if (fields.get("preferred-languages")?.[0] !== securityTxt.preferredLanguages)
    problems.push("unexpected preferred-languages");
  if (
    fields.get("canonical")?.join() !== `${siteOrigins[site]}${securityTxtPath}`
  )
    problems.push("unexpected canonical");
  const expires = fields.get("expires")?.[0];
  if (expires !== undefined) {
    const time = Date.parse(expires);
    if (
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z$/.test(expires) ||
      isNaN(time)
    )
      problems.push("expires is not an RFC 3339 UTC timestamp");
    else {
      const days = (time - now.getTime()) / 86_400_000;
      if (days < 0) problems.push("expired");
      else if (days < renewalWindowDays)
        problems.push(`expires in ${Math.floor(days)} days; renew it`);
      else if (days > maxValidityDays)
        problems.push("expires more than a year ahead (RFC 9116)");
    }
  }
  return problems;
}
