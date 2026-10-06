/** Where each host serves its icons: Next.js `app/` file conventions or `public/`. */
const next = (app) => ({
  [`apps/${app}/app/favicon.ico`]: "favicon.ico",
  [`apps/${app}/app/icon.png`]: "icon.png",
  [`apps/${app}/app/apple-icon.png`]: "apple-touch-icon.png",
  // iOS also requests this URL without reading the page head.
  [`apps/${app}/public/apple-touch-icon.png`]: "apple-touch-icon.png",
  [`apps/${app}/public/icon-192.png`]: "icon-192.png",
  [`apps/${app}/public/icon-maskable.png`]: "icon-maskable.png",
});
const astro = (app) => ({
  [`apps/${app}/public/favicon.ico`]: "favicon.ico",
  [`apps/${app}/public/icon.png`]: "icon.png",
  [`apps/${app}/public/apple-touch-icon.png`]: "apple-touch-icon.png",
  [`apps/${app}/public/icon-192.png`]: "icon-192.png",
  [`apps/${app}/public/icon-maskable.png`]: "icon-maskable.png",
});

export const appCopies = {
  ...next("root"),
  ...next("dump"),
  ...astro("docs"),
  ...astro("lab"),
};
