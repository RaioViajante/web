import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Not found</h1>
      <p>
        That page does not exist. Try the <Link href="/">home page</Link> or the{" "}
        <Link href="/archive">archive</Link>.
      </p>
    </>
  );
}
