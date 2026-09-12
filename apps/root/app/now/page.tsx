import type { Metadata } from "next";
import { lastUpdated, now, tagline } from "../../lib/now";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "now",
};

export default function Now() {
  return (
    <>
      <h1 className={`section-label ${styles.heading}`}>now/</h1>
      <p className={styles.meta}>last updated {lastUpdated}</p>
      <p className={styles.description}>{tagline}</p>

      <div className={styles.groups}>
        {now.map((group) => (
          <section
            key={group.category}
            className={styles.row}
            aria-labelledby={`${group.category}-heading`}
          >
            <h2 id={`${group.category}-heading`} className={styles.label}>
              {group.category}
            </h2>
            <div className={styles.items}>
              {group.items.map((item) => (
                <div key={item.title}>
                  <div className={styles.itemTitle}>{item.title}</div>
                  {item.description ? (
                    <p className={styles.itemDescription}>{item.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
