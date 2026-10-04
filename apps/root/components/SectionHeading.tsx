export function SectionHeading({
  number,
  title,
  id,
}: {
  number: string;
  title: string;
  id: string;
}) {
  return (
    <h2 id={id} className="rv-section-heading">
      <span className="rv-section-number" aria-hidden="true">
        {number}
      </span>
      {title}
    </h2>
  );
}
