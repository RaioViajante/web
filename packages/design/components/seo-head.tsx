import { isSearchPath, socialUrl } from "../seo";
export function SeoHead({
  origin,
  site,
  path,
  title,
  description,
  noindex = false,
  themeColor,
}: {
  origin: string;
  site: string;
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
  themeColor?: string;
}) {
  const image = socialUrl(origin, path);
  return (
    <>
      {!noindex && <link rel="canonical" href={new URL(path, origin).href} />}
      {/* The search page is noindex but keeps its bare canonical. */}
      {(noindex || isSearchPath(path)) && (
        <meta name="robots" content="noindex, follow" />
      )}
      {themeColor && <meta name="theme-color" content={themeColor} />}
      <meta property="og:site_name" content={site} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={new URL(path, origin).href} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
    </>
  );
}
