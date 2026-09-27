import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-page">
      <p className="not-found-eyebrow">404</p>
      <h1 className="not-found-heading">Nothing here.</h1>
      <p className="not-found-copy">
        Either this page never existed, or I broke something again.
      </p>
      <p className="not-found-back">
        <Link href="/">← back to posts</Link>
      </p>
    </div>
  );
}
