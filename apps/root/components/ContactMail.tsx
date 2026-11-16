"use client";

import { useEffect, useRef, useState } from "react";
import { CONTACT } from "../../../site/sites";
import type { ContactCopy } from "../lib/contact";

const mailto = (subject?: string) =>
  `mailto:${CONTACT.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

/**
 * The email card: write, copy the address, pick a subject that fills the
 * email's subject line. On phones, a "write to me" button stays at the
 * bottom once the card has scrolled past. Without JavaScript the links still
 * open an email; the subjects and copying do nothing.
 */
export function ContactMail({
  copy,
}: {
  copy: ContactCopy["mail"] & { sticky: string };
}) {
  const [subject, setSubject] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [past, setPast] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const picked = subject === null ? undefined : copy.subjects[subject];
  const href = mailto(picked?.title);

  useEffect(() => {
    const element = card.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry)
        setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copyAddress = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      setAnnounce(copy.copied);
      timer.current = setTimeout(() => {
        setCopied(false);
        setAnnounce("");
      }, 2400);
    } catch {
      setCopied(false);
      setAnnounce(copy.copyFailed);
    }
  };

  return (
    <>
      <div
        ref={card}
        className={copied ? "ct-mail is-copied" : "ct-mail"}
        data-motion-group
      >
        <span className="ct-label">{copy.label}</span>
        <a className="ct-address" href={href} data-sound="nav">
          {CONTACT.email}
        </a>
        <div className="ct-buttons">
          <a className="about-button" href={href} data-sound="nav">
            <span>{copy.write}</span>
            <span className="about-arrow" aria-hidden="true">
              →
            </span>
          </a>
          <button
            type="button"
            className="ct-copy"
            data-sound="copy"
            data-sound-on="click"
            onClick={copyAddress}
          >
            {copied ? copy.copied : copy.copy}
          </button>
          <span className="rv-sr-only" aria-live="polite">
            {announce}
          </span>
        </div>
        <div className="ct-subjects">
          <span className="ct-question" id="ct-question">
            {copy.question}
          </span>
          <div className="ct-chips" role="group" aria-labelledby="ct-question">
            {copy.subjects.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className="ct-chip"
                aria-pressed={subject === index}
                data-sound="click"
                onClick={() => setSubject(subject === index ? null : index)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <p className="ct-hint" aria-live="polite">
            {picked?.hint ?? copy.hint}
          </p>
        </div>
        <p className="ct-note">{copy.note}</p>
      </div>
      <a
        className={past ? "ct-sticky is-on" : "ct-sticky"}
        href={href}
        tabIndex={past ? 0 : -1}
        aria-hidden={!past}
        data-sound="nav"
      >
        <span>{copy.sticky}</span>
        <span className="ct-sticky__address">{CONTACT.email}</span>
        <span className="about-arrow" aria-hidden="true">
          →
        </span>
      </a>
    </>
  );
}
