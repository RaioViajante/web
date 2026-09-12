import Link from "next/link";
import { places, recentActivity } from "../lib/home";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <h1 className="page-heading">curious enough to build it myself.</h1>
      <p className={`page-description ${styles.description}`}>
        I write things, build things and occasionally go too far trying to
        understand how they work.
      </p>

      <section className={styles.places} aria-labelledby="places-heading">
        <h2 id="places-heading" className={styles.sectionHeading}>
          places/
        </h2>
        <div className={styles.placesList}>
          {places.map((place) => {
            const external = place.href.startsWith("https://");
            return (
              <Link
                key={place.href}
                href={place.href}
                className={styles.place}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer noopener" : undefined}
                prefetch={false}
              >
                <div>
                  <span className={styles.placeName}>{place.name}</span>
                  <div className={styles.placeDescription}>
                    {place.description}
                  </div>
                </div>
                <span className={styles.arrow} aria-hidden="true">
                  {external ? "↗" : "→"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <h2
          id="recent-heading"
          className={`${styles.sectionHeading} ${styles.recentHeading}`}
        >
          recent/
        </h2>
        <ul className={styles.recentList}>
          {recentActivity.map((entry) => (
            <li
              key={`${entry.date}-${entry.source}`}
              className={styles.recentRow}
            >
              <time dateTime={entry.date}>{entry.date}</time>
              <span className={styles.source}>{entry.source}</span>
              <span className={styles.message}>{entry.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
